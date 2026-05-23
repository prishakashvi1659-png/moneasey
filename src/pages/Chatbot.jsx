import { useState, useRef, useEffect } from 'react'
import './Chatbot.css'

// ─── Mock stock data ───────────────────────────────────────────────────────────
const STOCKS = {
  AAPL:  { name: 'Apple Inc.',          price: 213.42, change: +1.23 },
  MSFT:  { name: 'Microsoft Corp.',     price: 428.17, change: -0.85 },
  GOOGL: { name: 'Alphabet Inc.',       price: 178.56, change: +2.11 },
  AMZN:  { name: 'Amazon.com Inc.',     price: 195.88, change: +0.64 },
  TSLA:  { name: 'Tesla Inc.',          price: 186.40, change: -3.22 },
  NVDA:  { name: 'NVIDIA Corp.',        price: 1089.50,change: +14.30},
  VTI:   { name: 'Vanguard Total Mkt.', price: 241.88, change: +0.77 },
  SPY:   { name: 'S&P 500 ETF',         price: 538.62, change: +1.04 },
  BRK:   { name: 'Berkshire Hathaway',  price: 412.10, change: -0.33 },
  COIN:  { name: 'Coinbase Global',     price: 231.75, change: +8.92 },
}

function fmtMoney(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtShares(n) {
  return n % 1 === 0 ? n : n.toFixed(4)
}

// ─── Response engine ───────────────────────────────────────────────────────────
function getResponse(input, portfolio, balance, setPortfolio, setBalance) {
  const raw = input.trim()
  const upper = raw.toUpperCase()

  // ── HELP ──
  if (/^help$/i.test(raw) || /what can you do/i.test(raw)) {
    return {
      text: `Here's what I can help you with:\n\n**Trading Commands:**\n• BUY [SHARES] [TICKER] — Buy shares of a stock\n• SELL [SHARES] [TICKER] — Sell shares from your portfolio\n• PRICE [TICKER] — Get the current price of a stock\n• PORTFOLIO — See your full portfolio & balance\n\n**Available tickers:** ${Object.keys(STOCKS).join(', ')}\n\n**Financial Questions:**\nAsk me anything about investing, budgeting, credit, savings, or general personal finance. I'm here to help you learn! 💡`,
      type: 'help'
    }
  }

  // ── PORTFOLIO ──
  if (/^portfolio$/i.test(raw) || /my portfolio|my stocks|my holdings/i.test(raw)) {
    const positions = Object.entries(portfolio)
    if (positions.length === 0) {
      return {
        text: `Your portfolio is empty. Start by buying some stocks!\n\nTry: **BUY 5 AAPL** to buy 5 shares of Apple.\n\nYour current cash balance: **${fmtMoney(balance)}**`,
        type: 'portfolio'
      }
    }
    let totalValue = balance
    const rows = positions.map(([ticker, { shares, avgCost }]) => {
      const stock = STOCKS[ticker]
      const value = shares * stock.price
      const gain = value - shares * avgCost
      const gainPct = ((stock.price - avgCost) / avgCost) * 100
      totalValue += value
      return { ticker, shares, avgCost, value, gain, gainPct, price: stock.price, name: stock.name }
    })
    return {
      text: `Here's your portfolio overview:`,
      type: 'portfolio',
      portfolio: rows,
      balance,
      totalValue
    }
  }

  // ── PRICE ──
  const priceMatch = upper.match(/^PRICE\s+([A-Z]{2,5})$/)
  if (priceMatch) {
    const ticker = priceMatch[1]
    const stock = STOCKS[ticker]
    if (!stock) {
      return { text: `I don't have data for **${ticker}**. Available tickers: ${Object.keys(STOCKS).join(', ')}`, type: 'error' }
    }
    const sign = stock.change >= 0 ? '+' : ''
    return {
      text: `**${ticker}** — ${stock.name}\n\nCurrent Price: **${fmtMoney(stock.price)}**\nToday's Change: **${sign}${fmtMoney(stock.change)}** (${sign}${((stock.change / stock.price) * 100).toFixed(2)}%)\n\nTo buy: type **BUY [shares] ${ticker}**`,
      type: 'price',
      ticker
    }
  }

  // ── BUY ──
  const buyMatch = upper.match(/^BUY\s+([\d.]+)\s+([A-Z]{2,5})$/)
  if (buyMatch) {
    const shares = parseFloat(buyMatch[1])
    const ticker = buyMatch[2]
    const stock = STOCKS[ticker]
    if (!stock) {
      return { text: `Unknown ticker: **${ticker}**. Try: ${Object.keys(STOCKS).join(', ')}`, type: 'error' }
    }
    if (shares <= 0 || isNaN(shares)) {
      return { text: `Please enter a valid number of shares. Example: **BUY 5 ${ticker}**`, type: 'error' }
    }
    const cost = shares * stock.price
    if (cost > balance) {
      return {
        text: `❌ Insufficient funds.\n\nCost of ${fmtShares(shares)} shares of ${ticker}: **${fmtMoney(cost)}**\nYour balance: **${fmtMoney(balance)}**\n\nYou need **${fmtMoney(cost - balance)}** more, or try buying fewer shares.`,
        type: 'error'
      }
    }

    const existing = portfolio[ticker]
    const newShares = (existing?.shares || 0) + shares
    const newAvgCost = existing
      ? (existing.shares * existing.avgCost + cost) / newShares
      : stock.price

    setPortfolio(p => ({ ...p, [ticker]: { shares: newShares, avgCost: newAvgCost } }))
    setBalance(b => b - cost)

    return {
      text: `✅ **Order Executed!**\n\nBought **${fmtShares(shares)} shares of ${ticker}** at ${fmtMoney(stock.price)} per share.\n\nTotal cost: **${fmtMoney(cost)}**\nRemaining balance: **${fmtMoney(balance - cost)}**\n\n💡 **Tip:** Diversify across multiple stocks or index funds to reduce risk.`,
      type: 'buy'
    }
  }

  // ── SELL ──
  const sellMatch = upper.match(/^SELL\s+([\d.]+)\s+([A-Z]{2,5})$/)
  if (sellMatch) {
    const shares = parseFloat(sellMatch[1])
    const ticker = sellMatch[2]
    const stock = STOCKS[ticker]
    if (!stock) {
      return { text: `Unknown ticker: **${ticker}**.`, type: 'error' }
    }
    const held = portfolio[ticker]
    if (!held || held.shares < shares) {
      return {
        text: `❌ You don't have enough shares to sell.\n\nYou own: **${held ? fmtShares(held.shares) : 0} shares** of ${ticker}\nTrying to sell: **${fmtShares(shares)} shares**`,
        type: 'error'
      }
    }

    const proceeds = shares * stock.price
    const gain = proceeds - shares * held.avgCost
    const gainPct = ((stock.price - held.avgCost) / held.avgCost) * 100
    const newShares = held.shares - shares

    if (newShares < 0.0001) {
      setPortfolio(p => { const n = { ...p }; delete n[ticker]; return n })
    } else {
      setPortfolio(p => ({ ...p, [ticker]: { ...held, shares: newShares } }))
    }
    setBalance(b => b + proceeds)

    const gainStr = gain >= 0
      ? `📈 **Gain: +${fmtMoney(gain)}** (+${gainPct.toFixed(2)}%)`
      : `📉 **Loss: ${fmtMoney(gain)}** (${gainPct.toFixed(2)}%)`

    return {
      text: `✅ **Sold ${fmtShares(shares)} shares of ${ticker}** at ${fmtMoney(stock.price)}\n\nProceeds: **${fmtMoney(proceeds)}**\n${gainStr}\n\nNew balance: **${fmtMoney(balance + proceeds)}**`,
      type: 'sell'
    }
  }

  // ── FINANCIAL Q&A ──
  const lower = raw.toLowerCase()

  if (/what is.*compound interest|how does compound interest/i.test(lower)) {
    return { text: `**Compound interest** is earning interest on both your original principal AND on the interest you've already earned.\n\nExample: $1,000 at 7% annual return:\n• Year 1: $1,070\n• Year 5: $1,403\n• Year 10: $1,967\n• Year 20: $3,870\n• Year 30: $7,612\n\nYou tripled your money without adding a cent! The secret is **time** — start as early as possible.\n\n💡 Try reading our article on compound interest in the Articles section!`, type: 'info' }
  }

  if (/what is.*index fund|why index fund|should i.*index fund/i.test(lower)) {
    return { text: `An **index fund** is a collection of stocks that tracks a market index like the S&P 500.\n\nWhy they're great:\n• Own 500+ companies instantly (diversification)\n• Very low fees (0.03% vs 1%+ for active funds)\n• Historically outperform ~80% of actively managed funds\n• No research needed — you bet on the whole economy\n\n**Top picks:** VTI (Vanguard Total Market), SPY (S&P 500), FZROX (Fidelity, zero fees)\n\nTry: **BUY 2 VTI** to practice buying an index ETF!`, type: 'info' }
  }

  if (/what is.*roth ira|roth ira|ira/i.test(lower)) {
    return { text: `A **Roth IRA** is a retirement account where you:\n• Contribute after-tax dollars (no deduction now)\n• Money grows 100% tax-free\n• Withdraw tax-free in retirement\n\n**2026 Contribution Limit:** $7,000/year ($8,000 if 50+)\n\nWho should use it: Anyone who expects to be in a higher tax bracket in retirement (most young people).\n\nWhere to open one: Fidelity, Vanguard, or Schwab — all free with no minimums.\n\n💡 Think of it as the government giving you a tax-free growth superpower.`, type: 'info' }
  }

  if (/what is.*etf|etf/i.test(lower)) {
    return { text: `An **ETF (Exchange-Traded Fund)** is like a mutual fund but trades like a stock — you can buy and sell it throughout the day.\n\n**ETF vs. Mutual Fund:**\n• ETFs trade on exchanges (like stocks)\n• Usually lower expense ratios\n• More flexible — buy single shares\n• Great for beginners\n\n**SPY** (S&P 500 ETF) is in our simulator — try **PRICE SPY** to see its current value!`, type: 'info' }
  }

  if (/diversif|don't put.*eggs|all.*eggs/i.test(lower)) {
    return { text: `**Diversification** means spreading your money across different investments to reduce risk.\n\n"Don't put all your eggs in one basket!" 🥚\n\n**How to diversify in the simulator:**\n• Buy a mix of individual stocks (AAPL, MSFT, GOOGL)\n• Include an index fund (VTI or SPY) which diversifies automatically\n• Mix growth stocks (TSLA, NVDA) with stable ones (BRK)\n\nType **PORTFOLIO** to see how diversified your holdings are!`, type: 'info' }
  }

  if (/what.*dividend|dividends/i.test(lower)) {
    return { text: `**Dividends** are a portion of a company's profits paid to shareholders regularly (quarterly for most U.S. stocks).\n\nExample: If Apple pays $1/share annually and you own 100 shares, you get $100/year — just for holding the stock!\n\n**Dividend stocks vs. growth stocks:**\n• Dividend stocks (BRK, VTI) — steady income, typically less volatile\n• Growth stocks (TSLA, NVDA) — higher potential returns, higher risk\n\nDividends are automatically reinvested in most brokerages (DRIP), turbocharging compound growth.`, type: 'info' }
  }

  if (/what is.*credit score|improve.*credit|build.*credit/i.test(lower)) {
    return { text: `Your **credit score** (300–850) determines your loan rates, apartment approvals, and more.\n\n**How it's calculated (FICO):**\n• 35% — Payment history (never miss a payment!)\n• 30% — Credit utilization (keep below 30%)\n• 15% — Length of credit history\n• 10% — Credit mix\n• 10% — New credit inquiries\n\n**Quick tips to improve:**\n1. Pay every bill on time — set autopay\n2. Keep credit card balances low\n3. Don't close old accounts\n4. Check for errors at annualcreditreport.com\n\n💡 Check out our "Build Credit" lesson in the Lessons section!`, type: 'info' }
  }

  if (/budget|50.30.20|how to budget/i.test(lower)) {
    return { text: `The **50/30/20 Rule** is the simplest budgeting framework:\n\n• **50% — Needs:** Rent, groceries, utilities, minimum debt payments\n• **30% — Wants:** Dining out, subscriptions, entertainment, hobbies\n• **20% — Savings & Debt:** Emergency fund, retirement, investing, extra debt payments\n\n**Example on $4,000/month:**\n• Needs: $2,000\n• Wants: $1,200\n• Savings: $800\n\n💡 Read our full Budgeting article or try the "Create a Personal Budget" lesson for step-by-step guidance!`, type: 'info' }
  }

  if (/emergency fund|savings|how much.*save/i.test(lower)) {
    return { text: `**Emergency Fund Basics:**\n\n🎯 **Goal:** 3–6 months of living expenses in a liquid, accessible account.\n\n**Why:** Protects you from going into debt when life throws surprises — job loss, car repairs, medical bills.\n\n**Where to keep it:**\nHigh-Yield Savings Account (HYSA) — currently paying 4.5–5% APY at online banks like Ally, Marcus, or SoFi.\n\n**How to build it:**\n• Start with a $1,000 mini-goal\n• Automate $25–$100 per paycheck\n• Park windfalls (tax refunds, bonuses) directly in it\n\n💡 Read our Emergency Fund article for the full breakdown!`, type: 'info' }
  }

  if (/what is.*stock|how do stocks work|why invest/i.test(lower)) {
    return { text: `When you buy a **stock**, you're buying a tiny piece of ownership in a real company.\n\n**How you make money:**\n• **Price appreciation** — Stock goes up, your slice is worth more\n• **Dividends** — Company shares profits with shareholders\n\n**The risk:** Prices can go down too. That's why diversification (owning many stocks) and long time horizons matter.\n\n**Try it here!** Type **BUY 5 AAPL** to practice buying 5 shares of Apple. You start with $10,000 in virtual cash — no real money at risk. 🎯`, type: 'info' }
  }

  if (/risk|risky|volatile/i.test(lower)) {
    return { text: `**Investment Risk Levels (low to high):**\n\n🟢 **Low risk:** Bonds, CDs, HYSAs, Treasury bills\n🟡 **Medium risk:** Index funds (VTI, SPY), dividend stocks\n🔴 **High risk:** Individual stocks (TSLA, NVDA), crypto, options\n\n**Key principle:** Higher potential return = higher risk. That's the trade-off.\n\n**Rule of thumb:**\n• Money you need in <3 years → Keep in savings (low risk)\n• Money for 3–10 years → Mix of stocks and bonds\n• Money for 10+ years → Mostly stocks (time smooths out volatility)\n\nIn this simulator, try both — buy some VTI (safe) and some TSLA (volatile)!`, type: 'info' }
  }

  if (/hello|hi|hey|good morning|good evening/i.test(lower)) {
    return {
      text: `Hey! 👋 I'm your moneasey financial assistant.\n\nI can help you:\n• **Practice trading** — try **BUY 5 AAPL** or **PRICE NVDA**\n• **Learn about investing** — ask "What is an index fund?"\n• **Get financial tips** — ask about budgeting, credit, savings, and more\n\nType **HELP** to see all commands, or just ask me anything!`,
      type: 'greeting'
    }
  }

  if (/thank/i.test(lower)) {
    return { text: `You're welcome! 😊 Keep learning and building those financial habits. Every question you ask is a step toward financial freedom.\n\nAnything else I can help with? Type **HELP** to see all options.`, type: 'info' }
  }

  // Generic fallback
  return {
    text: `I didn't quite catch that. Here are some things I can help with:\n\n**Trading:** BUY [shares] [ticker] · SELL [shares] [ticker] · PRICE [ticker] · PORTFOLIO\n\n**Questions:** Ask me about investing, budgeting, credit scores, emergency funds, ETFs, Roth IRAs, and more!\n\nType **HELP** for a full list of commands.`,
    type: 'fallback'
  }
}

// ─── Message renderer ─────────────────────────────────────────────────────────
function renderText(text) {
  return text.split('\n').map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/).map((p, j) =>
      p.startsWith('**') ? <strong key={j}>{p.slice(2, -2)}</strong> : p
    )
    return <span key={i} className="msg-line">{parts}</span>
  })
}

// ─── Main Component ───────────────────────────────────────────────────────────
const INITIAL_BALANCE = 10000

const WELCOME = {
  id: 0,
  from: 'bot',
  text: `Welcome to the **moneasey Trade Simulator!** 📈\n\nYou have **$10,000 in virtual cash** — no real money involved. This is a safe space to practice trading and learn about investing.\n\n**Quick start:**\n• Type **BUY 5 AAPL** to buy 5 shares of Apple\n• Type **PRICE NVDA** to check a stock price\n• Type **PORTFOLIO** to see your holdings\n• Type **HELP** for all commands\n\nOr just ask me a financial question — I'm here to teach! 🎓`,
  type: 'greeting'
}

const QUICK_ACTIONS = [
  'PORTFOLIO', 'HELP', 'PRICE AAPL', 'BUY 5 VTI',
  'What is an index fund?', 'How do I build credit?'
]

export default function Chatbot() {
  const [messages, setMessages] = useState([WELCOME])
  const [input, setInput] = useState('')
  const [portfolio, setPortfolio] = useState({})
  const [balance, setBalance] = useState(INITIAL_BALANCE)
  const [isTyping, setIsTyping] = useState(false)
  const endRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const sendMessage = (text) => {
    const msg = text || input.trim()
    if (!msg) return
    setInput('')

    const userMsg = { id: Date.now(), from: 'user', text: msg }
    setMessages(m => [...m, userMsg])
    setIsTyping(true)

    setTimeout(() => {
      const response = getResponse(msg, portfolio, balance, setPortfolio, setBalance)
      setMessages(m => [...m, { id: Date.now() + 1, from: 'bot', ...response }])
      setIsTyping(false)
    }, 600 + Math.random() * 400)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const totalValue = balance + Object.entries(portfolio).reduce((sum, [ticker, { shares }]) => {
    return sum + shares * (STOCKS[ticker]?.price || 0)
  }, 0)

  const pnl = totalValue - INITIAL_BALANCE
  const pnlPct = (pnl / INITIAL_BALANCE) * 100

  return (
    <main className="chatbot-page">
      <div className="chatbot-layout">
        {/* ── Left panel: Portfolio summary ── */}
        <aside className="chat-sidebar">
          <div className="sidebar-header">
            <span className="sidebar-title">Your Portfolio</span>
            <span className="sim-badge">SIMULATION</span>
          </div>

          <div className="balance-card">
            <div className="balance-label">Total Value</div>
            <div className="balance-amount">{fmtMoney(totalValue)}</div>
            <div className={`balance-pnl ${pnl >= 0 ? 'pos' : 'neg'}`}>
              {pnl >= 0 ? '▲' : '▼'} {fmtMoney(Math.abs(pnl))} ({pnl >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%)
            </div>
          </div>

          <div className="sidebar-row">
            <span>Cash Available</span>
            <span className="sidebar-val">{fmtMoney(balance)}</span>
          </div>
          <div className="sidebar-divider" />

          {Object.keys(portfolio).length === 0 ? (
            <div className="empty-portfolio">
              <span>📭</span>
              <p>No positions yet.<br />Try: <strong>BUY 5 AAPL</strong></p>
            </div>
          ) : (
            <div className="positions-list">
              <div className="positions-header">
                <span>Positions</span>
                <span>{Object.keys(portfolio).length} holdings</span>
              </div>
              {Object.entries(portfolio).map(([ticker, { shares, avgCost }]) => {
                const stock = STOCKS[ticker]
                const value = shares * stock.price
                const gain = stock.price - avgCost
                const gainPct = (gain / avgCost) * 100
                return (
                  <div key={ticker} className="position-row">
                    <div className="pos-left">
                      <span className="pos-ticker">{ticker}</span>
                      <span className="pos-shares">{fmtShares(shares)} shares</span>
                    </div>
                    <div className="pos-right">
                      <span className="pos-value">{fmtMoney(value)}</span>
                      <span className={`pos-gain ${gainPct >= 0 ? 'pos' : 'neg'}`}>
                        {gainPct >= 0 ? '+' : ''}{gainPct.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="sidebar-divider" />
          <div className="stock-ticker-list">
            <div className="stock-list-header">Market</div>
            {Object.entries(STOCKS).slice(0, 6).map(([t, s]) => (
              <div key={t} className="stock-row">
                <span className="stock-sym">{t}</span>
                <span className="stock-price">{fmtMoney(s.price)}</span>
                <span className={`stock-chg ${s.change >= 0 ? 'pos' : 'neg'}`}>
                  {s.change >= 0 ? '+' : ''}{fmtMoney(s.change)}
                </span>
              </div>
            ))}
          </div>
        </aside>

        {/* ── Right panel: Chat ── */}
        <div className="chat-panel">
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="bot-avatar">💹</div>
              <div>
                <div className="bot-name">moneasey AI</div>
                <div className="bot-status"><span className="status-dot" /> Online · Simulation Mode</div>
              </div>
            </div>
            <button
              className="reset-chat-btn"
              onClick={() => {
                setMessages([WELCOME])
                setPortfolio({})
                setBalance(INITIAL_BALANCE)
              }}
            >
              Reset
            </button>
          </div>

          <div className="chat-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`msg-wrap msg-${msg.from}`}>
                {msg.from === 'bot' && <div className="msg-avatar">💹</div>}
                <div className={`msg-bubble msg-bubble-${msg.from}`}>
                  {msg.type === 'portfolio' && msg.portfolio ? (
                    <div className="portfolio-msg">
                      <p className="msg-line"><strong>📊 Portfolio Overview</strong></p>
                      <div className="portfolio-table">
                        {msg.portfolio.map(p => (
                          <div key={p.ticker} className="pt-row">
                            <div className="pt-ticker">{p.ticker}</div>
                            <div className="pt-detail">
                              <span>{fmtShares(p.shares)} shares @ {fmtMoney(p.avgCost)} avg</span>
                              <span className={p.gain >= 0 ? 'pos' : 'neg'}>
                                {p.gain >= 0 ? '+' : ''}{fmtMoney(p.gain)} ({p.gainPct >= 0 ? '+' : ''}{p.gainPct.toFixed(2)}%)
                              </span>
                            </div>
                            <div className="pt-value">{fmtMoney(p.value)}</div>
                          </div>
                        ))}
                        <div className="pt-totals">
                          <span>Cash: {fmtMoney(msg.balance)}</span>
                          <span>Total: {fmtMoney(msg.totalValue)}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="msg-text">{renderText(msg.text)}</div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="msg-wrap msg-bot">
                <div className="msg-avatar">💹</div>
                <div className="msg-bubble msg-bubble-bot">
                  <div className="typing-dots">
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Quick actions */}
          <div className="quick-actions">
            {QUICK_ACTIONS.map(q => (
              <button key={q} className="quick-btn" onClick={() => sendMessage(q)}>
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="chat-input-area">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Type a command or ask a financial question..."
              className="chat-input"
            />
            <button
              className="send-btn"
              onClick={() => sendMessage()}
              disabled={!input.trim()}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
