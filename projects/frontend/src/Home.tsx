// src/Home.tsx — CertifyMe Landing Page
import { useWallet } from '@txnlab/use-wallet-react'
import React, { useState } from 'react'
import ConnectWallet from './components/ConnectWallet'
import SubmitEvidence from './components/SubmitEvidence'
import StudentDashboard from './components/StudentDashboard'
import VerifyCredential from './components/VerifyCredential'
import EmployerView from './components/EmployerView'

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

/* ── Component ── */
const Home: React.FC = () => {
  const [openWalletModal, setOpenWalletModal] = useState(false)
  const [submitModal, setSubmitModal] = useState(false)
  const [dashboardModal, setDashboardModal] = useState(false)
  const [verifyModal, setVerifyModal] = useState(false)
  const [employerModal, setEmployerModal] = useState(false)
  const [verifyAssetId, setVerifyAssetId] = useState<number | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const { activeAddress } = useWallet()

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
          </div>

          {/* Connect Wallet */}
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
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden">
        {/* Subtle bg accent — single warm glow, not floating blobs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-500/[0.04] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 pt-24 pb-20 md:pt-32 md:pb-28">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left: Copy */}
            <div className="animate-fade-in">
              <p className="section-heading">Blockchain-Verified Credentials</p>
              <h1 className="text-4xl md:text-5xl lg:text-[3.4rem] font-extrabold text-surface-50 leading-[1.1] mb-6">
                Prove your skills.<br />
                <span className="text-brand-400">Earn trust.</span>
              </h1>
              <p className="text-base md:text-lg text-surface-400 leading-relaxed max-w-lg mb-10">
                CertifyMe uses automated code analysis and the Algorand blockchain to issue
                tamper-proof skill certificates that employers can verify in seconds.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  className="btn-primary-workspace flex items-center gap-2"
                  onClick={() => setSubmitModal(true)}
                >
                  Submit Evidence <IconArrowRight />
                </button>
                <button
                  className="btn-secondary-workspace flex items-center gap-2"
                  onClick={() => setDashboardModal(true)}
                >
                  <IconFileText /> My Certificates
                </button>
              </div>
              {!activeAddress && (
                <p className="mt-5 text-sm text-surface-500">
                  Connect your Algorand wallet to get started.{' '}
                  <button className="text-brand-400 hover:text-brand-300 underline underline-offset-2 transition-colors" onClick={toggleWalletModal}>
                    Connect Wallet
                  </button>
                </p>
              )}
            </div>

            {/* Right: Stats / Trust Indicators */}
            <div className="animate-slide-up hidden md:block">
              <div className="card-workspace p-8">
                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div>
                    <p className="stat-number">100%</p>
                    <p className="stat-label">On-chain verifiable</p>
                  </div>
                  <div>
                    <p className="stat-number">&lt;30s</p>
                    <p className="stat-label">Verification time</p>
                  </div>
                  <div>
                    <p className="stat-number">NFT</p>
                    <p className="stat-label">Certificate format</p>
                  </div>
                  <div>
                    <p className="stat-number">4-Dim</p>
                    <p className="stat-label">Code analysis</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-6 border-t border-surface-700/50">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm text-surface-400">Live on Algorand TestNet</span>
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
        <div className="text-center mb-16">
          <p className="section-heading">How It Works</p>
          <h2 className="section-title">Three steps to a verified credential</h2>
        </div>

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
          ].map((item) => (
            <div key={item.step} className="card-workspace group">
              <div className="flex items-start gap-4 mb-5">
                <span className="text-xs font-mono font-bold text-brand-500/40 mt-1">{item.step}</span>
                <div className="w-10 h-10 rounded-lg bg-surface-800 border border-surface-700/60 flex items-center justify-center text-brand-400 group-hover:bg-brand-500/10 group-hover:border-brand-500/30 transition-colors duration-300">
                  {item.icon}
                </div>
              </div>
              <h3 className="text-lg font-semibold text-surface-100 mb-2">{item.title}</h3>
              <p className="text-sm text-surface-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="border-t border-surface-800/60" />

      {/* ── Why CertifyMe ── */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p className="section-heading">Platform Advantages</p>
          <h2 className="section-title">Built for professionals</h2>
        </div>

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
          ].map((item) => (
            <div key={item.title} className="card-workspace group text-center">
              <div className="w-12 h-12 rounded-xl bg-surface-800 border border-surface-700/60 flex items-center justify-center text-surface-300 mx-auto mb-4 group-hover:text-brand-400 group-hover:bg-brand-500/10 group-hover:border-brand-500/30 transition-colors duration-300">
                {item.icon}
              </div>
              <h3 className="text-base font-semibold text-surface-100 mb-2">{item.title}</h3>
              <p className="text-sm text-surface-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="border-t border-surface-800/60" />

      {/* ── Employer CTA ── */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="card-workspace p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8 border-brand-500/20 bg-brand-500/[0.03]">
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 flex-shrink-0">
              <IconBriefcase />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-surface-50 mb-2">Hiring? Verify candidates instantly.</h2>
              <p className="text-surface-400 text-sm md:text-base max-w-lg leading-relaxed">
                No phone calls to universities, no trust issues. Enter a certificate asset ID and see
                the full, blockchain-verified proof of skill.
              </p>
            </div>
          </div>
          <button
            className="btn-primary-workspace whitespace-nowrap flex items-center gap-2"
            onClick={() => setEmployerModal(true)}
          >
            <IconSearch /> Verify a Candidate
          </button>
        </div>
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
          <p className="text-sm text-surface-600">
            Automated Skill Verification · Built on Algorand
          </p>
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
    </div>
  )
}

export default Home
