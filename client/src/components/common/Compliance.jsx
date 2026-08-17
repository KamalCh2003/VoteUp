import { useState, useEffect, useRef } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  LockKeyhole,
  FileCheck2,
  Award,
  Accessibility,
  Scale,
  ChevronRight,
  Mail,
  Fingerprint,
  ClipboardCheck,
} from "lucide-react";

const sections = [
  { id: "data-protection", label: "Data Protection" },
  { id: "accessibility", label: "Accessibility" },
  { id: "aml-kyc", label: "AML & KYC" },
  { id: "regulatory", label: "Regulatory Compliance" },
];

const complianceHighlights = [
  {
    icon: ShieldCheck,
    title: "GDPR",
    description: "Data protection and privacy controls.",
    className: "bg-emerald-50 border-emerald-100 text-emerald-600",
  },
  {
    icon: CheckCircle2,
    title: "CCPA",
    description: "California privacy requirements.",
    className: "bg-blue-50 border-blue-100 text-blue-600",
  },
  {
    icon: Fingerprint,
    title: "AML & KYC",
    description: "Identity and fraud prevention.",
    className: "bg-amber-50 border-amber-100 text-amber-600",
  },
  {
    icon: Accessibility,
    title: "WCAG 2.1",
    description: "Accessible digital experiences.",
    className: "bg-violet-50 border-violet-100 text-violet-600",
  },
];

const dataProtectionItems = [
  {
    title: "Lawful Processing",
    text: "Personal information is processed based on an applicable legal basis such as consent, contract, legal obligation, or legitimate interest.",
  },
  {
    title: "Data Minimisation",
    text: "Only information necessary for the stated purposes should be collected and retained.",
  },
  {
    title: "Transparency",
    text: "Users are provided with clear information about data collection, processing, and their available rights.",
  },
  {
    title: "User Rights",
    text: "Users can request access, correction, deletion, or export of their personal information.",
  },
  {
    title: "Security",
    text: "Technical and organisational safeguards are used to protect information against unauthorized access and misuse.",
  },
];

const accessibilityItems = [
  {
    title: "Perceivable",
    text: "Text alternatives, captions, and adaptable layouts help make content accessible.",
  },
  {
    title: "Operable",
    text: "Navigation and interactions are designed to support keyboard access and clear focus states.",
  },
  {
    title: "Understandable",
    text: "Readable content, predictable navigation, and input assistance improve usability.",
  },
  {
    title: "Robust",
    text: "The platform is designed to work with assistive technologies and modern browsers.",
  },
];

const amlKycItems = [
  "Email and phone verification during registration.",
  "Monitoring of suspicious payment patterns.",
  "Identification of potentially fraudulent accounts and activity.",
  "Audit trails for transactions and voting activity.",
  "Cooperation with relevant authorities when legally required.",
];

const regulatoryItems = [
  {
    title: "Election Integrity",
    text: "Processes are designed to support applicable election and voting requirements.",
  },
  {
    title: "Data Protection",
    text: "Privacy practices account for applicable data protection and privacy requirements.",
  },
  {
    title: "Financial Security",
    text: "Payment-related processes incorporate applicable payment security and AML/KYC requirements.",
  },
  {
    title: "Consumer Protection",
    text: "Services are intended to follow applicable consumer protection and fair-trading requirements.",
  },
];

const certificationItems = [
  {
    title: "ISO 27001",
    text: "Information security management.",
  },
  {
    title: "SOC 2 Type II",
    text: "Security, availability, and confidentiality controls.",
  },
  {
    title: "PCI-DSS Level 1",
    text: "Payment card data security standards.",
  },
  {
    title: "EU-US Privacy Shield",
    text: "Data transfer compliance where applicable.",
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
        <li
          key={index}
          className="flex gap-3 text-sm leading-6 text-gray-600 sm:text-[15px]"
        >
          <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-violet-500" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function InfoCards({ items }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <div
          key={item.title}
          className="rounded-xl border border-gray-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md hover:shadow-violet-100/30"
        >
          <h3 className="text-sm font-semibold text-gray-900">{item.title}</h3>
          <p className="mt-1.5 text-sm leading-6 text-gray-500">{item.text}</p>
        </div>
      ))}
    </div>
  );
}

export default function Compliance() {
  const lastUpdated = new Date().toLocaleDateString();
  const [activeSection, setActiveSection] = useState("data-protection");
  const sectionRefs = useRef({});

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
      <section className="relative overflow-hidden border-b border-gray-200 bg-white">
        <div className="pointer-events-none absolute -left-32 -top-40 h-96 w-96 rounded-full bg-violet-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 top-10 h-96 w-96 rounded-full bg-indigo-200/30 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3.5 py-2 text-xs font-semibold text-violet-700">
              <FileCheck2 size={15} />
              Trust & Compliance
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-950 sm:text-5xl lg:text-6xl">
              Built with compliance in mind.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg sm:leading-8">
              VoteUp is designed around security, privacy, accessibility, and
              responsible platform operations. Our compliance framework helps
              create a trustworthy environment for voters and organizers.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <span className="rounded-full bg-gray-100 px-3 py-1.5">
                Compliance & Regulatory
              </span>
              <span>•</span>
              <span>Last updated: {lastUpdated}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[210px_minmax(0,1fr)] lg:gap-16">
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

          <div className="min-w-0">
            <section className="mb-14">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {complianceHighlights.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-gray-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-100/40"
                    >
                      <div
                        className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl border ${item.className}`}
                      >
                        <Icon size={18} />
                      </div>
                      <h3 className="font-semibold text-gray-950">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-gray-500">
                        {item.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            <section
              id="data-protection"
              className="scroll-mt-8 border-b border-gray-200 pb-12"
            >
              <SectionHeader
                icon={ShieldCheck}
                number="01"
                title="Data Protection"
                description="Our privacy approach focuses on responsible collection, processing, protection, and control of personal information."
              />
              <InfoCards items={dataProtectionItems} />
            </section>

            <section
              id="accessibility"
              className="scroll-mt-8 border-b border-gray-200 py-12"
            >
              <SectionHeader
                icon={Accessibility}
                number="02"
                title="Accessibility"
                description="We are committed to making VoteUp usable and accessible to people with different abilities."
              />
              <div className="mb-6 rounded-2xl border border-violet-100 bg-violet-50/60 p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                    <Accessibility size={19} />
                  </div>
                  <p className="text-sm leading-6 text-gray-600">
                    Our accessibility approach follows the principles of
                    WCAG 2.1 Level AA, covering perceivable, operable,
                    understandable, and robust experiences.
                  </p>
                </div>
              </div>
              <InfoCards items={accessibilityItems} />
            </section>

            <section
              id="aml-kyc"
              className="scroll-mt-8 border-b border-gray-200 py-12"
            >
              <SectionHeader
                icon={Fingerprint}
                number="03"
                title="AML, KYC & Fraud Prevention"
                description="Controls are used to help reduce fraud, identity theft, suspicious transactions, and vote manipulation."
              />
              <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-5 sm:p-6">
                <div className="mb-6 flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                    <AlertTriangle size={19} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Fraud prevention framework
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-gray-500">
                      VoteUp uses several controls intended to identify and
                      investigate suspicious activity.
                    </p>
                  </div>
                </div>
                <BulletList items={amlKycItems} />
              </div>
            </section>

            <section
              id="regulatory"
              className="scroll-mt-8 border-b border-gray-200 py-12"
            >
              <SectionHeader
                icon={Scale}
                number="04"
                title="Regulatory Compliance"
                description="Our platform is designed to operate with applicable legal, privacy, financial, and consumer protection requirements in mind."
              />
              <InfoCards items={regulatoryItems} />
            </section>

            <div className="relative overflow-hidden rounded-3xl bg-gray-950 p-7 text-white sm:p-9">
              <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-violet-600/30 blur-3xl" />
              <div className="relative">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                  <Mail size={19} />
                </div>
                <h2 className="text-xl font-bold sm:text-2xl">
                  Have a compliance concern?
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-gray-400">
                  Contact our compliance team if you have questions about
                  regulatory requirements, privacy, security, accessibility,
                  or platform controls.
                </p>
                <a
                  href="mailto:compliance@voteup.com"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-gray-950 transition hover:bg-violet-100"
                >
                  <Mail size={16} />
                  compliance@voteup.com
                </a>
                <p className="mt-4 text-xs text-gray-500">
                  Compliance reports are handled confidentially.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}