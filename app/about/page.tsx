
import type { Metadata } from 'next'


export const metadata: Metadata = {
    title: 'About — K Hemanth',
}

export default function AboutPage() {
    const skills = ['TypeScript', 'React', 'Next.js', 'Node.js', 'Tailwind CSS', 'PostgreSQL']

    return (
        <div className="max-w-2xl">
            <h1 className="text-4xl font-bold mb-6">About me</h1>

            <p className="text-gray-600 text-lg mb-6">
                I'm a full-stack developer with a passion for building clean, fast, and
                user-friendly web applications. I care about writing readable code and
                shipping things that actually work.
            </p>

            <p className="text-gray-600 text-lg mb-10">
                When I'm not coding, I'm writing about what I learn on my blog.
            </p>

            <h2 className="text-2xl font-semibold mb-4">Skills</h2>
            <div className="flex flex-wrap gap-3">
                {skills.map((skill) => (
                    <span
                        key={skill}
                        className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-medium"
                    >
                        {skill}
                    </span>
                ))}
            </div>
        </div>
    )
}