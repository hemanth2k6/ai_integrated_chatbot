
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Contact — K Hemanth',
}

export default function ContactPage() {
    return (
        <div className="max-w-lg">
            <h1 className="text-4xl font-bold mb-2">Get in touch</h1>
            <p className="text-gray-500 mb-10">
                I'm currently open to new opportunities. Feel free to reach out.
            </p>

            <div className="space-y-4">
                <a
                    href="mailto:john@example.com"
                    className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-gray-400 transition-colors"
                >
                    <span className="text-2xl">✉️</span>
                    <div>
                        <p className="font-medium">Email</p>
                        <p className="text-gray-500 text-sm">hemanthkalapati2006@gmail.com</p>
                    </div>
                </a>

                <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-gray-400 transition-colors"
                >
                    <span className="text-2xl">💻</span>
                    <div>
                        <p className="font-medium">GitHub</p>
                        <p className="text-gray-500 text-sm">github.com/hemanth2k6</p>
                    </div>
                </a>

                <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-gray-400 transition-colors"
                >
                    <span className="text-2xl">🔗</span>
                    <div>
                        <p className="font-medium">LinkedIn</p>
                        <p className="text-gray-500 text-sm">linkedin.com/in/hemanth</p>
                    </div>
                </a>
            </div>
        </div>
    )
}