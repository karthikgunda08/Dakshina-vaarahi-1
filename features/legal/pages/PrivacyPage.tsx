// src/features/legal/pages/PrivacyPage.tsx
import React from 'react';
import { Header } from '../../../components/common/Header';
import { Footer } from '../../../components/common/Footer';

const PrivacyPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-primary mb-8">Privacy Policy</h1>
          <div className="prose prose-lg prose-invert text-slate-300">
            <p>Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform, Dakshin Vaarahi ("AuraOS").</p>
            
            <h2>1. Information We Collect</h2>
            <p>We may collect personal information that you provide to us directly, such as your name, email address, and payment information. We also collect information automatically when you use our service, such as your IP address, device type, and usage data. The architectural projects and data you create are stored on our secure servers.</p>

            <h2>2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide, operate, and maintain our services.</li>
              <li>Improve, personalize, and expand our services.</li>
              <li>Process your transactions and manage your account.</li>
              <li>Communicate with you, including for customer service and marketing purposes.</li>
              <li>Anonymously aggregate project data to train and improve our AI models. We will never use your personal or identifiable project data for training without your explicit consent.</li>
            </ul>

            <h2>3. Data Security</h2>
            <p>We use administrative, technical, and physical security measures to help protect your personal information and project data. While we have taken reasonable steps to secure the information you provide to us, please be aware that no security measures are perfect or impenetrable.</p>

            <p><em>(This is a placeholder document. A complete and legally-binding Privacy Policy would be required for a real-world launch.)</em></p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPage;