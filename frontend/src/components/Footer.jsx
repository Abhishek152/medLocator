import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 mt-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="font-bold text-slate-900 text-sm">Med<span className="text-primary-600">Locator</span></span>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed">
              Helping you find trusted clinics, diagnostic labs, and healthcare services near you.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Services</h4>
            <ul className="space-y-2.5">
              <li><Link to="/clinics" className="text-sm text-slate-500 hover:text-primary-600 transition-colors">Find Clinics</Link></li>
              <li><Link to="/labs" className="text-sm text-slate-500 hover:text-primary-600 transition-colors">Symptom Checker</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-2.5">
              <li><Link to="/privacy" className="text-sm text-slate-500 hover:text-primary-600 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-sm text-slate-500 hover:text-primary-600 transition-colors">Terms of Service</Link></li>
              <li><Link to="/disclaimer" className="text-sm text-slate-500 hover:text-primary-600 transition-colors">Medical Disclaimer</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Contact</h4>
            <ul className="space-y-2.5">
              <li className="text-sm text-slate-500">support@medlocator.in</li>
              <li className="text-sm text-slate-500">Delhi, India</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-100 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-400 text-xs">
            © {new Date().getFullYear()} MedLocator Healthcare Services Pvt. Ltd. All rights reserved.
          </p>
          <p className="text-slate-400 text-xs">
            This platform does not provide medical advice. Always consult a qualified healthcare provider.
          </p>
        </div>
      </div>
    </footer>
  );
}
