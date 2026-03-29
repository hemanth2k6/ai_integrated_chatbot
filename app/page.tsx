
import Link from 'next/link'

export default function Home() {
  return (
    <div className="py-20">
      <p className="text-lg text-gray-500 mb-2">Hi, I'm</p>
      <h1 className="text-5xl font-bold text-gray-900 mb-4">
        John Doe
      </h1>
      <p className="text-xl text-gray-600 max-w-xl mb-8">
        A full-stack developer building modern web apps with React and Next.js.
        Currently open to new opportunities.
      </p>
      <div className="flex gap-4">
        <Link
          href="/projects"
          className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
        >
          View my work
        </Link>
        <Link
          href="/contact"
          className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:border-gray-500 transition-colors"
        >
          Get in touch
        </Link>
      </div>
    </div>
  )
}