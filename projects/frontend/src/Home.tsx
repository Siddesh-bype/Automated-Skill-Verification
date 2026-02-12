// src/Home.tsx — CertifyMe Landing Page
import { useWallet } from '@txnlab/use-wallet-react'
import React, { useState } from 'react'
import ConnectWallet from './components/ConnectWallet'
import SubmitEvidence from './components/SubmitEvidence'
import StudentDashboard from './components/StudentDashboard'
import VerifyCredential from './components/VerifyCredential'
import EmployerView from './components/EmployerView'

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      {/* Navbar */}
      <nav className="navbar bg-base-100/10 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="navbar-start">
          <div className="flex items-center gap-2 px-2">
            <span className="text-2xl">🎓</span>
            <span className="font-bold text-xl text-white">CertifyMe</span>
          </div>
        </div>
        <div className="navbar-center hidden md:flex">
          <ul className="menu menu-horizontal px-1 text-white/80">
            <li><a className="hover:text-white" onClick={() => setDashboardModal(true)}>Dashboard</a></li>
            <li><a className="hover:text-white" onClick={() => setSubmitModal(true)}>Submit Evidence</a></li>
            <li><a className="hover:text-white" onClick={() => setVerifyModal(true)}>Verify</a></li>
            <li><a className="hover:text-white" onClick={() => setEmployerModal(true)}>For Employers</a></li>
          </ul>
        </div>
        <div className="navbar-end">
          <button
            data-test-id="connect-wallet"
            className="btn btn-primary btn-sm rounded-full px-5"
            onClick={toggleWalletModal}
          >
            {activeAddress
              ? `${activeAddress.substring(0, 4)}...${activeAddress.substring(activeAddress.length - 4)}`
              : 'Connect Wallet'}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex items-center justify-center min-h-[80vh] px-4">
        <div className="text-center max-w-4xl">
          <div className="inline-block mb-4">
            <span className="badge badge-primary badge-lg gap-2 animate-bounce">
              🔗 Powered by Algorand Blockchain
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400 mb-6 leading-tight">
            Get Your Skills Verified & Certified on Blockchain
          </h1>

          <p className="text-lg md:text-xl text-white/70 mb-8 max-w-2xl mx-auto">
            AI-powered skill verification meets unforgeable blockchain certificates.
            Prove your skills, mint your credentials, let employers verify instantly.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <button
              className="btn btn-primary btn-lg gap-2 rounded-full shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all"
              disabled={!activeAddress}
              onClick={() => setSubmitModal(true)}
            >
              🚀 Submit Evidence
            </button>
            <button
              className="btn btn-outline btn-lg gap-2 rounded-full text-white border-white/30 hover:bg-white/10"
              disabled={!activeAddress}
              onClick={() => setDashboardModal(true)}
            >
              📜 My Certificates
            </button>
            <button
              className="btn btn-ghost btn-lg gap-2 rounded-full text-white/80"
              onClick={() => setVerifyModal(true)}
            >
              🔍 Verify Certificate
            </button>
          </div>

          {!activeAddress && (
            <div className="mt-6">
              <p className="text-sm text-white/50">
                Connect your Algorand wallet to get started →{' '}
                <button className="link link-primary" onClick={toggleWalletModal}>
                  Connect Wallet
                </button>
              </p>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="card bg-white/5 backdrop-blur-md border border-white/10 text-white">
              <div className="card-body items-center text-center">
                <div className="text-5xl mb-4">📤</div>
                <h3 className="card-title">1. Submit Evidence</h3>
                <p className="text-white/60">
                  Share your GitHub project or code submission. Our AI analyzes your code quality, complexity,
                  best practices, and originality.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="card bg-white/5 backdrop-blur-md border border-white/10 text-white">
              <div className="card-body items-center text-center">
                <div className="text-5xl mb-4">🤖</div>
                <h3 className="card-title">2. AI Verification</h3>
                <p className="text-white/60">
                  GPT-4 reviews your code across 4 dimensions, assigns a quality score,
                  and determines your skill level — from Beginner to Expert.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="card bg-white/5 backdrop-blur-md border border-white/10 text-white">
              <div className="card-body items-center text-center">
                <div className="text-5xl mb-4">⛓️</div>
                <h3 className="card-title">3. Blockchain Certificate</h3>
                <p className="text-white/60">
                  If verified, mint an unforgeable NFT certificate on Algorand.
                  Share with employers who can instantly verify via QR code.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="relative z-10 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-12">Why CertifyMe?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-white hover:scale-105 transition-transform">
              <div className="card-body">
                <div className="text-3xl">🛡️</div>
                <h3 className="card-title text-sm">Unforgeable</h3>
                <p className="text-xs text-white/60">Blockchain-backed certificates that can never be faked</p>
              </div>
            </div>
            <div className="card bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-white hover:scale-105 transition-transform">
              <div className="card-body">
                <div className="text-3xl">🤖</div>
                <h3 className="card-title text-sm">AI-Verified</h3>
                <p className="text-xs text-white/60">Skills are proven by AI analysis, not self-reported</p>
              </div>
            </div>
            <div className="card bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-white hover:scale-105 transition-transform">
              <div className="card-body">
                <div className="text-3xl">⚡</div>
                <h3 className="card-title text-sm">Instant Verify</h3>
                <p className="text-xs text-white/60">Employers scan QR code → instant credential check</p>
              </div>
            </div>
            <div className="card bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-white hover:scale-105 transition-transform">
              <div className="card-body">
                <div className="text-3xl">🌍</div>
                <h3 className="card-title text-sm">Universal</h3>
                <p className="text-xs text-white/60">Works across borders, institutions, and platforms</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Employers CTA */}
      <section className="relative z-10 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="card bg-white/5 backdrop-blur-md border border-white/10 text-white">
            <div className="card-body py-10">
              <h2 className="text-2xl font-bold mb-2">👔 Are You an Employer?</h2>
              <p className="text-white/60 mb-6">
                Verify candidate skills instantly. No phone calls to universities, no trust issues.
                Just scan the QR code and see AI-verified proof of skill.
              </p>
              <button className="btn btn-primary btn-wide mx-auto" onClick={() => setEmployerModal(true)}>
                Verify a Candidate
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-6 text-center text-white/40 text-sm">
        <p>CertifyMe — Built on Algorand | AI-Verified Blockchain Certificates</p>
      </footer>

      {/* Modals */}
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
