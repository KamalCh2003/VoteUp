import { useState, useEffect } from "react";
import {
  ShieldCheck,
  LockKeyhole,
  Eye,
  Cookie,
  Server,
  Users,
  ChevronRight,
  Mail,
  CheckCircle2,
} from "lucide-react";

const sections = [
  { id: "information", label: "Information We Collect" },
  { id: "usage", label: "How We Use Data" },
  { id: "security", label: "Data Security" },
  { id: "rights", label: "Your Rights" },
  { id: "cookies", label: "Cookies" },
  { id: "updates", label: "Policy Updates" },
];

const privacyHighlights = [
  {
    icon: LockKeyhole,
    title: "Secure by Design",
    description: "Your personal information is protected with strong security controls.",
  },
  {
    icon: Eye,
    title: "Transparent",
    description: "We explain what information we collect and why we need it.",
  },
  {
    icon: Users,
    title: "Your Control",
    description: "You can access, correct, or request deletion of your information.",
  },
];

const informationCollected = [
  {
    title: "Identity",
    text: "Name, date of birth, and profile picture when provided.",
  },
  {
    title: "Contact",
    text: "Email, phone number, and postal address when provided.",
  },
  {
    title: "Voting",
    text: "Election participation, voting choices, and vote timestamps.",
  },
  {
    title: "Technical",
    text: "IP address, browser, device information, operating system, and usage logs.",
  },
  {
    title: "Payment",
    text: "Transaction and billing information processed through secure payment gateways.",
  },
  {
    title: "Cookies",
    text: "Session information, preferences, and analytics identifiers.",
  },
];

const usageItems = [
  "Create and manage your account securely.",
  "Record votes and prevent duplicate voting.",
  "Process vote purchases and applicable refunds.",
  "Respond to support requests and resolve issues.",
  "Improve platform performance and user experience.",
  "Meet applicable legal and regulatory requirements.",
];

const securityItems = [
  "Encrypted data transmission and secure storage.",
  "Role-based access controls.",
  "Regular security assessments and audits.",
  "Monitoring for suspicious or unauthorized activity.",
  "Data minimisation and controlled data retention.",
];

const rightsItems = [
  "Access the personal information we hold about you.",
  "Request correction of inaccurate information.",
  "Request deletion where legally permitted.",
  "Restrict certain processing activities.",
  "Receive your information in a portable format.",
  "Withdraw consent for applicable processing activities.",
];

const cookieItems = [
  {
    title: "Essential",
    text: "Authentication, sessions, and security.",
  },
  {
    title: "Preferences",
    text: "Language and display preferences.",
  },
  {
    title: "Analytics",
    text: "Understanding how users interact with VoteUp.",
  },
  {
    title: "Functional",
    text: "Features such as notifications and live updates.",
  },
];

function SectionHeader({ icon: Icon, number, title, description }) {
  return (
    <div className="mb-7">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
          <Icon size={21} />
        </div>
        <div>
          <div className="mb-1 text-xs font-semibold uppercase tracking-[0.15em] text-violet-600">
            Section {number}
          </div>
          <h2 className="text-xl font-bold tracking-tight text-gray-950 sm:text-2xl">
            {title}
          </h2>
          {description && (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function BulletList({ items }) {
  return (
    <ul className="space-y-3">
      {items.map((item, index) => (
        <li key={index} className="flex gap-3 text-sm leading-6 text-gray-600 sm:text-[15px]">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-violet-500" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function PrivacyPolicy() {
  const lastUpdated = new Date().toLocaleDateString();
  const [activeSection, setActiveSection] = useState("information");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");
            if (id) setActiveSection(id);
          }
        });
      },
      {
        rootMargin: "0px 0px -30% 0px",
        threshold: 0.1,
      }
    );

    const sectionElements = sections.map((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
      return el;
    });

    return () => {
      sectionElements.forEach((el) => {
        if (el) observer.unobserve(el);
      });
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#fafafa] text-gray-900">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-gray-200 bg-white">
        <div className="pointer-events-none absolute -left-32 -top-40 h-96 w-96 rounded-full bg-violet-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 top-20 h-96 w-96 rounded-full bg-indigo-200/30 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3.5 py-2 text-xs font-semibold text-violet-700">
              <ShieldCheck size={15} />
              Privacy & Security
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-950 sm:text-5xl lg:text-6xl">
              Your privacy matters to us.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg sm:leading-8">
              VoteUp is committed to protecting your personal information and
              keeping your voting experience secure, transparent, and
              trustworthy.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <span className="rounded-full bg-gray-100 px-3 py-1.5">
                Privacy Policy
              </span>
              <span>•</span>
              <span>Last updated: {lastUpdated}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Layout */}
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[210px_minmax(0,1fr)] lg:gap-16">
          {/* Desktop Navigation */}
          <aside className="hidden lg:block">
            <div className="sticky top-8">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.15em] text-gray-400">
                On this page
              </p>
              <nav className="space-y-1">
                {sections.map((section, index) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className={`group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition ${
                      activeSection === section.id
                        ? "bg-violet-50 text-violet-700"
                        : "text-gray-500 hover:bg-violet-50 hover:text-violet-700"
                    }`}
                  >
                    <span>
                      {String(index + 1).padStart(2, "0")} {section.label}
                    </span>
                    <ChevronRight
                      size={15}
                      className={`transition ${
                        activeSection === section.id
                          ? "translate-x-0.5 opacity-100"
                          : "opacity-0 group-hover:translate-x-0.5 group-hover:opacity-100"
                      }`}
                    />
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <div className="min-w-0">
            {/* Highlights */}
            <section className="mb-14">
              <div className="grid gap-4 md:grid-cols-3">
                {privacyHighlights.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-gray-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-100/40"
                    >
                      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gray-950 text-white">
                        <Icon size={18} />
                      </div>
                      <h3 className="font-semibold text-gray-950">{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-gray-500">
                        {item.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Section 1 */}
            <section id="information" className="scroll-mt-8 border-b border-gray-200 pb-12">
              <SectionHeader
                icon={LockKeyhole}
                number="01"
                title="Information We Collect"
                description="We collect information needed to provide a secure and reliable voting platform."
              />
              <div className="grid gap-3 sm:grid-cols-2">
                {informationCollected.map((item) => (
                  <div key={item.title} className="rounded-xl border border-gray-200 bg-white p-4">
                    <h3 className="text-sm font-semibold text-gray-900">{item.title}</h3>
                    <p className="mt-1.5 text-sm leading-6 text-gray-500">{item.text}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 2 */}
            <section id="usage" className="scroll-mt-8 border-b border-gray-200 py-12">
              <SectionHeader
                icon={Eye}
                number="02"
                title="How We Use Your Information"
                description="Your information is used only for legitimate platform, security, support, and compliance purposes."
              />
              <BulletList items={usageItems} />
            </section>

            {/* Section 3 */}
            <section id="security" className="scroll-mt-8 border-b border-gray-200 py-12">
              <SectionHeader
                icon={ShieldCheck}
                number="03"
                title="Data Security"
                description="We use industry-standard practices to protect information from unauthorized access, misuse, or loss."
              />
              <div className="rounded-2xl border border-violet-100 bg-violet-50/60 p-5 sm:p-6">
                <BulletList items={securityItems} />
              </div>
            </section>

            {/* Section 4 */}
            <section id="rights" className="scroll-mt-8 border-b border-gray-200 py-12">
              <SectionHeader
                icon={Users}
                number="04"
                title="Your Rights"
                description="You have control over your personal information and can make requests regarding how it is handled."
              />
              <BulletList items={rightsItems} />
              <div className="mt-7 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-gray-900">Need help with your data?</p>
                  <p className="mt-1 text-sm text-gray-500">Contact our Data Protection Officer.</p>
                </div>
                <a
                  href="mailto:dpo@voteup.com"
                  className="inline-flex w-fit items-center gap-2 rounded-lg bg-gray-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-700"
                >
                  <Mail size={16} />
                  dpo@voteup.com
                </a>
              </div>
            </section>

            {/* Section 5 */}
            <section id="cookies" className="scroll-mt-8 border-b border-gray-200 py-12">
              <SectionHeader
                icon={Cookie}
                number="05"
                title="Cookies"
                description="Cookies help VoteUp provide essential functionality, remember preferences, and understand platform usage."
              />
              <div className="grid gap-3 sm:grid-cols-2">
                {cookieItems.map((item) => (
                  <div key={item.title} className="rounded-xl border border-gray-200 bg-white p-4">
                    <h3 className="text-sm font-semibold text-gray-900">{item.title} cookies</h3>
                    <p className="mt-1.5 text-sm leading-6 text-gray-500">{item.text}</p>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-sm leading-6 text-gray-500">
                You can manage your cookie preferences through your browser
                settings or the cookie consent options provided by VoteUp.
              </p>
            </section>

            {/* Section 6 */}
            <section id="updates" className="scroll-mt-8 py-12">
              <SectionHeader
                icon={Server}
                number="06"
                title="Policy Updates"
                description="Privacy practices may change as VoteUp evolves or legal requirements are updated."
              />
              <p className="text-sm leading-7 text-gray-600 sm:text-base">
                We may periodically update this Privacy Policy to reflect
                changes in our practices, technology, or legal requirements.
                The latest version will always be available on this page with
                the effective date clearly displayed. Significant changes may
                also be communicated through email or in-platform notifications.
              </p>
            </section>

            {/* Contact CTA */}
            <div className="relative overflow-hidden rounded-3xl bg-gray-950 p-7 text-white sm:p-9">
              <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-violet-600/30 blur-3xl" />
              <div className="relative">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                  <Mail size={19} />
                </div>
                <h2 className="text-xl font-bold sm:text-2xl">Questions about your privacy?</h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-gray-400">
                  Our support team is available to help with privacy,
                  security, and data-related questions.
                </p>
                <a
                  href="mailto:privacy@voteup.com"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-gray-950 transition hover:bg-violet-100"
                >
                  <Mail size={16} />
                  privacy@voteup.com
                </a>
                <p className="mt-4 text-xs text-gray-500">
                  We aim to respond to privacy inquiries within 48 hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}