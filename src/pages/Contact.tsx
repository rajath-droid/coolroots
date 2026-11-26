import { CheckCircle2, ChevronDown, Mail, MapPin, Phone } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { useStore } from '../context/StoreContext';

const FAQS = [
  {
    q: 'Do terracotta cooling towers and khus screens work in humid coastal cities?',
    a: 'Evaporative cooling works best in hot, dry airflow (below ~55% relative humidity). In humid coastal cities, bamboo chick blinds, jali panels, and lime-washed roof kits are far more effective because they block solar heat without adding indoor moisture.',
  },
  {
    q: 'Are the INR prices shown on the website final?',
    a: 'No. Prices currently listed on CoolRoots are illustrative prototype assumptions in INR so the storefront and checkout can be demonstrated.',
  },
  {
    q: 'Does CoolRoots offer installation for roof kits and custom jali panels?',
    a: 'Yes, the business model supports DIY kits with illustrated guides as well as optional local applicator or mason installation guidance for lime roofs, custom jali screens, and architectural courtyard consultations.',
  },
  {
    q: 'Do Courtyard Cooling Design packages include construction costs?',
    a: 'No. Courtyard Cooling Design packages (₹999 to ₹7,999 demo pricing) cover consultation, airflow markups, shading guidance, and planting recommendations only—civil construction and materials are separate.',
  },
];

export function Contact() {
  const { submitContactForm } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Product & Sizing Inquiry');
  const [message, setMessage] = useState('');
  const [confirmation, setConfirmation] = useState<{
    id: string;
    synced?: boolean;
    error?: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setSubmitting(true);
    try {
      const saved = await submitContactForm({
        name: name.trim(),
        email: email.trim(),
        subject,
        message: message.trim(),
      });
      setConfirmation({
        id: saved.id,
        synced: saved.syncedToSupabase,
        error: saved.supabaseError,
      });
      setName('');
      setEmail('');
      setMessage('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">
      <div className="max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#B84E32]">
          Customer Support & Inquiries · Demo Contact Page
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#261D17] mt-1">
          Contact CoolRoots
        </h1>
        <p className="mt-2 text-sm text-[#5A4C43] leading-relaxed">
          Have questions about custom window blind sizes, roof kit coverage, or courtyard
          consultations? Send a demo inquiry below or review frequently asked questions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-[#E2D9C9] p-6 sm:p-8">
          <h2 className="font-display text-xl font-semibold text-[#261D17] mb-5">
            Send a Message (Demo Form)
          </h2>

          {confirmation && (
            <div
              role="status"
              className="mb-6 p-4 rounded-xl bg-[#EEF4F0] border border-[#C3D6CA] flex items-start gap-3"
            >
              <CheckCircle2 className="w-5 h-5 text-[#1E3D2F] shrink-0 mt-0.5" aria-hidden="true" />
              <div className="text-sm text-[#1E3D2F]">
                <p className="font-semibold">Inquiry received ({confirmation.id})</p>
                <p className="text-xs text-[#2B5240] mt-0.5">
                  {confirmation.synced
                    ? 'Your inquiry was saved directly to the CoolRoots Supabase database.'
                    : `Saved locally in browser (${confirmation.error || 'run supabase/schema.sql to enable Supabase table sync'}).`}
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contact-name" className="block text-xs font-medium text-[#261D17] mb-1.5">
                  Your Name *
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-3.5 py-2.5 min-h-[42px] rounded-lg border border-[#D8CBB5] bg-[#FAF8F4] text-sm focus:bg-white focus:border-[#B84E32] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="contact-email" className="block text-xs font-medium text-[#261D17] mb-1.5">
                  Email Address *
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3.5 py-2.5 min-h-[42px] rounded-lg border border-[#D8CBB5] bg-[#FAF8F4] text-sm focus:bg-white focus:border-[#B84E32] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="contact-subject" className="block text-xs font-medium text-[#261D17] mb-1.5">
                Inquiry Topic
              </label>
              <select
                id="contact-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 min-h-[42px] rounded-lg border border-[#D8CBB5] bg-[#FAF8F4] text-sm focus:bg-white focus:border-[#B84E32] focus:outline-none"
              >
                <option>Product & Sizing Inquiry</option>
                <option>Lime Roof Coverage & Installation</option>
                <option>Custom Jali or Bamboo Blinds</option>
                <option>Courtyard Cooling Consultation</option>
                <option>Institutional / School / Bulk Order</option>
              </select>
            </div>

            <div>
              <label htmlFor="contact-message" className="block text-xs font-medium text-[#261D17] mb-1.5">
                Message *
              </label>
              <textarea
                id="contact-message"
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share your room/roof dimensions, city climate, or questions..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#D8CBB5] bg-[#FAF8F4] text-sm focus:bg-white focus:border-[#B84E32] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 min-h-[44px] rounded-lg bg-[#B84E32] text-white text-sm font-medium hover:bg-[#9E3F26] disabled:opacity-60 transition-colors cursor-pointer"
            >
              {submitting ? 'Submitting...' : 'Submit Inquiry'}
            </button>
          </form>
        </div>

        {/* Studio Details & Support */}
        <aside className="lg:col-span-5 space-y-6">
          <div className="bg-[#F2ECE1] rounded-xl border border-[#E2D9C9] p-6 space-y-4">
            <h2 className="font-display text-xl font-semibold text-[#261D17]">
              Customer Support (Demo Placeholders)
            </h2>
            <div className="space-y-3 text-sm text-[#4A3D34]">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#B84E32] shrink-0 mt-1" aria-hidden="true" />
                <div>
                  <p className="font-medium text-[#261D17]">Email Placeholder</p>
                  <p>hello@coolroots.example</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#B84E32] shrink-0 mt-1" aria-hidden="true" />
                <div>
                  <p className="font-medium text-[#261D17]">Phone Placeholder</p>
                  <p className="tabular-nums">+91 141 000 0000 (Mon–Sat, 9:30 AM – 6:30 PM IST)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#B84E32] shrink-0 mt-1" aria-hidden="true" />
                <div>
                  <p className="font-medium text-[#261D17]">Business Address Placeholder</p>
                  <p>42 Craft Courtyard Lane, C-Scheme, Jaipur, Rajasthan 302001, India</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E2D9C9] p-6 space-y-3">
            <h2 className="font-display text-xl font-semibold text-[#261D17]">
              Frequently Asked Questions
            </h2>
            <div className="divide-y divide-[#E2D9C9]">
              {FAQS.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={faq.q} className="py-3">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                      className="w-full flex items-start justify-between gap-3 text-left text-sm font-medium text-[#261D17] hover:text-[#B84E32] cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 shrink-0 mt-0.5 transition-transform ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                    {isOpen && (
                      <p className="mt-2 text-xs text-[#5A4C43] leading-relaxed">{faq.a}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
