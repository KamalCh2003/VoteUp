import { useState, useEffect } from "react";
import {
  FileText,
  ShieldCheck,
  CreditCard,
  UserX,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Mail,
  Scale,
  Ban,
} from "lucide-react";

const sections = [
  { id: "acceptance", label: "Acceptance of Terms" },
  { id: "accounts", label: "User Accounts" },
  { id: "voting", label: "Voting Rules" },
  { id: "payments", label: "Payments & Fees" },
  { id: "conduct", label: "Prohibited Conduct" },
  { id: "termination", label: "Termination" },
  { id: "disclaimers", label: "Disclaimers" },
];

const highlights = [
  {
    icon: CheckCircle2,
    title: "Fair Voting",
    description: "Follow election rules and vote only as permitted.",
    className: "bg-emerald-50 border-emerald-100 text-emerald-600",
  },
  {
    icon: AlertCircle,
    title: "Votes Are Final",
    description: "Submitted votes cannot be changed or withdrawn.",
    className: "bg-amber-50 border-amber-100 text-amber-600",
  },
  {
    icon: ShieldCheck,
    title: "No Fraud",
    description: "Bots, manipulation, impersonation, and abuse are prohibited.",
    className: "bg-violet-50 border-violet-100 text-violet-600",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description: "Payments are processed through trusted third-party gateways.",
    className: "bg-blue-50 border-blue-100 text-blue-600",
  },
];

const accountRules = [
  "Provide accurate and complete information during registration.",
  "Keep your login credentials confidential and secure.",
  "Accept responsibility for activity performed through your account.",
  "Notify VoteUp immediately if you suspect unauthorized access.",
];

const votingRules = [
  {
    title: "One vote per election",
    text: "Each user may cast one vote unless an organizer has enabled paid multiple-vote packages.",
  },
  {
    title: "Votes cannot be changed",
    text: "Once a vote has been submitted, it is final and cannot be altered.",
  },
  {
    title: "No automated voting",
    text: "Scripts, bots, or other automated methods of voting are strictly prohibited.",
  },
  {
    title: "No vote selling",
    text: "Trading votes for money, services, or other incentives is not permitted.",
  },
  {
    title: "No impersonation",
    text: "You may only vote for yourself and may not vote on behalf of another person.",
  },
];

const paymentRules = [
  "Pay applicable fees in full when making a purchase.",
  "Vote-related fees are non-refundable once the vote has been cast.",
  "Provide accurate billing information and authorize the selected payment method.",
  "Transactions may be handled through third-party payment processors.",
];

const prohibitedConduct = [
  "Attempting to bypass security controls or access restricted areas.",
  "Uploading or distributing malware, harmful, hateful, or defamatory content.",
  "Disrupting elections, voting processes, results, or platform performance.",
  "Impersonating another person, organization, or entity.",
  "Manipulating votes or using stolen payment methods.",
  "Engaging in activity that violates applicable laws.",
];

const terminationRules = [
  "Violation of these Terms of Service.",
  "Suspected fraudulent or illegal activity.",
  "Requests from law enforcement or regulatory authorities.",
  "Extended account inactivity.",
  "Other circumstances where account suspension or termination is reasonably necessary.",
];

const disclaimerRules = [
  "The service may occasionally be unavailable or contain errors.",
  "Voting results may not be completely free from technical issues or manipulation.",
  "Third-party services such as payment gateways may experience failures.",
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

export default function TermsOfService() {
  const lastUpdated = new Date().toLocaleDateString();
  const [activeSection, setActiveSection] = useState("acceptance");

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
        <div className="pointer-events-none absolute -right-32 top-10 h-96 w-96 rounded-full bg-indigo-200/30 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3.5 py-2 text-xs font-semibold text-violet-700">
              <Scale size={15} />
              Terms & Conditions
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-950 sm:text-5xl lg:text-6xl">
              Simple rules for a fair voting experience.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg sm:leading-8">
              These Terms explain the rules that apply when you access or use
              VoteUp. Please read them carefully before participating in an
              election or making a purchase.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <span className="rounded-full bg-gray-100 px-3 py-1.5">
                Terms of Service
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
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {highlights.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-gray-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-100/40"
                    >
                      <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl border ${item.className}`}>
                        <Icon size={18} />
                      </div>
                      <h3 className="font-semibold text-gray-950">{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-gray-500">{item.description}</p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 01 Acceptance */}
            <section id="acceptance" className="scroll-mt-8 border-b border-gray-200 pb-12">
              <SectionHeader
                icon={FileText}
                number="01"
                title="Acceptance of Terms"
                description="Using VoteUp means that you agree to follow these Terms."
              />
              <p className="text-sm leading-7 text-gray-600 sm:text-base">
                By accessing or using VoteUp, you agree to be bound by these
                Terms of Service. If you do not agree with these terms, you
                should not use the platform. We may update the Terms from time
                to time, and continued use of VoteUp after an update means you
                accept the revised terms.
              </p>
            </section>

            {/* 02 Accounts */}
            <section id="accounts" className="scroll-mt-8 border-b border-gray-200 py-12">
              <SectionHeader
                icon={ShieldCheck}
                number="02"
                title="User Accounts"
                description="A valid account is required to vote or participate on VoteUp."
              />
              <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
                <p className="mb-5 text-sm leading-6 text-gray-500">
                  When creating and using your account, you are responsible
                  for keeping your information accurate and protecting your
                  account credentials.
                </p>
                <BulletList items={accountRules} />
              </div>
            </section>

            {/* 03 Voting Rules */}
            <section id="voting" className="scroll-mt-8 border-b border-gray-200 py-12">
              <SectionHeader
                icon={CheckCircle2}
                number="03"
                title="Voting Rules"
                description="VoteUp is designed around fair and transparent election participation."
              />
              <div className="grid gap-3">
                {votingRules.map((rule, index) => (
                  <div key={rule.title} className="flex gap-4 rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-xs font-bold text-violet-600">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{rule.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-gray-500">{rule.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 04 Payments */}
            <section id="payments" className="scroll-mt-8 border-b border-gray-200 py-12">
              <SectionHeader
                icon={CreditCard}
                number="04"
                title="Payments & Fees"
                description="Paid voting features may involve third-party payment services."
              />
              <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5 sm:p-6">
                <div className="mb-5 flex items-start gap-3">
                  <CreditCard size={20} className="mt-0.5 shrink-0 text-blue-600" />
                  <p className="text-sm leading-6 text-blue-900/70">
                    Payments are processed through secure third-party gateways.
                    By making a purchase, you agree to the conditions below.
                  </p>
                </div>
                <BulletList items={paymentRules} />
              </div>
            </section>

            {/* 05 Prohibited Conduct */}
            <section id="conduct" className="scroll-mt-8 border-b border-gray-200 py-12">
              <SectionHeader
                icon={Ban}
                number="05"
                title="Prohibited Conduct"
                description="Protecting election integrity requires every participant to use the platform responsibly."
              />
              <div className="rounded-2xl border border-red-100 bg-red-50/50 p-5 sm:p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 text-red-600">
                    <UserX size={18} />
                  </div>
                  <p className="text-sm font-semibold text-red-900">
                    The following activities are not allowed.
                  </p>
                </div>
                <ul className="space-y-3">
                  {prohibitedConduct.map((item, index) => (
                    <li key={index} className="flex gap-3 text-sm leading-6 text-gray-600">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* 06 Termination */}
            <section id="termination" className="scroll-mt-8 border-b border-gray-200 py-12">
              <SectionHeader
                icon={UserX}
                number="06"
                title="Termination"
                description="VoteUp may restrict or terminate accounts when necessary to protect the platform and its users."
              />
              <BulletList items={terminationRules} />
            </section>

            {/* 07 Disclaimers */}
            <section id="disclaimers" className="scroll-mt-8 py-12">
              <SectionHeader
                icon={AlertCircle}
                number="07"
                title="Disclaimers & Limitations"
                description="VoteUp is provided on an 'as is' and 'as available' basis."
              />
              <p className="mb-6 text-sm leading-7 text-gray-600 sm:text-base">
                While we work to provide a reliable and secure voting platform,
                some aspects of the service depend on technology and third-party
                providers. Therefore, we cannot guarantee that every part of
                the platform will always operate without interruption or error.
              </p>
              <BulletList items={disclaimerRules} />
              <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-5">
                <p className="text-sm leading-6 text-gray-500">
                  To the fullest extent permitted by applicable law, VoteUp
                  disclaims liability for direct, indirect, incidental, or
                  consequential damages arising from your use of the platform.
                </p>
              </div>
            </section>

            {/* Support CTA */}
            <div className="relative overflow-hidden rounded-3xl bg-gray-950 p-7 text-white sm:p-9">
              <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-violet-600/30 blur-3xl" />
              <div className="relative">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                  <Mail size={19} />
                </div>
                <h2 className="text-xl font-bold sm:text-2xl">Questions about these terms?</h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-gray-400">
                  If you have questions about voting rules, payments, your
                  account, or these Terms of Service, our support team can
                  help.
                </p>
                <a
                  href="mailto:support@voteup.com"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-gray-950 transition hover:bg-violet-100"
                >
                  <Mail size={16} />
                  support@voteup.com
                </a>
                <p className="mt-4 text-xs text-gray-500">
                  We typically respond within 24 hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}