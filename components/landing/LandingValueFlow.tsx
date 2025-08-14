
// src/components/landing/LandingValueFlow.tsx
import React from 'react';
import { motion } from 'framer-motion';
const MotionDiv = motion.div as any;

const steps = [
  {
    icon: '💬',
    title: 'Prompt',
    description: "Describe your vision in plain English. From 'a 2BHK Vastu home' to 'a mixed-use development in Hyderabad'.",
  },
  {
    icon: '🧠',
    title: 'Design',
    description: 'Our AI engines translate your idea into detailed 2D floor plans, 3D models, and even entire master plans.',
  },
  {
    icon: '📊',
    title: 'Analyze',
    description: 'Instantly generate reports for structural integrity, sustainability, Vastu compliance, and cost estimation.',
  },
  {
    icon: '🏗️',
    title: 'Construct',
    description: 'Generate GFC drawings, 4D simulations, and fabrication files to bridge the gap from digital to physical.',
  },
];

export const LandingValueFlow: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            The End-to-End Architectural Operating System
          </h2>
          <p className="text-lg text-slate-300 max-w-3xl mx-auto font-body">
            From a single thought to a fully realized structure, AuraOS automates and elevates every step of the architectural lifecycle.
          </p>
        </div>

        <div className="relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-700 -translate-y-1/2"></div>
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5">
            <MotionDiv
              className="h-full bg-gradient-to-r from-sky-500 to-purple-500"
              initial={{ width: '0%' }}
              whileInView={{ width: '100%' }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 2, ease: 'easeInOut' }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <MotionDiv
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="relative z-10 bg-slate-800 p-6 rounded-xl border border-slate-700 text-center"
              >
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-slate-700 mx-auto mb-4 text-3xl">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-400">{step.description}</p>
              </MotionDiv>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};