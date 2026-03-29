// components/Navbar.tsx
import Link from 'next/link'

export default function Navbar() {
    return (
        <header className="border-b border-gray-200 px-6 py-4">
            <nav className="max-w-4xl mx-auto flex items-center justify-between">
                <Link href="/" className="text-xl font-bold text-gray-900">
                    John Doe
                </Link>
                <ul className="flex gap-6 text-sm font-medium text-gray-600">
                    <li><Link href="/about" className="hover:text-gray-900 transition-colors">About</Link></li>
                    <li><Link href="/projects" className="hover:text-gray-900 transition-colors">Projects</Link></li>
                    <li><Link href="/blog" className="hover:text-gray-900 transition-colors">Blog</Link></li>
                    <li><Link href="/contact" className="hover:text-gray-900 transition-colors">Contact</Link></li>
                </ul>
            </nav>
        </header>
    )
}