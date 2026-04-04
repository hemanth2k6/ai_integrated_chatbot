import { ChatArea } from "@/components/ChatArea";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function Home(props: Props) {
  const params = await props.searchParams;
  const chatId = typeof params?.c === 'string' ? params.c : undefined;
  
  return (
    <main className="h-full w-full">
      <ChatArea chatId={chatId} />
    </main>
  );
}
