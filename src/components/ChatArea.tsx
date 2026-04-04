"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowUp, Bot, User, Mic, Square, Paperclip, X } from "lucide-react";
import { useRouter } from "next/navigation";

export function ChatArea({ chatId }: { chatId?: string }) {
  const [messages, setMessages] = useState<Array<{ role: string, content: string, audioUrl?: string | null, fileUrl?: string | null }>>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isIntroLoading, setIsIntroLoading] = useState(!!chatId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);
  const [pendingAudioUrl, setPendingAudioUrl] = useState<string | null>(null);

  // File attachment state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFileUrl, setPendingFileUrl] = useState<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pendingFileUrl]);

  useEffect(() => {
    if (chatId) {
      setIsIntroLoading(true);
      fetch(`/api/chats/${chatId}/messages`)
        .then(res => res.json())
        .then(data => {
          if (data && data.messages) {
            setMessages(data.messages);
          }
        })
        .catch(() => {})
        .finally(() => setIsIntroLoading(false));
    } else {
      setMessages([]);
      setIsIntroLoading(false);
    }
    setPendingAudioUrl(null);
    setPendingFileUrl(null);
  }, [chatId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPendingFileUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearAttachment = () => {
    setPendingFileUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          setPendingAudioUrl(reader.result as string);
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.continuous = true;
        recognition.interimResults = true;
        
        let currentFinal = input;
        
        recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let newFinal = '';
          
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              newFinal += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }
          
          if (newFinal) {
            currentFinal = currentFinal + (currentFinal ? ' ' : '') + newFinal;
          }
          
          setInput(currentFinal + (currentFinal && interimTranscript ? ' ' : '') + interimTranscript);
        };
        
        recognition.start();
      }
    } catch (err) {
      alert("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRecording) {
      stopRecording();
      await new Promise(r => setTimeout(r, 100)); // allow blob to generate
    }

    if (!input.trim() && !pendingAudioUrl && !pendingFileUrl || isLoading) return;

    const userMessage = input;
    let currentAudioUrl = pendingAudioUrl; 
    let currentFileUrl = pendingFileUrl;
    
    setInput("");
    setPendingAudioUrl(null);
    setPendingFileUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    const newMessages = [...messages, { role: "user", content: userMessage, audioUrl: currentAudioUrl, fileUrl: currentFileUrl }];
    setMessages(newMessages);
    setIsLoading(true);

    const targetChatId = chatId || ("chat-" + Date.now());

    try {
      const response = await fetch(`/api/chats/${targetChatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // IMPORTANT: Must pass the modified newMessages to the backend
        body: JSON.stringify({ messages: newMessages, audioUrl: currentAudioUrl }),
      });

      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }
      
      if (!chatId) {
        router.push(`/?c=${targetChatId}`);
      }
      
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No readable stream");
      
      const decoder = new TextDecoder();
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        setMessages(prev => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          updated[lastIndex] = { ...updated[lastIndex], content: updated[lastIndex].content + text };
          return updated;
        });
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: `\nError connecting to AI service.` }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isIntroLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#0b1121] text-slate-500 space-y-4">
        <Bot className="w-16 h-16 text-blue-500 animate-pulse" />
        <p className="text-lg animate-pulse">Loading chat...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0b1121] relative">
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
            <Bot className="w-16 h-16 text-blue-500" />
            <p className="text-lg">Send a message to start chatting.</p>
          </div>
        ) : (
          messages.map((m, idx) => (
            <div key={idx} className={`flex gap-4 ${m.role === 'user' ? 'justify-end' : ''}`}>
              {m.role !== 'user' && (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center shrink-0 shadow-lg">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              <div className={`rounded-2xl px-5 py-3.5 max-w-[85%] shadow-md ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-200'}`}>
                {m.fileUrl && (
                  <div className="mb-3">
                    <img src={m.fileUrl} alt="Attachment" className="max-w-xs sm:max-w-sm rounded-lg border border-slate-700/50" />
                  </div>
                )}
                {m.audioUrl && (
                  <div className="mb-2 w-full max-w-xs">
                    <audio controls src={m.audioUrl} className="w-full h-8 outline-none" />
                  </div>
                )}
                <div className="whitespace-pre-wrap">{m.content}</div>
              </div>
              {m.role === 'user' && (
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center shrink-0 shadow-lg overflow-hidden">
                  <User className="w-5 h-5" />
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 pb-6">
        {pendingFileUrl && (
          <div className="max-w-4xl mx-auto mb-3 pl-4 flex items-center gap-4">
            <div className="relative inline-block group">
              <img src={pendingFileUrl} alt="Pending attachment" className="h-20 w-auto rounded-lg border border-slate-700 object-cover" />
              <button 
                onClick={clearAttachment} 
                className="absolute -top-2 -right-2 bg-slate-800 border border-slate-600 text-slate-300 rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20 hover:text-red-400"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-4xl mx-auto items-end">
          <div className={`flex-1 bg-slate-900 rounded-2xl flex items-end border transition-colors ${isRecording ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-slate-800 focus-within:border-blue-500/50 focus-within:shadow-[0_0_15px_rgba(59,130,246,0.1)]'}`}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e as any);
                }
              }}
              rows={1}
              placeholder={isRecording ? "Casting your voice safely..." : "Message..."}
              className="w-full bg-transparent text-slate-200 px-4 py-4 resize-none outline-none max-h-32"
            />
            {pendingAudioUrl ? (
               <div className="p-3">
                 <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" title="Voice recorded" />
               </div>
            ) : null}
            
            {/* Hidden file input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*"
            />
            
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              className="p-3 mr-1 mb-1 rounded-xl transition-all text-slate-400 hover:text-blue-400 hover:bg-blue-500/10"
              title="Attach image"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            
            <button 
              type="button" 
              onClick={toggleRecording}
              className={`p-3 mr-1 mb-1 rounded-xl transition-all ${isRecording ? 'text-red-400 hover:bg-red-500/10' : 'text-slate-400 hover:text-blue-400 hover:bg-blue-500/10'}`}
              title={isRecording ? "Stop recording" : "Record voice message"}
            >
              {isRecording ? <Square className="w-5 h-5 fill-current" /> : <Mic className="w-5 h-5" />}
            </button>
          </div>
          
          <button type="submit" disabled={isLoading || (!input.trim() && !pendingAudioUrl && !pendingFileUrl)} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 rounded-full p-4 mb-0 transition-transform active:scale-95 shadow-[0_0_15px_rgba(59,130,246,0.3)] shrink-0 self-end">
            <ArrowUp className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}