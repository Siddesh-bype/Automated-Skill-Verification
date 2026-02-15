// src/Home.tsx — CertifyMe Landing Page
import { useWallet } from '@txnlab/use-wallet-react'
import React, { useState, useEffect } from 'react'
import ConnectWallet from './components/ConnectWallet'
import SubmitEvidence from './components/SubmitEvidence'
import StudentDashboard from './components/StudentDashboard'
import VerifyCredential from './components/VerifyCredential'
import EmployerView from './components/EmployerView'
import PortfolioPage from './components/PortfolioPage'
import AnimatedHero from './components/3d/AnimatedHero'
import FadeInSection from './components/FadeInSection'

/* ── Inline SVG Icons (professional, minimal line-art) ── */
const IconShield = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
)

const IconUpload = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
)

const IconCpu = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
    <rect x="9" y="9" width="6" height="6" />
    <line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" />
    <line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" />
    <line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="14" x2="23" y2="14" />
    <line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="14" x2="4" y2="14" />
  </svg>
)

const IconLink = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
)

const IconZap = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
)

const IconGlobe = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
)

const IconBriefcase = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
)

const IconCheckCircle = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

const IconArrowRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
)

const IconFileText = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
)

const IconSearch = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

const IconAlgorand = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13.84 4.35C14.07 4.02 14.12 3.59 13.97 3.22C13.82 2.85 13.48 2.59 13.08 2.56L13.04 2.56C12.49 2.56 12.01 2.92 11.88 3.45L11.84 3.65L7.99 18.06L6.59 13.12L9.2 3.62L9.24 3.42C9.37 2.89 9.85 2.53 10.4 2.53C10.84 2.53 11.23 2.8 11.41 3.2L11.45 3.33L13.84 4.35ZM18.91 19.46L13.98 17.51L12.59 18.06C12.59 18.06 12.58 18.06 12.57 18.06L17.5 19.95C17.9 20.1 18.35 19.98 18.63 19.65C18.91 19.32 18.95 18.87 18.75 18.5L18.91 19.46ZM16.34 18.42L12.92 6.07L10 17.02L8.68 21.95L8.64 22.09C8.5 22.61 8.8 23.16 9.32 23.31C9.42 23.34 9.53 23.35 9.63 23.35C10.05 23.35 10.43 23.09 10.59 22.69L10.63 22.56L11.53 19.18L16.34 18.42ZM5.97 18.73L7.38 13.43L4.92 4.77L4.9 4.71C4.7 3.99 3.96 3.56 3.24 3.76C2.52 3.96 2.09 4.7 2.29 5.42L5.27 15.93L5.3 16.03L5.97 18.73Z" />
  </svg>
)

/* ── Component ── */
/* ── Theme Icons ── */
const IconSun = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
)

const IconMoon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
)

const Home: React.FC = () => {
  const [openWalletModal, setOpenWalletModal] = useState(false)
  const [submitModal, setSubmitModal] = useState(false)
  const [dashboardModal, setDashboardModal] = useState(false)
  const [verifyModal, setVerifyModal] = useState(false)
  const [employerModal, setEmployerModal] = useState(false)
  const [portfolioModal, setPortfolioModal] = useState(false)
  const [verifyAssetId, setVerifyAssetId] = useState<number | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const { activeAddress } = useWallet()

  // Theme management
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('certifyme-theme')
    return saved !== 'light'
  })

  useEffect(() => {
    const theme = isDark ? 'certifyme' : 'certifyme-light'
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('certifyme-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  const toggleTheme = () => setIsDark(prev => !prev)

  const toggleWalletModal = () => setOpenWalletModal(!openWalletModal)

  const handleVerify = (assetId: number) => {
    setVerifyAssetId(assetId)
    setDashboardModal(false)
    setVerifyModal(true)
  }

  const handleCertMinted = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <div className="min-h-screen bg-surface-950">
      {/* ── Navbar ── */}
      <nav className="border-b border-surface-800 bg-surface-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <IconShield />
            </div>
            <span className="font-bold text-lg text-surface-50 tracking-tight">CertifyMe</span>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <span className="nav-link" onClick={() => setDashboardModal(true)}>Dashboard</span>
            <span className="nav-link" onClick={() => setSubmitModal(true)}>Submit Evidence</span>
            <span className="nav-link" onClick={() => setVerifyModal(true)}>Verify</span>
            <span className="nav-link" onClick={() => setEmployerModal(true)}>Employers</span>
            {activeAddress && <span className="nav-link" onClick={() => setPortfolioModal(true)}>Portfolio</span>}
          </div>

          {/* Theme Toggle + Connect Wallet */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="theme-toggle"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <IconSun /> : <IconMoon />}
            </button>
            <button
              data-test-id="connect-wallet"
              className="btn-primary-workspace text-sm py-2 px-5 rounded-lg"
              onClick={toggleWalletModal}
            >
              {activeAddress
                ? `${activeAddress.substring(0, 4)}...${activeAddress.substring(activeAddress.length - 4)}`
                : 'Connect Wallet'}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden min-h-[80vh] flex items-center">
        <AnimatedHero />

        <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left: Copy */}
            <div className="animate-fade-in">
              <p className="section-heading">Blockchain-Verified Credentials</p>
              <h1 className="text-4xl md:text-6xl lg:text-[4rem] font-extrabold text-white leading-[1.1] mb-6 tracking-tight drop-shadow-sm">
                Prove your skills.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-brand-500">Earn trust.</span>
              </h1>
              <p className="text-base md:text-xl text-surface-200 leading-relaxed max-w-lg mb-10 font-light">
                CertifyMe uses automated code analysis and the Algorand blockchain to issue
                tamper-proof skill certificates that employers can verify in seconds.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  className="btn-primary-workspace flex items-center gap-2 shadow-neon hover:shadow-brand-500/50"
                  onClick={() => setSubmitModal(true)}
                >
                  Submit Evidence <IconArrowRight />
                </button>
                <button
                  className="btn-secondary-workspace flex items-center gap-2 backdrop-blur-md bg-white/5 border-white/10 hover:bg-white/10"
                  onClick={() => setDashboardModal(true)}
                >
                  <IconFileText /> My Certificates
                </button>
              </div>
              {!activeAddress && (
                <p className="mt-6 text-sm text-surface-400">
                  Connect your Algorand wallet to get started.{' '}
                  <button className="text-brand-300 hover:text-brand-200 underline underline-offset-4 transition-colors font-medium" onClick={toggleWalletModal}>
                    Connect Wallet
                  </button>
                </p>
              )}
            </div>

            {/* Right: Stats / Trust Indicators */}
            <div className="animate-slide-up hidden md:block perspective-1000">
              <div className="card-workspace p-8 transform rotate-y-6 hover:rotate-y-0 transition-transform duration-500 hover:shadow-2xl hover:shadow-brand-500/10 border-surface-700/60 bg-surface-950/80 backdrop-blur-xl">
                <div className="grid grid-cols-2 gap-10 mb-8">
                  <div>
                    <p className="stat-number text-brand-400">100%</p>
                    <p className="stat-label text-surface-200 font-medium">On-chain verifiable</p>
                  </div>
                  <div>
                    <p className="stat-number text-brand-400">&lt;30s</p>
                    <p className="stat-label text-surface-200 font-medium">Verification time</p>
                  </div>
                  <div>
                    <p className="stat-number text-brand-400">NFT</p>
                    <p className="stat-label text-surface-200 font-medium">Certificate format</p>
                  </div>
                  <div>
                    <p className="stat-number text-brand-400">4-Dim</p>
                    <p className="stat-label text-surface-200 font-medium">Code analysis</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-6 border-t border-surface-700/60">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                  <span className="text-sm text-surface-200 font-medium">Live on Algorand TestNet</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* ── Divider ── */}
      <div className="border-t border-surface-800/60" />

      {/* ── How It Works ── */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <FadeInSection>
          <div className="text-center mb-16">
            <p className="section-heading">How It Works</p>
            <h2 className="section-title">Three steps to a verified credential</h2>
          </div>
        </FadeInSection>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: '01',
              icon: <IconUpload />,
              title: 'Submit Evidence',
              desc: 'Share your GitHub project or code submission. Our system analyzes code quality, complexity, best practices, and originality.',
            },
            {
              step: '02',
              icon: <IconCpu />,
              title: 'Automated Verification',
              desc: 'Your code is reviewed across four dimensions and assigned a quality score, determining your skill level from Beginner to Expert.',
            },
            {
              step: '03',
              icon: <IconLink />,
              title: 'Blockchain Certificate',
              desc: 'If verified, an unforgeable NFT certificate is minted on Algorand. Share it with employers who can verify instantly.',
            },
          ].map((item, index) => (
            <FadeInSection key={item.step} delay={`${index * 200}ms`}>
              <div className="card-workspace group h-full">
                <div className="flex items-start gap-4 mb-5">
                  <span className="text-xs font-mono font-bold text-brand-400 mt-1 opacity-100">{item.step}</span>
                  <div className="w-10 h-10 rounded-lg bg-surface-800 border border-surface-600 flex items-center justify-center text-brand-300 group-hover:bg-brand-500/20 group-hover:border-brand-500/50 group-hover:text-brand-200 transition-all duration-300 shadow-sm">
                    {item.icon}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-surface-50 mb-2">{item.title}</h3>
                <p className="text-sm text-surface-300 leading-relaxed font-medium">{item.desc}</p>
              </div>
            </FadeInSection>
          ))}
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="border-t border-surface-800/60" />

      {/* ── Why CertifyMe ── */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <FadeInSection>
          <div className="text-center mb-16">
            <p className="section-heading">Platform Advantages</p>
            <h2 className="section-title">Built for professionals</h2>
          </div>
        </FadeInSection>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: <IconShield />,
              title: 'Tamper-Proof',
              desc: 'Blockchain-backed certificates that cannot be forged or altered.',
            },
            {
              icon: <IconCheckCircle />,
              title: 'Code-Verified',
              desc: 'Skills are proven through automated code analysis, not self-reported.',
            },
            {
              icon: <IconZap />,
              title: 'Instant Verification',
              desc: 'Employers verify credentials in seconds via asset ID lookup.',
            },
            {
              icon: <IconGlobe />,
              title: 'Universally Portable',
              desc: 'Works across borders, institutions, and hiring platforms.',
            },
          ].map((item, index) => (
            <FadeInSection key={item.title} delay={`${index * 100}ms`}>
              <div className="card-workspace group text-center h-full hover:-translate-y-1 transition-transform duration-300">
                <div className="w-12 h-12 rounded-xl bg-surface-800 border border-surface-600 flex items-center justify-center text-surface-200 mx-auto mb-4 group-hover:text-brand-300 group-hover:bg-brand-500/20 group-hover:border-brand-400/40 transition-colors duration-300 shadow-md">
                  {item.icon}
                </div>
                <h3 className="text-base font-semibold text-surface-50 mb-2">{item.title}</h3>
                <p className="text-sm text-surface-300 leading-relaxed">{item.desc}</p>
              </div>
            </FadeInSection>
          ))}
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="border-t border-surface-800/60" />

      {/* ── New Features Showcase ── */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <FadeInSection>
          <div className="text-center mb-16">
            <p className="section-heading">What's New</p>
            <h2 className="section-title">Enterprise-grade features</h2>
          </div>
        </FadeInSection>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: '🔗',
              title: 'Multi-Chain Support',
              desc: 'Certificates can target Algorand, Ethereum, or Polygon. Chain badges show which blockchain backs each credential.',
              badge: 'NEW',
            },
            {
              icon: '💼',
              title: 'Portfolio Builder',
              desc: 'Create a shareable profile showcasing all your verified certificates. Share your portfolio link with employers.',
              badge: 'NEW',
            },
            {
              icon: '📊',
              title: 'Batch Verification',
              desc: 'Employers can verify multiple candidates at once. Upload asset IDs and get instant verification results.',
              badge: 'NEW',
            },
            {
              icon: '🚨',
              title: 'Revocation Feed',
              desc: 'Real-time alerts when certificates are revoked. Auto-refreshing feed keeps employers informed.',
              badge: 'NEW',
            },
            {
              icon: '📤',
              title: 'Certificate Sharing',
              desc: 'Share certificates via WhatsApp, Email, or secure links with configurable expiry timeouts.',
              badge: 'NEW',
            },
            {
              icon: '⛓️',
              title: 'Algorand Integration',
              desc: 'Full ARC-19 NFT minting on Algorand TestNet. Immutable, verifiable proof of your skills.',
              badge: 'CORE',
            },
          ].map((item, index) => (
            <FadeInSection key={item.title} delay={`${index * 100}ms`}>
              <div className="card-workspace group h-full hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl filter drop-shadow-sm">{item.icon}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badge === 'NEW'
                    ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                    : 'bg-surface-700 text-surface-300 border border-surface-600'
                    }`}>
                    {item.badge}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-surface-50 mb-2">{item.title}</h3>
                <p className="text-sm text-surface-300 leading-relaxed font-medium">{item.desc}</p>
              </div>
            </FadeInSection>
          ))}
        </div>
      </section>

      {/* ── Employer CTA ── */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <FadeInSection>
          <div className="card-workspace p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8 border-brand-500/30 bg-brand-500/[0.05] shadow-neon">
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-xl bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-300 flex-shrink-0 shadow-sm">
                <IconBriefcase />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-2">Hiring? Verify candidates instantly.</h2>
                <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base max-w-lg leading-relaxed font-medium">
                  No phone calls to universities, no trust issues. Enter a certificate asset ID and see
                  the full, blockchain-verified proof of skill.
                </p>
              </div>
            </div>
            <button
              className="btn-primary-workspace whitespace-nowrap flex items-center gap-2 hover:scale-105 transition-transform"
              onClick={() => setEmployerModal(true)}
            >
              <IconSearch /> Verify a Candidate
            </button>
          </div>
        </FadeInSection>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-surface-800/60 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-surface-500 text-sm">
            <div className="w-5 h-5 bg-brand-500/20 rounded flex items-center justify-center text-brand-500">
              <IconShield />
            </div>
            <span>CertifyMe</span>
          </div>
          <div className="text-sm text-surface-600 flex items-center gap-2">
            <span>Automated Skill Verification</span>
            <span className="text-surface-400">·</span>
            <div className="flex items-center gap-1">
              <span>Built on</span>
              <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center text-white p-0.5">
                <IconAlgorand />
              </div>
              <span className="font-semibold">Algorand</span>
            </div>
          </div>
          <div className="flex gap-6">
            <span className="nav-link text-xs" onClick={() => setVerifyModal(true)}>Verify</span>
            <span className="nav-link text-xs" onClick={() => setEmployerModal(true)}>Employers</span>
          </div>
        </div>
      </footer>

      {/* ── Modals (untouched logic) ── */}
      <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
      <SubmitEvidence openModal={submitModal} closeModal={() => setSubmitModal(false)} onCertificateMinted={handleCertMinted} />
      <StudentDashboard
        openModal={dashboardModal}
        closeModal={() => setDashboardModal(false)}
        onSubmitNew={() => {
          setDashboardModal(false)
          setSubmitModal(true)
        }}
        onVerify={handleVerify}
        refreshTrigger={refreshTrigger}
      />
      <VerifyCredential openModal={verifyModal} closeModal={() => setVerifyModal(false)} initialAssetId={verifyAssetId} />
      <EmployerView openModal={employerModal} closeModal={() => setEmployerModal(false)} />

      {/* Portfolio Modal */}
      {portfolioModal && activeAddress && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-3xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-2xl">📋 My Portfolio</h3>
              <button className="btn btn-sm btn-ghost" onClick={() => setPortfolioModal(false)}>✕</button>
            </div>
            <PortfolioPage walletAddress={activeAddress} />
          </div>
          <div className="modal-backdrop" onClick={() => setPortfolioModal(false)} />
        </dialog>
      )}
    </div>
  )
}

export default Home
