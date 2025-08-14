// src/components/landing/LandingRevolt.tsx
import React from 'react';
import { motion } from 'framer-motion';

const MotionDiv = motion.div as any;

const revoltPoints = [
    {
        title: "The Complexity Flaw",
        negative: "The platform's sheer power can be overwhelming for new users. The learning curve is steep because the scope is immense.",
        positive: "This is intentional. We are not a 'drawing tool'; we are an Operating System for reality. Through Progressive Disclosure, complexity is revealed only when needed. The AI-powered Nexus Advisor proactively guides your journey, turning complexity into mastery.",
        icon: "🧭"
    },
    {
        title: "The AI Imperfection Flaw",
        negative: "Like any generative AI, our models can sometimes produce outputs that are unconventional or 'hallucinate'.",
        positive: "This is why Dakshin Vaarahi must exist. We surround the AI with a proprietary scaffold of architectural law, Vastu principles, and building codes. The architect is the master, using the AI as the world's most brilliant intern. Every correction you make trains our Akasha Engine, fueling the perfection of tomorrow.",
        icon: "🧠"
    },
    {
        title: "The Computational Cost Flaw",
        negative: "Running the most powerful analysis engines consumes significant computational resources, which translates to a real cost in AI Credits.",
        positive: "We reframe this not as a cost, but as an unprecedented return on investment. What once required weeks and expensive teams of consultants is now available in minutes. We democratize the power of a multinational firm, making it accessible on a pay-per-use basis.",
        icon: "⚡"
    },
    {
        title: "The Integration Flaw",
        negative: "Dakshin Vaarahi is a powerful end-to-end ecosystem, but it doesn't yet seamlessly integrate with every legacy tool and workflow.",
        positive: "This was a strategic decision to first forge the perfect, unbroken workflow. Now, we begin Phase Two. Through our Developer Hub & Public API, Dakshin Vaarahi becomes the foundational infrastructure for the future of AEC, allowing any firm to plug our divine intelligence directly into their existing systems.",
        icon: "🔗"
    }
];

const RevoltCard: React.FC<{ point: typeof revoltPoints[0], index: number }> = ({ point, index }) => {
    return (
        <MotionDiv
            className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 overflow-hidden"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: index * 0.15, ease: 'easeOut' }}
        >
            <div className="flex items-start gap-4">
                <div className="text-4xl">{point.icon}</div>
                <div>
                    <h3 className="text-xl font-bold text-white mb-2">{point.title}</h3>
                    <div className="mb-4">
                        <p className="text-xs font-semibold uppercase text-red-400/80 tracking-wider">The Negative</p>
                        <p className="text-sm text-slate-400 italic">"{point.negative}"</p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase text-primary/80 tracking-wider">The Positive Transformation</p>
                        <p className="text-sm text-slate-200">{point.positive}</p>
                    </div>
                </div>
            </div>
        </MotionDiv>
    );
};

export const LandingRevolt: React.FC = () => {
    return (
        <section className="py-16 md:py-24 bg-background">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12 md:mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                        Our Revolt is Turning Flaws Into Strengths
                    </h2>
                    <p className="text-lg text-slate-300 max-w-3xl mx-auto font-body">
                        A system that cannot recognize its own limitations is destined for obsolescence. We embrace our challenges, for they illuminate the path of our unending revolt.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {revoltPoints.map((point, index) => (
                        <RevoltCard key={point.title} point={point} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
};