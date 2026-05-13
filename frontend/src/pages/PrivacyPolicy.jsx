import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy – TRY ON DAILY</h1>
        <p className="text-gray-600 mb-4">Effective Date: May 4, 2026</p>
        
        <p className="mb-6">Welcome to TRY ON DAILY.</p>
        <p className="mb-8">TRY ON DAILY is an AI-powered virtual fashion try-on platform that allows users to upload images and preview clothing, accessories, and fashion products virtually.</p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Information We Collect</h2>
          <p className="mb-2">We may collect:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Name</li>
            <li>Email address</li>
            <li>Phone number</li>
            <li>Profile images uploaded by users</li>
            <li>Device/browser information</li>
            <li>Usage analytics</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">How We Use Your Information</h2>
          <p className="mb-2">We use your information to:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Generate virtual try-on results</li>
            <li>Improve AI fitting accuracy</li>
            <li>Improve app performance</li>
            <li>Provide customer support</li>
            <li>Send service updates</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Image Processing</h2>
          <p className="text-gray-700">User-uploaded images may be processed using AI and computer vision models to generate virtual try-on previews.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Data Security</h2>
          <p className="text-gray-700">We implement reasonable security measures to protect your data.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Data Sharing</h2>
          <p className="text-gray-700">We do not sell personal user data to third parties.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">User Rights</h2>
          <p className="text-gray-700">Users may request deletion of their uploaded data by contacting support.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Contact</h2>
          <p className="text-gray-700">Email: <a href="mailto:tryondailyer@gmail.com" className="text-indigo-600 hover:underline">tryondailyer@gmail.com</a></p>
        </section>

        <p className="text-sm text-gray-500 mt-12 border-t pt-6">By using TRY ON DAILY, you agree to this Privacy Policy.</p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
