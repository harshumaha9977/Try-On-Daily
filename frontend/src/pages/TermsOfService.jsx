import React from 'react';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service – TRY ON DAILY</h1>
        <p className="text-gray-600 mb-4">Effective Date: May 4, 2026</p>

        <p className="mb-8">By using TRY ON DAILY, you agree to the following terms:</p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Platform Usage</h2>
          <p className="text-gray-700 mb-4">TRY ON DAILY provides AI-based virtual try-on services for fashion products.</p>
          <p className="text-gray-700">Users agree to use the platform only for lawful purposes.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">User Content</h2>
          <p className="text-gray-700 mb-4">Users are responsible for the images they upload.</p>
          <p className="mb-2">Users must not upload:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Illegal content</li>
            <li>Copyright-infringing content</li>
            <li>Harmful or abusive content</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Accuracy Disclaimer</h2>
          <p className="text-gray-700">Virtual try-on results are AI-generated previews and may differ from real-life fitting.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Intellectual Property</h2>
          <p className="text-gray-700">All platform branding, UI, designs, software, and AI systems belong to TRY ON DAILY.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Service Availability</h2>
          <p className="text-gray-700">We may update, suspend, or modify features at any time.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Limitation of Liability</h2>
          <p className="text-gray-700">TRY ON DAILY is not responsible for purchase decisions made based on AI previews.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Contact</h2>
          <p className="text-gray-700">Email: <a href="mailto:tryondailyer@gmail.com" className="text-indigo-600 hover:underline">tryondailyer@gmail.com</a></p>
        </section>

        <p className="text-sm text-gray-500 mt-12 border-t pt-6">By using TRY ON DAILY, you agree to these Terms of Service.</p>
      </div>
    </div>
  );
};

export default TermsOfService;
