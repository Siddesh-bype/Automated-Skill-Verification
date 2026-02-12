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
        <h3 className="font-bold text-2xl mb-1">
          {activeAddress ? '🔗 Wallet Connected' : '🔐 Connect Wallet'}
        </h3>
        <p className="text-sm opacity-60 mb-4">
          {activeAddress
            ? 'Your Algorand wallet is connected. You can now submit evidence and mint certificates.'
            : 'Choose a wallet provider to connect to Algorand TestNet.'}
        </p>

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
                className="btn btn-outline border-surface-700 hover:border-brand-500 hover:bg-brand-500/10 justify-start gap-3 h-14"
                key={`provider-${wallet.id}`}
                onClick={() => wallet.connect()}
              >
                {!isKmd(wallet) && (
                  <img
                    alt={`wallet_icon_${wallet.id}`}
                    src={wallet.metadata.icon}
                    className="w-7 h-7 object-contain"
                  />
                )}
                <span className="font-medium">
                  {isKmd(wallet) ? 'LocalNet Wallet' : wallet.metadata.name}
                </span>
              </button>
            ))}
        </div>

        <div className="modal-action">
          <button
            type="button"
            data-test-id="close-wallet-modal"
            className="btn"
            onClick={closeModal}
          >
            Close
          </button>
          {activeAddress && (
            <button
              type="button"
              className="btn btn-warning"
              data-test-id="logout"
              onClick={async () => {
                if (wallets) {
                  const activeWallet = wallets.find((w) => w.isActive)
                  if (activeWallet) {
                    await activeWallet.disconnect()
                  } else {
                    localStorage.removeItem('@txnlab/use-wallet:v3')
                    window.location.reload()
                  }
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
