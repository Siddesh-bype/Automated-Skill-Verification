import { useWallet, Wallet, WalletId } from '@txnlab/use-wallet-react'
import Account from './Account'

interface ConnectWalletInterface {
  openModal: boolean
  closeModal: () => void
}

const ConnectWallet = ({ openModal, closeModal }: ConnectWalletInterface) => {
  const { wallets, activeAddress } = useWallet()
  const isKmd = (wallet: Wallet) => wallet.id === WalletId.KMD

  return (
    <dialog id="connect_wallet_modal" className={`modal ${openModal ? 'modal-open' : ''}`}>
      <div className="modal-box">
        <div className="modal-header">
          <div className="flex items-center justify-between">
            <h3>{activeAddress ? 'Wallet Connected' : 'Connect Wallet'}</h3>
            <span className={`step-indicator ${activeAddress ? 'step-indicator-done' : 'step-indicator-active'}`}>
              {activeAddress ? '🔗 Connected' : '🔐 Required'}
            </span>
          </div>
          <p>
            {activeAddress
              ? 'Your Algorand wallet is connected. You can now submit evidence and mint certificates.'
              : 'Choose a wallet provider to connect to Algorand TestNet.'}
          </p>
        </div>

        <div className="grid gap-2">
          {activeAddress && (
            <>
              <Account />
              <div className="divider my-1" />
            </>
          )}

          {!activeAddress &&
            wallets?.map((wallet) => (
              <button
                data-test-id={`${wallet.id}-connect`}
                className="btn btn-outline justify-start gap-3 h-14 transition-all duration-300"
                style={{ borderColor: 'var(--glass-border)', background: 'var(--step-gradient)' }}
                key={`provider-${wallet.id}`}
                onClick={() => wallet.connect()}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'
                  e.currentTarget.style.background = 'rgba(99,102,241,0.08)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--glass-border)'
                  e.currentTarget.style.background = 'var(--step-gradient)'
                }}
              >
                {!isKmd(wallet) && (
                  <img alt={`wallet_icon_${wallet.id}`} src={wallet.metadata.icon} className="w-7 h-7 object-contain" />
                )}
                <span className="font-medium">{isKmd(wallet) ? 'LocalNet Wallet' : wallet.metadata.name}</span>
              </button>
            ))}
        </div>

        <div className="modal-action">
          <button type="button" data-test-id="close-wallet-modal" className="btn" onClick={closeModal}>Close</button>
          {activeAddress && (
            <button
              type="button"
              className="btn btn-warning"
              data-test-id="logout"
              onClick={async () => {
                if (wallets) {
                  const activeWallet = wallets.find((w) => w.isActive)
                  if (activeWallet) await activeWallet.disconnect()
                  else { localStorage.removeItem('@txnlab/use-wallet:v3'); window.location.reload() }
                }
              }}
            >
              Disconnect
            </button>
          )}
        </div>
      </div>
      <div className="modal-backdrop" onClick={closeModal}></div>
    </dialog>
  )
}
export default ConnectWallet
