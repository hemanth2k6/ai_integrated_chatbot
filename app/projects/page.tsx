
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Projects — Hemanth',
}

const projects = [
  {
    id: 1,
    title: 'Task Manager App',
    description: 'A full-stack CRUD app built with Next.js and PostgreSQL.',
    tech: ['Next.js', 'TypeScript', 'Tailwind'],
    href: 'https://github.com',
  },
  {
    id: 2,
    title: 'Weather Dashboard',
    description: 'Real-time weather app using the OpenWeather API.',
    tech: ['React', 'API Routes', 'Chart.js'],
    href: 'https://github.com',
  },
  {
    id: 3,
    title: 'Portfolio & Blog',
    description: 'This site — built with Next.js App Router and Tailwind CSS.',
    tech: ['Next.js', 'Tailwind', 'MDX'],
    href: 'https://github.com',
  },
]

export default function ProjectsPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">Projects</h1>
      <p className="text-gray-500 mb-10">Things I've built</p>

      <div className="grid gap-6">
        {projects.map((project) => (
          <a
            key={project.id}
            href={project.href}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-gray-200 rounded-xl p-6 hover:border-gray-400 transition-colors group"
          >
            <h2 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition-colors">
              {project.title} →
            </h2>
            <p className="text-gray-600 mb-4">{project.description}</p>
            <div className="flex gap-2">
              {project.tech.map((t) => (
                <span key={t} className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">
                  {t}
                </span>
              ))}
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}