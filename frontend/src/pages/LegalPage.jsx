const CONTENT = {
  privacy: {
    title: 'Privacy Policy',
    lastUpdated: 'March 2026',
    sections: [
      {
        heading: '1. Information We Collect',
        body: 'We collect location data (with your permission) to show nearby clinics and labs. We also collect basic account information (name, email, phone) when you register. We do not sell your personal data to any third party.',
      },
      {
        heading: '2. How We Use Your Information',
        body: 'Your location is used solely to find nearby healthcare providers. Account information is used for authentication and to personalize your experience. Symptom data entered in the Symptom Checker is processed in real-time and is not stored permanently.',
      },
      {
        heading: '3. Data Security',
        body: 'We implement industry-standard security measures including encrypted connections (HTTPS), secure password hashing, and token-based authentication to protect your data.',
      },
      {
        heading: '4. Third-Party Services',
        body: 'We use Google Places API to fetch clinic and lab information. Google\'s own privacy policy applies to data processed by their services. We also use Google Gemini AI for symptom analysis — no personally identifiable information is sent to the AI service.',
      },
      {
        heading: '5. Your Rights',
        body: 'You may request deletion of your account and associated data at any time by contacting our support team. You can also revoke location permissions through your browser settings.',
      },
    ],
  },
  terms: {
    title: 'Terms of Service',
    lastUpdated: 'March 2026',
    sections: [
      {
        heading: '1. Acceptance of Terms',
        body: 'By accessing or using MedLocator, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.',
      },
      {
        heading: '2. Description of Service',
        body: 'MedLocator is a healthcare discovery platform that helps users find nearby clinics, diagnostic labs, and get AI-powered symptom analysis. We do not provide medical treatment, diagnosis, or prescriptions.',
      },
      {
        heading: '3. User Accounts',
        body: 'You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate information during registration and to update it as necessary.',
      },
      {
        heading: '4. Limitation of Liability',
        body: 'MedLocator provides information on an "as is" basis. We are not liable for the accuracy of clinic listings, availability, or the quality of healthcare services provided by third-party clinics.',
      },
      {
        heading: '5. Changes to Terms',
        body: 'We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the updated terms.',
      },
    ],
  },
  disclaimer: {
    title: 'Medical Disclaimer',
    lastUpdated: 'March 2026',
    sections: [
      {
        heading: 'Important Notice',
        body: 'MedLocator is a healthcare information and discovery tool. It is NOT a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.',
      },
      {
        heading: 'AI Symptom Checker',
        body: 'The AI-powered symptom analysis feature is designed to provide general health information only. Results from the symptom checker should not be interpreted as a medical diagnosis. The recommendations are meant to help you identify relevant medical tests and healthcare providers — not to replace a consultation with a licensed medical professional.',
      },
      {
        heading: 'Emergency Situations',
        body: 'If you are experiencing a medical emergency, call your local emergency number (e.g., 112 in India) immediately. Do not rely on this platform for emergency medical situations.',
      },
      {
        heading: 'Clinic Information',
        body: 'Clinic details, ratings, and availability information are sourced from third-party services and may not always be up to date. We recommend calling the clinic directly to confirm details before visiting.',
      },
    ],
  },
};

export default function LegalPage({ type }) {
  const page = CONTENT[type] || CONTENT.privacy;

  return (
    <div className="page-container max-w-3xl animate-fade-in">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-2">{page.title}</h1>
      <p className="text-sm text-slate-500 mb-8">Last updated: {page.lastUpdated}</p>

      <div className="space-y-8">
        {page.sections.map((section, i) => (
          <div key={i}>
            <h2 className="text-lg font-bold text-slate-800 mb-2">{section.heading}</h2>
            <p className="text-slate-600 leading-relaxed">{section.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
