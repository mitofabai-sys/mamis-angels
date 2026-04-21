import Link from 'next/link'
import Image from 'next/image'
import {
  BuildingOffice2Icon,
  HomeIcon,
  SparklesIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'

const services = [
  {
    title: 'Condo Cleaning',
    desc: 'Thorough cleaning for condos of all sizes, from studio to 4-bedroom.',
    Icon: BuildingOffice2Icon,
    emoji: '🏢',
  },
  {
    title: 'House Cleaning',
    desc: 'Full-service cleaning for houses of any layout, inside and out.',
    Icon: HomeIcon,
    emoji: '🏠',
  },
  {
    title: 'Add-on Services',
    desc: 'Dishwashing, fridge clean, sofa shampoo, cabinet cleaning and more.',
    Icon: SparklesIcon,
    emoji: '✨',
  },
  {
    title: 'Disinfection',
    desc: 'Disinfectant spray and fogging for full protection and peace of mind.',
    Icon: ShieldCheckIcon,
    emoji: '🛡️',
  },
]

const why = [
  { label: 'Vetted professionals', desc: 'Every cleaner is background-checked and trained.', emoji: '✅' },
  { label: 'Book in 3 minutes', desc: 'Simple online booking, no phone calls needed.', emoji: '⚡' },
  { label: 'SMS & email updates', desc: 'Instant confirmations and reminders sent to you.', emoji: '📱' },
  { label: 'Transparent pricing', desc: 'See the full cost upfront — no hidden fees.', emoji: '💰' },
]

export default function LandingPage() {
  return (
    <main className="bg-pixel-bg">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="flex flex-col lg:flex-row lg:items-center lg:gap-16">

          {/* Angel mascot */}
          <div className="flex-shrink-0 flex justify-center lg:justify-start">
            <Image
              src="/angel.png"
              alt="Mommy's Angels mascot"
              width={220}
              height={242}
              className="w-44 sm:w-56 h-auto"
              priority
            />
          </div>

          {/* Text */}
          <div className="mt-8 lg:mt-0 lg:flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-pixel text-pixel-navy leading-relaxed">
              Spotless Homes.{' '}
              <span className="block text-pixel-blue">Trusted Angels.</span>
            </h1>
            <p className="mt-6 text-base text-pixel-muted leading-relaxed max-w-md font-sans">
              Book top-rated, fully vetted cleaners in under&nbsp;3&nbsp;minutes.
            </p>
            <div className="mt-8 flex flex-col items-start gap-4">
              <Link
                href="/book"
                className="inline-block px-8 py-3.5 text-xs font-pixel bg-pixel-blue text-white border-2 border-pixel-navy shadow-pixel hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
              >
                Book a cleaning
              </Link>
              <p className="text-sm text-pixel-muted font-sans">
                Already have an account?{' '}
                <Link href="/login" className="text-pixel-blue font-semibold hover:underline underline-offset-2">
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Services ─────────────────────────────────────────────── */}
      <section className="bg-pixel-navy py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-lg sm:text-xl font-pixel text-white mb-12">
            Our Services
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map(({ title, desc, emoji }) => (
              <div
                key={title}
                className="bg-pixel-card p-6 border-2 border-pixel-light shadow-[4px_4px_0px_#6BA7D0]"
              >
                <div className="text-3xl mb-4">{emoji}</div>
                <h3 className="font-pixel text-pixel-navy mb-3 text-[11px] leading-relaxed">{title}</h3>
                <p className="text-sm text-pixel-muted font-sans leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Us ───────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-pixel-bg">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-lg sm:text-xl font-pixel text-pixel-navy mb-12">
            Why Mommy&apos;s Angels?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {why.map((w) => (
              <div key={w.label} className="flex flex-col gap-2 bg-pixel-card p-5 border-2 border-pixel-navy shadow-pixel-sm">
                <span className="text-2xl">{w.emoji}</span>
                <span className="font-pixel text-pixel-navy text-[10px] leading-relaxed">{w.label}</span>
                <span className="text-sm text-pixel-muted font-sans leading-relaxed">{w.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="bg-pixel-blue py-20 px-6 text-center border-t-4 border-pixel-navy">
        <div className="max-w-xl mx-auto">
          <h2 className="text-lg sm:text-xl font-pixel text-white mb-4 leading-relaxed">
            Ready for a spotless home?
          </h2>
          <p className="text-pixel-card font-sans mb-8">Book your cleaning in under 3 minutes.</p>
          <Link
            href="/book"
            className="inline-block px-8 py-3.5 text-xs font-pixel bg-white text-pixel-navy border-2 border-pixel-navy shadow-pixel hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
          >
            Book a cleaning
          </Link>
        </div>
      </section>
    </main>
  )
}
