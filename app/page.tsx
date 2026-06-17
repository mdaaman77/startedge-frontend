'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowRight,
  Star,
  Users,
  Clock,
  Shield,
  Verified,
  Lock,
  Zap,
  Heart,
  Scale,
  Wallet,
  Code,
  Brain,
  Briefcase,
  TrendingUp,
  User,
} from 'lucide-react'
import { Navbar } from '@/components/ui/Navbar'
import { Footer } from '@/components/ui/Footer'
import { ConsultantScroll } from '@/components/client/ConsultantScroll'
import { useListConsultantsQuery } from '@/lib/api/consultant'

const steps = [
  {
    icon: <Users size={32} />,
    title: 'Choose Consultant',
    desc: 'Browse profiles, read reviews, and select the perfect expert for your needs.',
  },
  {
    icon: <Zap size={32} />,
    title: 'Start Chatting',
    desc: 'Connect instantly via high-quality chat with end-to-end encryption.',
  },
  {
    icon: <Clock size={32} />,
    title: 'Pay Only for Time',
    desc: 'Wallet-based billing ensures you only pay for the exact seconds you consult.',
  },
]

const categories = [
  { icon: <Heart size={28} />, name: 'Healthcare', desc: 'General practitioners, specialists, and dieticians.' },
  { icon: <Scale size={28} />, name: 'Legal', desc: 'Civil law, intellectual property, and corporate legal.' },
  { icon: <Wallet size={28} />, name: 'Finance', desc: 'Tax planning, investment advisory, and audit.' },
  { icon: <Code size={28} />, name: 'Tech', desc: 'Cloud architecture, cybersecurity, and AI strategy.' },
  { icon: <Brain size={28} />, name: 'Mental Health', desc: 'Counseling, therapy, and life coaching.' },
  { icon: <Briefcase size={28} />, name: 'Business', desc: 'Startup scaling, marketing, and operations.' },
]

const HERO_CONSULTANT_ID = 'eecabfe2-9fc4-4295-95a6-57bc35e15d34'

export default function Home() {
  const { data: consultants } = useListConsultantsQuery({ limit: 100 })
  const { data: heroConsultant } = useListConsultantsQuery({
    limit: 100,
  })

  const verifiedCount = consultants?.length || 0
  const consultant = heroConsultant?.find((c) => c.user_id === HERO_CONSULTANT_ID)

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[900px] flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[-5%] w-[400px] h-[400px] bg-secondary-container/10 rounded-full blur-[100px]" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
                <span className="gradient-text">Expert Advice.</span>
                <br />
                <span className="text-white">Right Now.</span>
                <br />
                <span className="text-white">Pay Per Minute.</span>
              </h1>
              <p className="text-on-surface-variant text-lg max-w-lg mx-auto lg:mx-0 mb-8">
                Skip the waiting rooms and high retainer fees. Connect instantly with verified experts in legal, health, finance, and tech. Professional guidance starting from ₹15/min.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/register">
                  <button className="btn-primary flex items-center gap-2 mx-auto lg:mx-0">
                    Get Started Free <ArrowRight size={18} />
                  </button>
                </Link>
                <Link href="/client/consultants">
                  <button className="btn-outline">Browse Consultants</button>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-center lg:text-left"
                >
                  <div className="text-2xl md:text-3xl font-bold text-primary">{verifiedCount}+</div>
                  <div className="text-xs text-on-surface-variant">Verified Consultants</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-center lg:text-left"
                >
                  <div className="text-2xl md:text-3xl font-bold text-primary">98%</div>
                  <div className="text-xs text-on-surface-variant">Customer Satisfaction</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-center lg:text-left"
                >
                  <div className="text-2xl md:text-3xl font-bold text-primary">24/7</div>
                  <div className="text-xs text-on-surface-variant">Availability</div>
                </motion.div>
              </div>
            </motion.div>

            {/* Right Column - Hero Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="glass-card rounded-2xl p-6 max-w-md mx-auto animate-pulse-glow">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-outline-variant/30">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center overflow-hidden">
                      {consultant?.avatar_url ? (
                        <img
                          src={consultant.avatar_url}
                          alt={consultant.first_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-on-primary-container" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-on-surface">
                        {consultant ? `${consultant.first_name} ${consultant.last_name}` : 'Consultant Name'}
                      </h4>
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                        <span className="text-xs text-tertiary">
                          {consultant?.is_online ? 'Live Session' : 'Offline'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="relative w-16 h-16">
                    <svg className="absolute w-full h-full -rotate-90">
                      <circle cx="32" cy="32" r="28" fill="transparent" stroke="#2d3449" strokeWidth="4" />
                      <circle cx="32" cy="32" r="28" fill="transparent" stroke="#00a2e6" strokeWidth="4" strokeDasharray="175" strokeDashoffset="40" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-mono font-bold">00:00</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Current Rate</span>
                    <span className="font-bold text-on-surface">
                      {consultant ? `₹${consultant.per_minute_fee}/min` : '₹0/min'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Accrued Cost</span>
                    <span className="font-bold text-primary">₹0.00</span>
                  </div>
                  <div className="p-3 bg-surface-container rounded-lg border border-outline-variant/30">
                    <p className="text-sm italic text-on-surface-variant">
                      {consultant?.bio || 'Consultation will appear here'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -right-4 glass-card px-3 py-2 rounded-lg flex items-center gap-2 animate-float">
                <Verified size={16} className="text-tertiary" />
                <span className="text-xs font-medium">Secure Payment</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-surface-container-low">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <div className="w-16 h-1 bg-primary mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto rounded-2xl bg-surface-container flex items-center justify-center border border-primary/20 text-primary mb-4">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-on-surface-variant text-sm">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Specialized Domains */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">
                Specialized <span className="gradient-text">Domains</span>
              </h2>
              <p className="text-on-surface-variant max-w-xl">
                Every consultant on StartEdge is vetted through a multi-stage verification process to ensure professional excellence.
              </p>
            </div>
            <Link href="/client/consultants">
              <button className="text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all">
                View All <ArrowRight size={16} />
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((cat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="glass-card p-5 rounded-xl hover:bg-surface-variant transition-all cursor-pointer group"
              >
                <div className="text-primary mb-3 group-hover:scale-110 transition-transform">{cat.icon}</div>
                <h4 className="font-bold mb-1">{cat.name}</h4>
                <p className="text-on-surface-variant text-xs">{cat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Rated Experts - Real API */}
      <ConsultantScroll limit={10} />

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="glass-card rounded-2xl p-12 text-center max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to get expert advice?</h2>
            <p className="text-on-surface-variant mb-8 max-w-xl mx-auto">
              Join thousands of users who are making smarter decisions by talking to the right people at the right time.
            </p>
            <Link href="/register">
              <button className="btn-primary flex items-center gap-2 mx-auto">
                Get Started Free <ArrowRight size={18} />
              </button>
            </Link>
            <p className="text-on-surface-variant text-xs mt-4">No credit card required for registration.</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}