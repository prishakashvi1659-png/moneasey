import { useState, useRef, useEffect, useCallback } from 'react'
import './Chatbot.css'

// ─── Stock Universe ───────────────────────────────────────────────────────────
const STOCKS = {
  AAPL:  { name: 'Apple Inc.',             price: 213.42, sector: 'Technology',    pe: 28.4, cap: '3.3T', beta: 1.2,  wk52h: 237.23, wk52l: 164.08 },
  MSFT:  { name: 'Microsoft Corp.',        price: 428.17, sector: 'Technology',    pe: 34.1, cap: '3.2T', beta: 0.9,  wk52h: 468.35, wk52l: 385.58 },
  GOOGL: { name: 'Alphabet Inc.',          price: 178.56, sector: 'Technology',    pe: 22.3, cap: '2.2T', beta: 1.1,  wk52h: 207.05, wk52l: 140.53 },
  AMZN:  { name: 'Amazon.com Inc.',        price: 195.88, sector: 'Consumer',      pe: 44.2, cap: '2.1T', beta: 1.3,  wk52h: 242.52, wk52l: 151.61 },
  TSLA:  { name: 'Tesla Inc.',             price: 186.40, sector: 'Consumer',      pe: 61.8, cap: '595B', beta: 2.3,  wk52h: 488.54, wk52l: 138.80 },
  NVDA:  { name: 'NVIDIA Corp.',           price: 1089.50,sector: 'Technology',    pe: 68.5, cap: '2.7T', beta: 1.7,  wk52h: 1255.87,wk52l: 435.00 },
  META:  { name: 'Meta Platforms',         price: 524.36, sector: 'Technology',    pe: 25.6, cap: '1.3T', beta: 1.4,  wk52h: 602.95, wk52l: 392.23 },
  JPM:   { name: 'JPMorgan Chase',         price: 218.63, sector: 'Financials',    pe: 12.4, cap: '631B', beta: 1.1,  wk52h: 265.30, wk52l: 168.91 },
  JNJ:   { name: 'Johnson & Johnson',      price: 152.44, sector: 'Healthcare',    pe: 14.8, cap: '367B', beta: 0.5,  wk52h: 168.40, wk52l: 143.13 },
  XOM:   { name: 'ExxonMobil Corp.',       price: 108.72, sector: 'Energy',        pe: 13.2, cap: '434B', beta: 0.8,  wk52h: 123.95, wk52l: 95.77  },
  VTI:   { name: 'Vanguard Total Mkt ETF', price: 241.88, sector: 'ETF',           pe: 22.1, cap: 'Fund', beta: 1.0,  wk52h: 265.68, wk52l: 203.23 },
  SPY:   { name: 'S&P 500 ETF',            price: 538.62, sector: 'ETF',           pe: 21.8, cap: 'Fund', beta: 1.0,  wk52h: 589.24, wk52l: 450.98 },
  BRK:   { name: 'Berkshire Hathaway',     price: 412.10, sector: 'Financials',    pe: 8.9,  cap: '898B', beta: 0.9,  wk52h: 487.26, wk52l: 375.00 },
  COIN:  { name: 'Coinbase Global',        price: 231.75, sector: 'Financials',    pe: 38.2, cap: '58B',  beta: 3.1,  wk52h: 349.75, wk52l: 115.41 },
  PFE:   { name: 'Pfizer Inc.',            price: 27.88,  sector: 'Healthcare',    pe: 11.2, cap: '158B', beta: 0.6,  wk52h: 31.54,  wk52l: 24.48  },
  BA:    { name: 'Boeing Co.',             price: 168.45, sector: 'Industrials',   pe: 58.1, cap: '131B', beta: 1.5,  wk52h: 267.54, wk52l: 137.03 },
  GLD:   { name: 'Gold ETF (SPDR)',        price: 234.60, sector: 'Commodities',   pe: null, cap: 'Fund', beta: 0.1,  wk52h: 256.89, wk52l: 174.59 },
  PLTR:  { name: 'Palantir Technologies',  price: 82.44,  sector: 'Technology',    pe: 201.0,cap: '177B', beta: 2.4,  wk52h: 125.41, wk52l: 15.98  },
  NFLX:  { name: 'Netflix Inc.',           price: 648.20, sector: 'Consumer',      pe: 43.2, cap: '281B', beta: 1.3,  wk52h: 941.75, wk52l: 476.67 },
  DIS:   { name: 'Walt Disney Co.',        price: 112.33, sector: 'Consumer',      pe: 29.4, cap: '205B', beta: 1.1,  wk52h: 123.73, wk52l: 83.91  },
}

const SECTOR_COLORS = {
  Technology: '#10b981', Financials: '#3b82f6', Healthcare: '#a78bfa',
  Consumer: '#f59e0b', Energy: '#ef4444', Industrials: '#6b7280',
  ETF: '#06b6d4', Commodities: '#d97706',
}

// ─── Formatting helpers ───────────────────────────────────────────────────────
const fmt  = n => n.toLocaleString('en-US', { style:'currency', currency:'USD', minimumFractionDigits:2, maximumFractionDigits:2 })
const fmtS = n => n % 1 === 0 ? n : parseFloat(n.toFixed(4))
const fmtP = n => (n >= 0 ? '+' : '') + n.toFixed(2) + '%'

// ─── Market news events ───────────────────────────────────────────────────────
const NEWS_EVENTS = [
  { headline: '🔥 Fed signals rates unchanged through Q3', effect: { SPY: +0.8, VTI: +0.7, JPM: +1.2, BRK: +0.5 } },
  { headline: '📉 Tech selloff as yields rise sharply', effect: { AAPL: -2.1, MSFT: -1.8, NVDA: -3.2, GOOGL: -1.5 } },
  { headline: '🚀 NVIDIA beats earnings by 40% — AI boom continues', effect: { NVDA: +8.4, PLTR: +5.2, MSFT: +2.1 } },
  { headline: '⛽ Oil jumps 4% on OPEC supply cut announcement', effect: { XOM: +3.8, BA: -1.2, SPY: -0.4 } },
  { headline: '💊 FDA approves new Pfizer blockbuster drug', effect: { PFE: +6.2, JNJ: +1.8 } },
  { headline: '📊 Strong jobs report — economy growing faster than expected', effect: { SPY: +1.1, VTI: +0.9, JPM: +2.3 } },
  { headline: '🪙 Bitcoin hits new all-time high — crypto stocks surge', effect: { COIN: +12.4, PLTR: +3.1 } },
  { headline: '🎬 Netflix subscriber growth beats expectations', effect: { NFLX: +9.2, DIS: +2.4 } },
  { headline: '🚗 Tesla misses delivery targets — stock drops', effect: { TSLA: -5.8, AMZN: -0.6 } },
  { headline: '🏦 JPMorgan raises dividend 12% — buyback announced', effect: { JPM: +4.1, BRK: +1.2 } },
  { headline: '🌍 Global recession fears mount — safe havens rally', effect: { GLD: +2.8, JNJ: +1.4, XOM: -1.2, TSLA: -4.1 } },
  { headline: '💻 Apple unveils next-gen AI chip — supply chain positive', effect: { AAPL: +3.3, NVDA: +2.1 } },
]

// ─── Comprehensive knowledge base ────────────────────────────────────────────
const KB = [
  // Technical Analysis
  { match: /moving average|sma|ema|50.?day|200.?day/, answer: `**Moving Averages** are one of the most widely used technical indicators in trading.\n\n**Simple Moving Average (SMA):** The average closing price over N periods. The **50-day SMA** and **200-day SMA** are benchmarks watched by virtually every institutional trader.\n\n**Golden Cross vs. Death Cross:**\n• **Golden Cross** — 50-day SMA crosses *above* 200-day SMA → bullish signal, often precedes sustained rallies\n• **Death Cross** — 50-day SMA crosses *below* 200-day SMA → bearish signal, often precedes corrections\n\n**Exponential Moving Average (EMA):** Weights recent prices more heavily than older ones. The 12-day and 26-day EMAs form the basis of the MACD indicator.\n\n💡 Moving averages are *lagging* indicators — they confirm trends rather than predict them. Best used alongside momentum indicators like RSI.` },
  { match: /rsi|relative strength|overbought|oversold/, answer: `**RSI (Relative Strength Index)** measures the speed and magnitude of recent price changes to evaluate whether a stock is overbought or oversold.\n\n**How it works:** RSI oscillates between 0 and 100:\n• **Above 70** → Overbought — the stock may be due for a pullback\n• **Below 30** → Oversold — the stock may be undervalued relative to recent history\n• **50** → Neutral momentum\n\n**RSI Divergence:** One of the most powerful signals:\n• *Bullish divergence* — price makes a new low but RSI makes a higher low → potential reversal up\n• *Bearish divergence* — price makes a new high but RSI makes a lower high → potential reversal down\n\n**Limitations:** RSI can stay overbought for extended periods during strong uptrends (like NVDA in 2023-24). Always confirm with price action and volume.\n\nTry: **ANALYZE** to see which stocks in your portfolio have notable RSI signals right now.` },
  { match: /macd|signal line|histogram/, answer: `**MACD (Moving Average Convergence Divergence)** is a momentum indicator showing the relationship between two EMAs.\n\n**Components:**\n• **MACD Line** = 12-day EMA minus 26-day EMA\n• **Signal Line** = 9-day EMA of the MACD line\n• **Histogram** = MACD minus Signal line (shows momentum)\n\n**Key signals:**\n• MACD crossing *above* Signal Line → bullish momentum building\n• MACD crossing *below* Signal Line → bearish momentum building\n• Histogram bars growing → trend accelerating\n• Histogram bars shrinking → trend weakening\n\n**Center-line crossovers:** When MACD crosses above zero = bullish. Below zero = bearish.\n\n💡 MACD is particularly effective for identifying trend reversals in mid-cap stocks. Less reliable in sideways, choppy markets.` },
  { match: /bollinger band|standard deviation|volatility band/, answer: `**Bollinger Bands** consist of three lines plotted around a 20-day SMA:\n• **Upper Band** = SMA + 2 standard deviations\n• **Middle Band** = 20-day SMA\n• **Lower Band** = SMA - 2 standard deviations\n\n**Key interpretations:**\n• **Squeeze** — bands narrow significantly → low volatility, big move coming (direction unknown)\n• **Expansion** — bands widen → high volatility, trend is in motion\n• Price touching **upper band** during uptrend = strength, not necessarily overbought\n• Price touching **lower band** during downtrend = weakness, not necessarily a buy\n\n**%B indicator:** Where price is relative to the bands (above 1 = above upper band, below 0 = below lower band).\n\nBollinger himself says the bands are *not* buy/sell signals by themselves — they define relative high and low prices in a dynamic context.` },
  { match: /support|resistance|level|breakout/, answer: `**Support and Resistance** are price levels where buying or selling pressure historically concentrates.\n\n**Support:** A price floor where demand consistently emerges — buyers step in, preventing further decline. When support breaks, it often becomes new resistance.\n\n**Resistance:** A price ceiling where selling pressure consistently emerges — sellers step in, capping advances. When resistance breaks, it often becomes new support.\n\n**Why they work:** Large institutional players place limit orders at key levels. Round numbers ($100, $500) attract disproportionate order flow.\n\n**Types of levels:**\n• **Horizontal support/resistance** — previous highs and lows\n• **Trend lines** — dynamic support/resistance along a trend\n• **Fibonacci retracements** — 38.2%, 50%, 61.8% retracements of prior moves\n• **Moving averages** — the 200-day SMA often acts as dynamic support in bull markets\n\n**Volume confirmation:** A breakout on high volume is far more reliable than one on low volume.` },

  // Options
  { match: /option|call|put|strike|expir|premium|iv |implied vol/, answer: `**Options** are contracts giving the buyer the *right but not obligation* to buy or sell 100 shares at a specified price before expiration.\n\n**Calls vs. Puts:**\n• **Call option** — right to *buy* shares at the strike price. Profitable when the stock rises.\n• **Put option** — right to *sell* shares at the strike price. Profitable when the stock falls (used as insurance).\n\n**Key terms:**\n• **Strike price** — the agreed purchase/sale price\n• **Premium** — what you pay for the option (your max loss as a buyer)\n• **Expiration date** — when the contract expires worthless or is exercised\n• **ITM/ATM/OTM** — In/At/Out of The Money\n\n**The Greeks:**\n• **Delta** — how much the option price moves per $1 move in the stock (0-1 for calls)\n• **Theta** — time decay, options lose value every day (enemy of buyers, friend of sellers)\n• **Vega** — sensitivity to implied volatility changes\n• **Gamma** — rate of change of Delta\n\n**Implied Volatility (IV):** The market's forecast of future volatility baked into option prices. High IV = expensive options. "IV Crush" after earnings is a common trap for option buyers.\n\n⚠️ Options are leveraged instruments. Most retail option buyers lose money. Understand theta decay before trading.` },
  { match: /covered call|cash secured put|wheel|selling option/, answer: `**Covered Calls and Cash-Secured Puts** are income-generating options strategies considered appropriate for many retail investors.\n\n**Covered Call:**\n• Own 100+ shares of a stock\n• Sell a call option against your shares at a strike above current price\n• Collect the premium as income\n• Risk: if stock surges past strike, your upside is capped\n• Best for: stocks you're willing to sell, or flat/mild uptrend markets\n\n**Cash-Secured Put:**\n• Hold cash equal to 100× the strike price\n• Sell a put option at a strike you'd be happy buying the stock at\n• Collect premium. If stock drops to that price, you buy shares (at a discount)\n• If stock stays above strike, keep premium free and clear\n\n**The Wheel Strategy:** Sell cash-secured put → get assigned → sell covered call → get called away → repeat. Generates consistent premium income on stocks you'd own anyway.\n\n💡 These strategies have a much higher probability of profit than buying options. They're how Warren Buffett has used options to generate income.` },

  // Bonds & Fixed Income
  { match: /bond|yield|coupon|duration|treasury|fixed income|interest rate|fed rate/, answer: `**Bonds** are loans you make to a government or corporation in exchange for regular interest payments (coupon) plus return of principal at maturity.\n\n**The inverse relationship:** When interest rates rise, existing bond prices fall (and vice versa). This is the most important concept in fixed income.\n\n**Why:** If you hold a bond paying 3% and new bonds pay 5%, yours is worth less — nobody wants the 3% bond unless its price falls enough to be competitive.\n\n**Types:**\n• **U.S. Treasuries** — backed by the full faith of the U.S. government. The global risk-free benchmark.\n• **Corporate bonds** — higher yields, higher risk. Investment-grade (BBB+ and above) vs. High-yield/"junk" (BB and below)\n• **Municipal bonds ("munis")** — issued by states/cities, often tax-exempt — valuable for high-income investors\n• **TIPS** — Treasury Inflation-Protected Securities, principal adjusts with CPI\n\n**Yield Curve:** Normally upward sloping (longer maturities = higher yields). An **inverted yield curve** (short rates higher than long rates) has historically predicted recessions.\n\n**Duration:** Measures sensitivity to rate changes. A duration of 7 means the bond loses ~7% in value for every 1% rise in interest rates.` },

  // Macro & Economics
  { match: /inflation|cpi|pce|purchasing power|price level/, answer: `**Inflation** is the rate at which the general price level rises, eroding purchasing power over time.\n\n**How it's measured:**\n• **CPI (Consumer Price Index)** — tracks prices of a basket of consumer goods; most-cited headline inflation measure\n• **Core CPI** — excludes food and energy (most volatile components); watched closely by the Fed\n• **PCE (Personal Consumption Expenditures)** — the Fed's *preferred* inflation measure; weights spending categories by actual consumption\n\n**Fed's target:** 2% annual inflation — enough to prevent deflation but not so high it distorts economic decisions.\n\n**How inflation affects your portfolio:**\n• **Stocks:** Generally positive for equities long-term (companies can raise prices), but rising inflation often triggers rate hikes that hurt growth stocks\n• **Bonds:** Devastating for fixed-income holders — inflation erodes the real value of future coupon payments\n• **Real assets:** Gold, commodities, real estate, and TIPS tend to hold value during inflationary periods\n• **Cash:** Slowly destroyed by inflation — $100 today = ~$73 in purchasing power after 10 years at 3% inflation\n\n**Current implications for your portfolio:** Check **ANALYZE** to see how inflation-sensitive your holdings are.` },
  { match: /gdp|recession|economic growth|contraction|expansion/, answer: `**GDP (Gross Domestic Product)** measures the total monetary value of all goods and services produced in an economy during a specific period.\n\n**Components (C + I + G + NX):**\n• **Consumption (C)** — household spending (~70% of U.S. GDP)\n• **Investment (I)** — business capital expenditure, construction\n• **Government (G)** — federal, state, local spending\n• **Net Exports (NX)** — exports minus imports\n\n**Growth rates:**\n• Normal healthy growth: 2-3% annually\n• **Recession:** Two consecutive quarters of negative GDP growth\n• **Depression:** Severe, prolonged recession (GDP falls >10%)\n• **Stagflation:** Slow growth + high inflation simultaneously (1970s U.S.)\n\n**GDP and markets:** Stock markets are *forward-looking* — they often fall before GDP contracts and recover before it does. The market is not the economy.\n\n**Leading indicators to watch:** PMI (Purchasing Managers Index), initial jobless claims, consumer confidence, yield curve shape — these give advance warning of economic turning points.` },
  { match: /federal reserve|fed|monetary policy|interest rate|rate hike|rate cut|powell|fomc/, answer: `**The Federal Reserve** is the U.S. central bank, responsible for maintaining price stability and maximum employment (the "dual mandate").\n\n**Primary tool: The Federal Funds Rate**\nThe rate banks charge each other for overnight lending. When the Fed raises this rate, borrowing becomes more expensive throughout the entire economy.\n\n**How rate changes affect markets:**\n• **Rate hikes:** Reduce inflation → but slow economic growth → hurt growth stocks (higher discount rate reduces present value of future earnings) → strengthen the dollar → hurt emerging markets\n• **Rate cuts:** Stimulate growth → boost risk assets → weaken dollar → inflate asset prices\n\n**The FOMC (Federal Open Market Committee)** meets 8 times per year to set rate policy. Markets scrutinize every word of their statements and press conferences.\n\n**Quantitative Easing (QE) vs. Tightening (QT):**\n• QE — Fed buys bonds, injecting money into the economy (used in 2008, 2020 crises)\n• QT — Fed shrinks its balance sheet, removing liquidity from markets\n\n**"Don't fight the Fed"** is one of the oldest market adages. Policy direction is the most important macro variable for asset prices.` },
  { match: /dollar|dxy|currency|forex|exchange rate/, answer: `**The U.S. Dollar (DXY Index)** measures dollar strength against a basket of 6 major currencies. It has enormous implications for global markets.\n\n**Strong dollar effects:**\n• U.S. multinationals earn less when foreign revenues are converted back (hurts AAPL, MSFT, GOOGL)\n• Commodities priced in dollars (oil, gold) typically fall\n• Emerging market economies with dollar-denominated debt face pressure\n• U.S. imports become cheaper → deflationary\n\n**Weak dollar effects:**\n• Boosts U.S. exports (American goods cheaper for foreigners)\n• Lifts commodity prices\n• Positive for gold, which is dollar-denominated\n• Benefits emerging markets\n\n**What drives the dollar:** Fed policy (higher rates → stronger dollar), relative economic growth, geopolitical safe-haven demand, and current account dynamics.\n\n**For investors:** A surging dollar (DXY above 105) is often a headwind for broad equity markets — watch it as a key macro signal.` },

  // Portfolio Theory
  { match: /modern portfolio|efficient frontier|markowitz|sharpe|optimal portfolio/, answer: `**Modern Portfolio Theory (MPT)**, developed by Harry Markowitz in 1952, revolutionized how we think about investment risk.\n\n**Core insight:** Investors should not evaluate a security in isolation, but consider how it contributes to the overall portfolio's risk-return profile.\n\n**The Efficient Frontier:** A curve representing portfolios that offer the maximum expected return for a given level of risk (standard deviation). Portfolios below the frontier are suboptimal.\n\n**Key metrics:**\n• **Standard Deviation (σ)** — measures total portfolio volatility\n• **Sharpe Ratio** = (Portfolio Return - Risk-Free Rate) / Standard Deviation. Higher is better. A Sharpe above 1.0 is good; above 2.0 is excellent.\n• **Correlation** — the key to diversification. Assets with low or negative correlation reduce portfolio volatility without necessarily reducing returns.\n\n**Practical implications:**\n• Adding a volatile asset (like gold) can actually *reduce* portfolio risk if it's negatively correlated with equities\n• The benefits of diversification diminish as you add more than ~20-30 uncorrelated positions\n• Market-cap-weighted index funds sit close to the efficient frontier after fees\n\nType **ANALYZE** to see your portfolio's estimated Sharpe ratio and diversification metrics.` },
  { match: /beta|systematic risk|market risk|alpha|jensen/, answer: `**Beta (β)** measures a stock's sensitivity to market movements — its *systematic risk* that cannot be diversified away.\n\n**Interpreting beta:**\n• **β = 1.0** — moves in line with the market (SPY)\n• **β > 1.0** — more volatile than the market (TSLA β≈2.3, COIN β≈3.1)\n• **β < 1.0** — less volatile (JNJ β≈0.5, GLD β≈0.1)\n• **β < 0** — moves inversely to the market (rare, certain inverse ETFs)\n\n**Alpha (α):** The return above what beta would predict. Positive alpha means the manager/stock outperformed on a risk-adjusted basis. True consistent alpha is extraordinarily rare.\n\n**CAPM (Capital Asset Pricing Model):**\nExpected Return = Risk-Free Rate + β × (Market Return - Risk-Free Rate)\n\n**Portfolio beta:** The weighted average of individual stock betas. A portfolio beta of 1.4 means your portfolio is expected to rise/fall 1.4× as much as the S&P 500.\n\nType **ANALYZE** to see your portfolio's calculated beta and what it means for your risk exposure.` },
  { match: /factor|value factor|growth factor|momentum|quality|size factor/, answer: `**Factor Investing** (also called "Smart Beta") targets specific, academically-documented drivers of excess returns.\n\n**The Five Core Factors:**\n\n**1. Value** — cheap stocks (low P/E, P/B) outperform expensive ones over long periods. Risk: value traps.\n\n**2. Size** — small-cap stocks outperform large-caps historically. Risk: higher volatility and liquidity risk.\n\n**3. Momentum** — stocks that have risen over the past 6-12 months tend to continue rising. Risk: sharp reversals during market crashes.\n\n**4. Quality** — companies with strong balance sheets, high ROE, stable earnings outperform. Risk: often expensive.\n\n**5. Low Volatility** — surprisingly, lower-volatility stocks have historically outperformed high-volatility ones on a risk-adjusted basis.\n\n**Factor ETFs:** Vanguard, BlackRock, and DFA offer low-cost factor ETFs. Many institutional portfolios target specific factor tilts.\n\n**The debate:** After factors become well-known, their premiums tend to compress. Some argue factors are now "arbitraged away." Others argue behavioral biases ensure their persistence.` },

  // Advanced strategies
  { match: /hedge fund|long.?short|arbitrage|market neutral|two.?and.?twenty/, answer: `**Hedge funds** are private investment vehicles for accredited investors (typically $1M+ net worth) that use sophisticated strategies unavailable to retail investors.\n\n**Common strategies:**\n• **Long/Short Equity** — buy undervalued stocks, short overvalued ones. Net exposure can be market-neutral.\n• **Global Macro** — bets on macroeconomic trends across currencies, rates, commodities (think George Soros)\n• **Statistical Arbitrage** — exploit tiny pricing discrepancies using algorithms at high frequency\n• **Event-Driven** — profit from M&A deals, bankruptcies, spin-offs\n• **Convertible Arbitrage** — exploit mispricing between convertible bonds and underlying equity\n\n**The fee structure ("2 and 20"):**\n• 2% annual management fee on all assets\n• 20% performance fee on profits above a "hurdle rate"\n\n**Performance reality:** The average hedge fund has underperformed the S&P 500 net of fees for the past 15+ years. Warren Buffett famously won a $1M bet that an index fund would beat a basket of hedge funds over 10 years.\n\n**Why they persist:** For institutional investors, hedge funds offer genuine uncorrelated returns, not just raw performance.` },
  { match: /short sell|short selling|short squeeze|naked short/, answer: `**Short selling** is borrowing shares and selling them, hoping to buy them back cheaper later and pocket the difference.\n\n**Mechanics:**\n1. Borrow 100 shares of XYZ at $50 from a broker\n2. Sell them immediately for $5,000\n3. Stock falls to $35 — buy 100 shares for $3,500\n4. Return shares to broker. Profit: $1,500 (minus borrowing costs)\n\n**The asymmetry:** Maximum gain = 100% (stock goes to zero). Maximum loss = unlimited (stock can rise infinitely).\n\n**Short squeeze:** When a heavily-shorted stock rises sharply, shorts are forced to buy back shares to cover losses — this *buying* drives the price even higher, triggering more covering. GameStop (GME) in January 2021 is the most famous example — a 2,700% rise in 3 weeks.\n\n**Short interest:** Expressed as "days to cover" or % of float. High short interest (>20% of float) creates squeeze potential.\n\n**Regulatory note:** "Naked short selling" (selling shares you haven't borrowed) is illegal in the U.S. under SEC Rule SHO.` },
  { match: /tax.?loss harvest|wash sale|capital gain|tax efficient/, answer: `**Tax-Loss Harvesting** is the practice of selling investments at a loss to offset capital gains taxes, reducing your tax bill without meaningfully changing your portfolio.\n\n**How it works:**\n• You have $10,000 in capital gains from selling AAPL\n• You also hold TSLA at a $4,000 loss\n• Sell TSLA → realize the $4,000 loss → reduces net taxable gain to $6,000\n• Immediately buy a similar (but not identical) ETF to maintain market exposure\n\n**The Wash Sale Rule:** The IRS disallows the loss if you buy a "substantially identical" security within 30 days before or after the sale. Buy a different ETF — not the same fund.\n\n**Capital gains tax rates (2026):**\n• Short-term gains (held <1 year): taxed as ordinary income (up to 37%)\n• Long-term gains (held >1 year): 0%, 15%, or 20% depending on income\n\n**Key insight:** Holding investments >12 months before selling cuts your tax rate dramatically. Tax efficiency is often the single highest-return "investment" available.` },
  { match: /rebalance|rebalancing|drift|target allocation/, answer: `**Portfolio Rebalancing** is the process of realigning portfolio weights back to target allocations after market movements have caused drift.\n\n**Why it matters:** If your target is 70% stocks / 30% bonds and stocks surge, you might end up at 85/15 — far more risk than intended.\n\n**Rebalancing methods:**\n• **Calendar rebalancing** — quarterly or annually, regardless of drift\n• **Threshold rebalancing** — trigger when any asset class drifts >5% from target\n• **Hybrid** — check quarterly, rebalance only if threshold is breached\n\n**The contrarian advantage:** Rebalancing *forces* you to sell what's risen and buy what's fallen — systematically buying low and selling high.\n\n**Tax considerations:** In taxable accounts, rebalancing can trigger capital gains. Use new contributions to buy underweight assets instead, or rebalance inside tax-advantaged accounts (IRA, 401k).\n\n**Studies show** disciplined rebalancing adds approximately 0.4–0.5% annually in risk-adjusted returns over 20+ year periods — primarily from the systematic buy-low-sell-high discipline.\n\nType **ANALYZE** to see how far your current portfolio has drifted from an optimal allocation.` },

  // Cryptocurrency deeper
  { match: /bitcoin|btc|crypto|blockchain|defi|nft|ethereum|web3|altcoin/, answer: `**Bitcoin and Cryptocurrency** represent a fundamentally new asset class with unique risk-return characteristics.\n\n**Bitcoin fundamentals:**\n• Fixed supply of 21 million coins (19.7M currently mined)\n• **Halving events** every ~4 years cut new supply in half — historically preceded bull runs\n• Increasingly held by institutional investors and sovereign wealth funds\n• Correlation to equities has risen, reducing its diversification benefit\n\n**Ethereum's ecosystem:**\n• Programmable blockchain enabling smart contracts and decentralized applications\n• **DeFi (Decentralized Finance)** — lending, trading, derivatives without intermediaries\n• **Staking** yield currently 3-4% annually\n• Transitioned to Proof-of-Stake in 2022 ("The Merge"), reducing energy use ~99%\n\n**Key risks:**\n• Extreme volatility — 50-80% drawdowns are normal\n• Regulatory uncertainty remains significant\n• Smart contract vulnerabilities have led to billions in hacks\n• Environmental concerns (Bitcoin proof-of-work)\n\n**Portfolio allocation perspective:** Most financial advisors suggest 1-5% crypto allocation for investors with appropriate risk tolerance — enough to benefit meaningfully if it succeeds, not enough to be devastating if it fails.\n\nIn this simulator, try **BUY 2 COIN** for exposure to crypto ecosystem stocks.` },

  // Personal finance integration
  { match: /401k|403b|employer match|workplace retirement/, answer: `**The 401(k)** is the most powerful wealth-building tool available to most Americans — primarily because of the employer match and tax advantages.\n\n**How it works:**\n• Contribute pre-tax dollars → reduces your taxable income immediately\n• Investments grow tax-deferred until withdrawal\n• 2026 contribution limit: **$23,500** ($31,000 if 50+)\n• Employer match is literally free money — always contribute enough to capture 100% of the match\n\n**Traditional vs. Roth 401(k):**\n• Traditional: Tax break now, pay taxes in retirement\n• Roth: Pay taxes now, withdrawals are 100% tax-free in retirement\n• Rule of thumb: Roth if you expect higher taxes in retirement; Traditional if you expect lower\n\n**Investment strategy inside 401(k):**\n• Choose low-cost index funds (expense ratio <0.10%)\n• Avoid actively managed funds — their average expense ratio of 0.66% compounds to a massive drag\n• A $100,000 portfolio growing at 7% for 30 years: 0.03% fee → $740,000 vs. 1% fee → $574,000. That's $166,000 lost to fees.\n\n**Vesting schedules:** Company match may not be 100% yours immediately. Check your plan's vesting schedule.` },
  { match: /roth ira|backdoor roth|roth conversion/, answer: `**The Roth IRA** is arguably the most valuable account in the U.S. tax code for long-term wealth building.\n\n**The core advantage:** Pay taxes once, *never again.* Every dollar of growth and every withdrawal in retirement is completely tax-free.\n\n**2026 limits:** $7,000/year ($8,000 if 50+). Income limits apply — phase-out begins at $150K (single) and $236K (married).\n\n**The Backdoor Roth IRA:** For high earners above the income limit:\n1. Contribute to a non-deductible Traditional IRA ($7,000)\n2. Immediately convert to Roth IRA\n3. No income limit on conversions\n4. Result: Roth IRA benefits regardless of income\n\n*Note: Pro-rata rule applies if you have existing pre-tax IRA money.*\n\n**Roth IRA investment strategy:**\n• Put your *highest-growth* assets here (individual growth stocks, small-cap ETFs)\n• The more they grow, the more you avoid in taxes\n• A $7,000 Roth contribution growing at 10% for 40 years = $316,000 — all tax-free\n\n**Flexibility advantage:** Roth IRA contributions (not earnings) can be withdrawn any time, penalty-free. This makes it a secondary emergency fund.` },

  // More topics
  { match: /dollar.?cost.?average|dca|lump sum/, answer: `**Dollar-Cost Averaging (DCA)** means investing a fixed dollar amount at regular intervals regardless of market price.\n\n**Why it works psychologically:** Removes the impossible task of "timing the market." You buy more shares when prices are low, fewer when high — automatically.\n\n**DCA vs. Lump Sum — what the data shows:**\nVanguard research found **lump sum investing beats DCA ~66% of the time** over 12-month periods in rising markets. This makes sense — markets trend up over time, so more time invested = better expected returns.\n\n**But DCA wins in these situations:**\n• You receive income periodically (paycheck investing)\n• You're psychologically unable to withstand watching a large lump sum drop 30% immediately\n• Near market peaks (though you can't know this in advance)\n\n**The practical verdict:** If you have a lump sum, invest it immediately. If you're investing from ongoing income, DCA naturally through paycheck contributions. Don't let "waiting for a better price" keep you in cash — that's just market timing with extra steps.\n\n**In this simulator:** Set up recurring purchases by buying the same amount each "turn" — notice how your average cost changes over time.` },
  { match: /warren buffett|berkshire|value invest|benjamin graham|intrinsic value/, answer: `**Warren Buffett**, CEO of Berkshire Hathaway, is history's most successful long-term investor — turning $100 invested in 1965 into over $3.4 million by 2024 (an annualized return of ~20%).\n\n**Buffett's core principles:**\n• **Circle of competence** — only invest in businesses you deeply understand\n• **Economic moats** — seek companies with durable competitive advantages (brand, network effects, switching costs, cost advantages)\n• **Margin of safety** — buy at a significant discount to intrinsic value (Benjamin Graham's core concept)\n• **Long-term orientation** — "Our favorite holding period is forever"\n• **Management quality** — invest in businesses with honest, capable management\n\n**What Buffett says about individual investors:**\n*"By periodically investing in an index fund, the know-nothing investor can actually out-perform most investment professionals."*\n\n**Intrinsic value calculation:**\nThe present value of all future cash flows the business will generate, discounted at an appropriate rate. It requires estimating earnings growth, discount rates, and terminal value — all inherently uncertain.\n\n**BRK in this simulator:** Trading at P/E 8.9 — actually one of the cheapest large-caps by traditional metrics. Try: **PRICE BRK**` },
  { match: /passive invest|active invest|index|expense ratio|bogle|vanguard/, answer: `**The Active vs. Passive Debate** has been largely settled by decades of data — yet active management persists because it's more profitable for the industry.\n\n**The numbers:**\n• Over 15 years, **92% of active U.S. large-cap funds** underperformed their benchmark index (S&P SPIVA report, 2024)\n• The average actively managed fund charges 0.60-1.0% annually; the average index fund charges 0.03-0.20%\n• The performance gap is almost exactly equal to the fee difference — active managers as a group earn market returns before fees, market returns *minus fees* after\n\n**John Bogle's insight (founder of Vanguard):**\n*"In investing, you get what you don't pay for."*\n\n**When active investing might make sense:**\n• Small-cap and international markets (less efficient, more alpha opportunity)\n• Specific factor tilts (value, quality) implemented through rules-based ETFs\n• Tax-managed accounts where customization creates value\n\n**The index fund revolution:** Vanguard manages $10+ trillion. The shift to passive has been the biggest structural change in asset management in the past 50 years.\n\nIn this simulator, VTI and SPY are your passive core. Everything else represents active selection — track whether your picks beat them.` },

  // Greetings & meta
  { match: /hello|hi |hey |good morning|good evening|what can you|help me/, answer: `Hey! 👋 I'm the **moneasey AI Financial Analyst** — trained on modern portfolio theory, technical analysis, macroeconomics, behavioral finance, and more.\n\n**Trading commands:**\n• **BUY [shares] [ticker]** — execute a buy order\n• **SELL [shares] [ticker]** — execute a sell order\n• **PRICE [ticker]** — get detailed quote + fundamentals\n• **PORTFOLIO** — view holdings with P&L\n• **ANALYZE** — deep portfolio analysis (beta, Sharpe ratio, sector allocation, recommendations)\n• **COMPARE [ticker1] [ticker2]** — side-by-side stock comparison\n• **MARKET** — current market overview and sentiment\n• **NEWS** — trigger a market event\n• **CALC [amount] [rate%] [years]** — compound interest calculator\n• **HISTORY** — view your trade log\n• **WATCHLIST ADD/REMOVE [ticker]** — manage your watchlist\n• **TICKERS** — list all 20 available stocks\n\n**Or ask me anything about:** technical analysis, options, bonds, Fed policy, portfolio theory, factor investing, tax strategy, retirement planning, behavioral finance, crypto, and much more.\n\nYou start with **$10,000 in virtual cash.** What would you like to do?` },
  { match: /thank|thanks|appreciate/, answer: `You're welcome! The best investors are lifelong learners — every question you ask compounds like interest. 📈\n\nAnything else? Type **HELP** for commands or ask me about any financial concept.` },
]

// ─── Command processor ────────────────────────────────────────────────────────
function processCommand(raw, state) {
  const { portfolio, balance, tradeHistory, watchlist, prices } = state
  const input = raw.trim()
  const upper = input.toUpperCase()
  const lower = input.toLowerCase()

  // ── TICKERS ──
  if (/^tickers?$/i.test(input)) {
    const rows = Object.entries(STOCKS).map(([t, s]) =>
      `• **${t}** — ${s.name} (${s.sector})`
    ).join('\n')
    return { text: `**20 Available Stocks & ETFs:**\n\n${rows}`, type: 'info' }
  }

  // ── MARKET ──
  if (/^market$/i.test(input)) {
    const spyChange = ((prices.SPY - STOCKS.SPY.price) / STOCKS.SPY.price) * 100
    const vtChange = ((prices.VTI - STOCKS.VTI.price) / STOCKS.VTI.price) * 100
    const sentiment = spyChange > 0.5 ? '🟢 Bullish' : spyChange < -0.5 ? '🔴 Bearish' : '🟡 Neutral'
    const gainers = Object.entries(prices)
      .map(([t, p]) => ({ t, chg: ((p - STOCKS[t].price) / STOCKS[t].price) * 100 }))
      .sort((a, b) => b.chg - a.chg).slice(0, 3)
    const losers = Object.entries(prices)
      .map(([t, p]) => ({ t, chg: ((p - STOCKS[t].price) / STOCKS[t].price) * 100 }))
      .sort((a, b) => a.chg - b.chg).slice(0, 3)
    return {
      text: `**Market Overview**\n\nSentiment: ${sentiment}\nS&P 500 (SPY): ${fmt(prices.SPY)} (${fmtP(spyChange)})\nTotal Market (VTI): ${fmt(prices.VTI)} (${fmtP(vtChange)})\n\n**Top Gainers Today:**\n${gainers.map(g => `• ${g.t}: ${fmtP(g.chg)}`).join('\n')}\n\n**Top Losers Today:**\n${losers.map(l => `• ${l.t}: ${fmtP(l.chg)}`).join('\n')}\n\nType **NEWS** to trigger a market event, or **COMPARE SPY VTI** to benchmark your performance.`,
      type: 'market'
    }
  }

  // ── NEWS ──
  if (/^news$/i.test(input)) {
    const event = NEWS_EVENTS[Math.floor(Math.random() * NEWS_EVENTS.length)]
    return { text: `📰 **Market Flash:** ${event.headline}\n\nAffected stocks:\n${Object.entries(event.effect).map(([t, pct]) => `• ${t}: ${pct > 0 ? '+' : ''}${pct}%`).join('\n')}\n\n*Note: In a live market these moves would be immediate. In the simulator, refresh prices with PRICE [ticker].*`, type: 'news', event }
  }

  // ── HISTORY ──
  if (/^history$/i.test(input)) {
    if (tradeHistory.length === 0) return { text: `No trades yet. Try **BUY 5 AAPL** to make your first trade!`, type: 'info' }
    const rows = tradeHistory.slice(-10).reverse().map((t, i) =>
      `${i + 1}. ${t.type} ${fmtS(t.shares)} ${t.ticker} @ ${fmt(t.price)} — ${t.date}`
    ).join('\n')
    return { text: `**Recent Trade History (last 10):**\n\n${rows}`, type: 'info' }
  }

  // ── WATCHLIST ──
  const wlAdd = upper.match(/^WATCHLIST ADD ([A-Z]{2,5})$/)
  const wlRem = upper.match(/^WATCHLIST (?:REMOVE|DELETE) ([A-Z]{2,5})$/)
  if (/^watchlist$/i.test(input)) {
    if (watchlist.length === 0) return { text: `Your watchlist is empty.\n\nAdd stocks with: **WATCHLIST ADD [ticker]**`, type: 'info' }
    const rows = watchlist.map(t => {
      const s = STOCKS[t]; const p = prices[t]
      const chg = ((p - STOCKS[t].price) / STOCKS[t].price) * 100
      return `• **${t}** — ${fmt(p)} (${fmtP(chg)}) | P/E: ${s.pe || 'N/A'} | Beta: ${s.beta}`
    }).join('\n')
    return { text: `**Your Watchlist:**\n\n${rows}\n\nRemove with: **WATCHLIST REMOVE [ticker]**`, type: 'info' }
  }
  if (wlAdd) {
    const t = wlAdd[1]
    if (!STOCKS[t]) return { text: `Unknown ticker: **${t}**`, type: 'error' }
    if (watchlist.includes(t)) return { text: `**${t}** is already on your watchlist.`, type: 'info' }
    return { text: `✅ **${t}** added to watchlist. View it with: **WATCHLIST**`, type: 'info', watchlistAdd: t }
  }
  if (wlRem) {
    const t = wlRem[1]
    if (!watchlist.includes(t)) return { text: `**${t}** is not on your watchlist.`, type: 'error' }
    return { text: `Removed **${t}** from watchlist.`, type: 'info', watchlistRemove: t }
  }

  // ── CALC ──
  const calcMatch = input.match(/^calc(?:ulate)?\s+([\d,]+)\s+([\d.]+)%?\s+(\d+)/i)
  if (calcMatch) {
    const principal = parseFloat(calcMatch[1].replace(/,/g, ''))
    const rate = parseFloat(calcMatch[2]) / 100
    const years = parseInt(calcMatch[3])
    const fv = principal * Math.pow(1 + rate, years)
    const gain = fv - principal
    const rows = [5, 10, 15, 20, years].filter((y, i, a) => a.indexOf(y) === i && y <= years).sort((a,b)=>a-b).map(y => {
      const v = principal * Math.pow(1 + rate, y)
      return `• Year ${y}: **${fmt(v)}**`
    }).join('\n')
    return {
      text: `**Compound Interest Calculator**\n\nPrincipal: ${fmt(principal)}\nAnnual Rate: ${(rate * 100).toFixed(2)}%\nTime: ${years} years\n\n**Growth milestones:**\n${rows}\n\n**Final value: ${fmt(fv)}**\nTotal gain: ${fmt(gain)} (${((gain/principal)*100).toFixed(1)}% return)\n\n💡 At this rate, your money doubles every **${(72 / (rate*100)).toFixed(1)} years** (Rule of 72).`,
      type: 'calc'
    }
  }

  // ── COMPARE ──
  const cmpMatch = upper.match(/^COMPARE\s+([A-Z]{2,5})\s+([A-Z]{2,5})$/)
  if (cmpMatch) {
    const [t1, t2] = [cmpMatch[1], cmpMatch[2]]
    if (!STOCKS[t1]) return { text: `Unknown ticker: **${t1}**`, type: 'error' }
    if (!STOCKS[t2]) return { text: `Unknown ticker: **${t2}**`, type: 'error' }
    const s1 = STOCKS[t1], s2 = STOCKS[t2]
    const p1 = prices[t1], p2 = prices[t2]
    const c1 = ((p1 - s1.price) / s1.price) * 100
    const c2 = ((p2 - s2.price) / s2.price) * 100
    return {
      text: `**${t1} vs ${t2}**\n\n${'Metric'.padEnd(18)} ${t1.padEnd(12)} ${t2}\n${'─'.repeat(42)}\nPrice              ${fmt(p1).padEnd(12)} ${fmt(p2)}\nSession Change     ${fmtP(c1).padEnd(12)} ${fmtP(c2)}\nSector             ${s1.sector.padEnd(12)} ${s2.sector}\nP/E Ratio          ${(s1.pe||'N/A').toString().padEnd(12)} ${s2.pe||'N/A'}\nBeta               ${s1.beta.toString().padEnd(12)} ${s2.beta}\nMkt Cap            ${s1.cap.padEnd(12)} ${s2.cap}\n52-Wk High         ${fmt(s1.wk52h).padEnd(12)} ${fmt(s2.wk52h)}\n52-Wk Low          ${fmt(s1.wk52l).padEnd(12)} ${fmt(s2.wk52l)}\n\n💡 ${s1.beta > s2.beta ? t1 : t2} is the higher-beta (more volatile) option. ${s1.pe && s2.pe ? (s1.pe < s2.pe ? t1 : t2) + ' appears cheaper on a P/E basis.' : ''}`,
      type: 'compare'
    }
  }

  // ── PRICE ──
  const priceMatch = upper.match(/^PRICE\s+([A-Z]{2,5})$/)
  if (priceMatch) {
    const t = priceMatch[1]
    const s = STOCKS[t]
    if (!s) return { text: `Unknown ticker: **${t}**. Type **TICKERS** to see all available stocks.`, type: 'error' }
    const p = prices[t]
    const chg = ((p - s.price) / s.price) * 100
    const pctFrom52h = ((p - s.wk52h) / s.wk52h) * 100
    const pctFrom52l = ((p - s.wk52l) / s.wk52l) * 100
    return {
      text: `**${t} — ${s.name}**\n\nPrice: **${fmt(p)}** (${fmtP(chg)} today)\nSector: ${s.sector} | Beta: ${s.beta} | Market Cap: ${s.cap}\nP/E Ratio: ${s.pe || 'N/A'}\n52-Week Range: ${fmt(s.wk52l)} → ${fmt(s.wk52h)}\n• ${pctFrom52h.toFixed(1)}% below 52-week high\n• ${pctFrom52l.toFixed(1)}% above 52-week low\n\n${Math.abs(pctFrom52h) < 5 ? '⚠️ Trading near 52-week high — elevated valuation risk.' : Math.abs(pctFrom52l) < 10 ? '📉 Trading near 52-week low — potential value opportunity or falling knife.' : '📊 Mid-range valuation relative to recent history.'}\n\nTo buy: **BUY [shares] ${t}** | To add to watchlist: **WATCHLIST ADD ${t}**`,
      type: 'price'
    }
  }

  // ── PORTFOLIO ──
  if (/^portfolio$/i.test(input) || /my (?:portfolio|holdings|positions|stocks)/i.test(lower)) {
    const positions = Object.entries(portfolio)
    if (positions.length === 0) {
      return { text: `Your portfolio is empty.\n\nStart with: **BUY 5 VTI** (diversified index)\nOr try: **BUY 2 AAPL** (individual stock)\n\nCash available: **${fmt(balance)}**`, type: 'portfolio' }
    }
    let totalInvested = 0, totalValue = balance
    const rows = positions.map(([t, { shares, avgCost }]) => {
      const p = prices[t], value = shares * p, cost = shares * avgCost
      const gain = value - cost, gainPct = (gain / cost) * 100
      totalInvested += cost; totalValue += value
      return { t, shares, avgCost, p, value, gain, gainPct, name: STOCKS[t].name }
    })
    const totalReturn = ((totalValue - 10000) / 10000) * 100
    return { text: `Portfolio overview`, type: 'portfolio', portfolio: rows, balance, totalValue, totalReturn }
  }

  // ── ANALYZE ──
  if (/^analyze$/i.test(input) || /analyze my portfolio|portfolio analysis|how.?s my portfolio/i.test(lower)) {
    const positions = Object.entries(portfolio)
    if (positions.length === 0) {
      return { text: `Your portfolio is empty — nothing to analyze yet!\n\nBuild a portfolio first, then **ANALYZE** will give you:\n• Portfolio beta and volatility assessment\n• Sector allocation breakdown\n• Sharpe ratio estimate\n• Diversification score\n• Personalized recommendations\n\nStart with **BUY 5 VTI** or **BUY 10 SPY** to add index exposure.`, type: 'info' }
    }
    const totalPortfolioValue = positions.reduce((s, [t, { shares }]) => s + shares * prices[t], 0) + balance
    const investedValue = totalPortfolioValue - balance
    const weights = positions.map(([t, { shares }]) => ({ t, w: (shares * prices[t]) / totalPortfolioValue }))
    const portfolioBeta = weights.reduce((s, { t, w }) => s + w * STOCKS[t].beta, 0)
    const sectors = {}
    weights.forEach(({ t, w }) => {
      const sec = STOCKS[t].sector
      sectors[sec] = (sectors[sec] || 0) + w
    })
    const numSectors = Object.keys(sectors).length
    const numPositions = positions.length
    const diversificationScore = Math.min(100, Math.round((numSectors * 15) + (Math.min(numPositions, 8) * 5)))
    const totalReturn = ((totalPortfolioValue - 10000) / 10000) * 100
    const spyReturn = ((prices.SPY - STOCKS.SPY.price) / STOCKS.SPY.price) * 100
    const alpha = totalReturn - (portfolioBeta * spyReturn)
    const sharpEst = totalReturn > 0 ? (totalReturn / (portfolioBeta * 15)).toFixed(2) : 'N/A'
    const topSector = Object.entries(sectors).sort((a, b) => b[1] - a[1])[0]
    const bestPos = positions.map(([t, { shares, avgCost }]) => ({ t, gain: ((prices[t] - avgCost) / avgCost) * 100 })).sort((a, b) => b.gain - a.gain)[0]
    const worstPos = positions.map(([t, { shares, avgCost }]) => ({ t, gain: ((prices[t] - avgCost) / avgCost) * 100 })).sort((a, b) => a.gain - b.gain)[0]
    const recs = []
    if (portfolioBeta > 1.5) recs.push('⚠️ High portfolio beta (' + portfolioBeta.toFixed(2) + ') — consider adding low-beta assets like JNJ, GLD, or VTI to reduce volatility.')
    if (numSectors < 3) recs.push('⚠️ Low sector diversification — you\'re concentrated in ' + numSectors + ' sector(s). Add exposure to Healthcare, Financials, or Energy.')
    if ((balance / totalPortfolioValue) > 0.4) recs.push('💡 High cash position (' + ((balance / totalPortfolioValue) * 100).toFixed(0) + '%) — consider deploying more capital into index ETFs (VTI, SPY).')
    if (topSector && topSector[1] > 0.6) recs.push('⚠️ ' + topSector[0] + ' represents ' + (topSector[1] * 100).toFixed(0) + '% of your portfolio — significant concentration risk.')
    if (recs.length === 0) recs.push('✅ Portfolio is reasonably diversified. Continue monitoring sector weights and rebalance if any position exceeds 25% of invested assets.')
    return {
      text: `**Portfolio Analysis**`,
      type: 'analyze',
      analysis: { portfolioBeta, diversificationScore, sharpEst, alpha, totalReturn, spyReturn, sectors, numPositions, numSectors, bestPos, worstPos, recs, totalPortfolioValue, balance }
    }
  }

  // ── BUY ──
  const buyMatch = upper.match(/^BUY\s+([\d.]+)\s+([A-Z]{2,5})$/)
  if (buyMatch) {
    const shares = parseFloat(buyMatch[1]), t = buyMatch[2]
    if (!STOCKS[t]) return { text: `Unknown ticker: **${t}**. Type **TICKERS** to see all 20 stocks.`, type: 'error' }
    if (shares <= 0 || isNaN(shares)) return { text: `Enter a valid number of shares. Example: **BUY 5 ${t}**`, type: 'error' }
    const p = prices[t], cost = shares * p
    if (cost > balance) return { text: `❌ Insufficient funds.\n\nCost: **${fmt(cost)}** | Your balance: **${fmt(balance)}**\nShortfall: **${fmt(cost - balance)}**\n\nYou can afford approximately **${Math.floor(balance / p)} shares** of ${t}.`, type: 'error' }
    return { text: `✅ **Bought ${fmtS(shares)} shares of ${t}** at ${fmt(p)}\n\nTotal cost: **${fmt(cost)}**\nRemaining cash: **${fmt(balance - cost)}**\n\n💡 **${t} insight:** Beta ${STOCKS[t].beta} | Sector: ${STOCKS[t].sector} | P/E: ${STOCKS[t].pe || 'N/A'}\n\nType **ANALYZE** to see how this affects your portfolio metrics.`, type: 'buy', ticker: t, shares, price: p, cost }
  }

  // ── SELL ──
  const sellMatch = upper.match(/^SELL\s+([\d.]+)\s+([A-Z]{2,5})$/)
  if (sellMatch) {
    const shares = parseFloat(sellMatch[1]), t = sellMatch[2]
    if (!STOCKS[t]) return { text: `Unknown ticker: **${t}**`, type: 'error' }
    const held = portfolio[t]
    if (!held || held.shares < shares) return { text: `❌ Insufficient shares.\n\nYou own: **${held ? fmtS(held.shares) : 0} shares** of ${t}. You tried to sell ${fmtS(shares)}.`, type: 'error' }
    const p = prices[t], proceeds = shares * p, gain = proceeds - shares * held.avgCost, gainPct = ((p - held.avgCost) / held.avgCost) * 100
    const taxNote = gainPct > 0 ? `\n\n📋 **Tax note:** ${gainPct > 0 ? 'This is a taxable gain. Short-term gains (held <1 yr) taxed as ordinary income; long-term at 15-20%.' : ''}` : ''
    return { text: `✅ **Sold ${fmtS(shares)} shares of ${t}** at ${fmt(p)}\n\nProceeds: **${fmt(proceeds)}**\n${gain >= 0 ? '📈' : '📉'} ${gain >= 0 ? 'Gain' : 'Loss'}: **${gain >= 0 ? '+' : ''}${fmt(gain)}** (${fmtP(gainPct)})\nNew cash balance: **${fmt(balance + proceeds)}**${taxNote}`, type: 'sell', ticker: t, shares, price: p, proceeds, gain }
  }

  // ── HELP ──
  if (/^help$/i.test(input) || /what can you/i.test(lower)) {
    return {
      text: `**moneasey AI — Full Command Reference**\n\n**📊 Trading:**\n• BUY [shares] [ticker]\n• SELL [shares] [ticker]\n• PRICE [ticker]\n• COMPARE [ticker1] [ticker2]\n• TICKERS — list all 20 stocks\n\n**📈 Portfolio:**\n• PORTFOLIO — view holdings\n• ANALYZE — deep analysis (beta, Sharpe, sectors)\n• HISTORY — trade log\n\n**🌍 Market:**\n• MARKET — market overview & sentiment\n• NEWS — trigger a market event\n\n**🧮 Tools:**\n• CALC [amount] [rate%] [years] — compound calculator\n• WATCHLIST ADD/REMOVE [ticker]\n• WATCHLIST — view watchlist\n\n**💬 Ask me anything about:**\nTechnical analysis · Options · Bonds · Fed policy · Portfolio theory · Factor investing · Behavioral finance · Tax strategy · Retirement · Crypto · and much more`,
      type: 'help'
    }
  }

  // ── NLP Knowledge Base ──
  for (const entry of KB) {
    if (entry.match.test(lower)) return { text: entry.answer, type: 'info' }
  }

  // Fallback
  return { text: `I didn't catch that. Try a trading command like **BUY 5 AAPL** or ask me about a financial topic — options, bonds, technical analysis, Fed policy, portfolio theory, crypto, tax strategy, and more.\n\nType **HELP** for the full command list.`, type: 'fallback' }
}

// ─── SVG Sector Donut ─────────────────────────────────────────────────────────
function SectorDonut({ sectors }) {
  const entries = Object.entries(sectors).sort((a, b) => b[1] - a[1])
  const total = entries.reduce((s, [, v]) => s + v, 0)
  if (total === 0) return null
  const r = 38, cx = 50, cy = 50, stroke = 24
  let offset = 0
  const circumference = 2 * Math.PI * r
  const slices = entries.map(([sec, val]) => {
    const pct = val / total
    const dash = pct * circumference
    const gap = circumference - dash
    const slice = { sec, pct, dash, gap, offset, color: SECTOR_COLORS[sec] || '#555' }
    offset += dash
    return slice
  })
  return (
    <div className="sector-donut-wrap">
      <svg viewBox="0 0 100 100" className="sector-donut-svg">
        {slices.map(s => (
          <circle key={s.sec} cx={cx} cy={cy} r={r}
            fill="none" stroke={s.color} strokeWidth={stroke}
            strokeDasharray={`${s.dash} ${s.gap}`}
            strokeDashoffset={-s.offset}
            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
          />
        ))}
        <text x="50" y="54" textAnchor="middle" fontSize="10" fill="#fff" fontFamily="Space Grotesk" fontWeight="700">
          {entries.length}
        </text>
        <text x="50" y="63" textAnchor="middle" fontSize="5.5" fill="#666" fontFamily="Inter">
          SECTORS
        </text>
      </svg>
      <div className="sector-legend">
        {slices.map(s => (
          <div key={s.sec} className="sector-legend-item">
            <span className="sector-dot" style={{ background: s.color }} />
            <span className="sector-name">{s.sec}</span>
            <span className="sector-pct">{(s.pct * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
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

// ─── Analyze Message Component ────────────────────────────────────────────────
function AnalyzeMessage({ analysis }) {
  const { portfolioBeta, diversificationScore, sharpEst, alpha, totalReturn, spyReturn, sectors, numPositions, bestPos, worstPos, recs, totalPortfolioValue, balance } = analysis
  const investedPct = ((totalPortfolioValue - balance) / totalPortfolioValue) * 100
  return (
    <div className="analyze-msg">
      <div className="analyze-grid">
        <div className="analyze-stat">
          <span className="an-label">Portfolio Beta</span>
          <span className={`an-val ${portfolioBeta > 1.3 ? 'warn' : portfolioBeta < 0.7 ? 'good' : ''}`}>{portfolioBeta.toFixed(2)}</span>
          <span className="an-sub">{portfolioBeta > 1.3 ? 'High volatility' : portfolioBeta < 0.7 ? 'Conservative' : 'Market-like'}</span>
        </div>
        <div className="analyze-stat">
          <span className="an-label">Sharpe Estimate</span>
          <span className={`an-val ${parseFloat(sharpEst) > 1 ? 'good' : parseFloat(sharpEst) > 0 ? '' : 'warn'}`}>{sharpEst}</span>
          <span className="an-sub">{parseFloat(sharpEst) > 1 ? 'Solid risk-adj.' : 'Needs improvement'}</span>
        </div>
        <div className="analyze-stat">
          <span className="an-label">vs. S&P 500</span>
          <span className={`an-val ${alpha >= 0 ? 'good' : 'warn'}`}>{alpha >= 0 ? '+' : ''}{alpha.toFixed(2)}%</span>
          <span className="an-sub">Alpha (excess return)</span>
        </div>
        <div className="analyze-stat">
          <span className="an-label">Diversification</span>
          <span className={`an-val ${diversificationScore > 60 ? 'good' : diversificationScore > 30 ? '' : 'warn'}`}>{diversificationScore}/100</span>
          <span className="an-sub">{numPositions} positions</span>
        </div>
      </div>
      {Object.keys(sectors).length > 0 && <SectorDonut sectors={sectors} />}
      <div className="analyze-perf">
        {bestPos && <div className="perf-row"><span className="perf-label">Best performer:</span><span className="an-good">{bestPos.t} {fmtP(bestPos.gain)}</span></div>}
        {worstPos && worstPos.t !== bestPos?.t && <div className="perf-row"><span className="perf-label">Worst performer:</span><span className="an-warn">{worstPos.t} {fmtP(worstPos.gain)}</span></div>}
      </div>
      <div className="analyze-recs">
        <span className="recs-label">Recommendations</span>
        {recs.map((r, i) => <p key={i} className="rec-item">{r}</p>)}
      </div>
    </div>
  )
}

// ─── Portfolio Table Message ──────────────────────────────────────────────────
function PortfolioMessage({ msg }) {
  if (!msg.portfolio) return <div className="msg-text">{renderText(msg.text)}</div>
  const { portfolio, balance, totalValue, totalReturn } = msg
  return (
    <div className="portfolio-msg">
      <p className="msg-line"><strong>📊 Portfolio — {fmt(totalValue)} total ({totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(2)}%)</strong></p>
      <div className="portfolio-table">
        {portfolio.map(p => (
          <div key={p.t} className="pt-row">
            <div className="pt-ticker">{p.t}</div>
            <div className="pt-detail">
              <span>{fmtS(p.shares)} sh @ {fmt(p.avgCost)} avg</span>
              <span className={p.gain >= 0 ? 'pos' : 'neg'}>{p.gain >= 0 ? '+' : ''}{fmt(p.gain)} ({fmtP(p.gainPct)})</span>
            </div>
            <div className="pt-value">{fmt(p.value)}</div>
          </div>
        ))}
        <div className="pt-totals">
          <span>Cash: {fmt(balance)}</span>
          <span>Total: {fmt(totalValue)}</span>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
const INITIAL_BALANCE = 10000
const INITIAL_PRICES = Object.fromEntries(Object.entries(STOCKS).map(([t, s]) => [t, s.price]))
const QUICK_ACTIONS = ['PORTFOLIO', 'ANALYZE', 'MARKET', 'COMPARE AAPL MSFT', 'CALC 5000 7% 30', 'What is beta?', 'Explain options', 'What is a Roth IRA?']

const WELCOME = {
  id: 0, from: 'bot', type: 'greeting',
  text: `Welcome to the **moneasey AI Financial Analyst.** 📈\n\nYou have **$10,000 in virtual cash.** Prices update every 20 seconds to simulate live markets.\n\n**Getting started:**\n• **BUY 5 AAPL** — buy Apple stock\n• **PRICE NVDA** — get a full quote\n• **ANALYZE** — deep portfolio analysis\n• **COMPARE SPY VTI** — side-by-side comparison\n• **CALC 1000 7% 30** — compound interest calculator\n• **MARKET** — current market overview\n\nOr ask me anything — technical analysis, options, bonds, Fed policy, tax strategy, portfolio theory, crypto, and much more.\n\nType **HELP** for the complete command list.`
}

export default function Chatbot() {
  const [messages, setMessages] = useState([WELCOME])
  const [input, setInput] = useState('')
  const [portfolio, setPortfolio] = useState({})
  const [balance, setBalance] = useState(INITIAL_BALANCE)
  const [prices, setPrices] = useState(INITIAL_PRICES)
  const [tradeHistory, setTradeHistory] = useState([])
  const [watchlist, setWatchlist] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const [ticker, setTicker] = useState(Object.entries(INITIAL_PRICES).slice(0, 8))
  const endRef = useRef(null)
  const inputRef = useRef(null)

  // Live price simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => {
        const next = { ...prev }
        Object.keys(next).forEach(t => {
          const beta = STOCKS[t].beta
          const move = (Math.random() - 0.492) * beta * 0.004
          next[t] = Math.max(next[t] * (1 + move), 0.01)
        })
        return next
      })
    }, 20000)
    return () => clearInterval(interval)
  }, [])

  // Ticker tape
  useEffect(() => {
    const interval = setInterval(() => {
      setTicker(Object.entries(prices).slice(0, 8))
    }, 3000)
    return () => clearInterval(interval)
  }, [prices])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, isTyping])

  const sendMessage = useCallback((text) => {
    const msg = (text || input).trim()
    if (!msg) return
    setInput('')
    setMessages(m => [...m, { id: Date.now(), from: 'user', text: msg, type: 'user' }])
    setIsTyping(true)

    setTimeout(() => {
      const state = { portfolio, balance, tradeHistory, watchlist, prices }
      const response = processCommand(msg, state)

      // Apply state changes
      if (response.type === 'buy') {
        const { ticker: t, shares, price: p, cost } = response
        setPortfolio(prev => {
          const existing = prev[t]
          const newShares = (existing?.shares || 0) + shares
          const newAvg = existing ? (existing.shares * existing.avgCost + cost) / newShares : p
          return { ...prev, [t]: { shares: newShares, avgCost: newAvg } }
        })
        setBalance(b => b - cost)
        setTradeHistory(h => [...h, { type: 'BUY', ticker: t, shares, price: p, date: new Date().toLocaleDateString() }])
      }
      if (response.type === 'sell') {
        const { ticker: t, shares, price: p, proceeds } = response
        setPortfolio(prev => {
          const held = prev[t]
          const newShares = held.shares - shares
          if (newShares < 0.0001) { const n = { ...prev }; delete n[t]; return n }
          return { ...prev, [t]: { ...held, shares: newShares } }
        })
        setBalance(b => b + proceeds)
        setTradeHistory(h => [...h, { type: 'SELL', ticker: t, shares, price: p, date: new Date().toLocaleDateString() }])
      }
      if (response.watchlistAdd) setWatchlist(w => [...w, response.watchlistAdd])
      if (response.watchlistRemove) setWatchlist(w => w.filter(x => x !== response.watchlistRemove))

      setMessages(m => [...m, { id: Date.now() + 1, from: 'bot', ...response }])
      setIsTyping(false)
    }, 400 + Math.random() * 300)
  }, [input, portfolio, balance, tradeHistory, watchlist, prices])

  const handleKey = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }

  const totalValue = balance + Object.entries(portfolio).reduce((s, [t, { shares }]) => s + shares * (prices[t] || 0), 0)
  const pnl = totalValue - INITIAL_BALANCE
  const pnlPct = (pnl / INITIAL_BALANCE) * 100

  // Sector allocation for sidebar
  const sidebarSectors = {}
  Object.entries(portfolio).forEach(([t, { shares }]) => {
    const val = shares * prices[t], sec = STOCKS[t].sector
    sidebarSectors[sec] = (sidebarSectors[sec] || 0) + val
  })
  const sidebarSectorTotal = Object.values(sidebarSectors).reduce((a, b) => a + b, 0)
  const sidebarSectorPcts = Object.fromEntries(Object.entries(sidebarSectors).map(([s, v]) => [s, v / (sidebarSectorTotal || 1)]))

  return (
    <main className="chatbot-page">
      {/* Ticker tape */}
      <div className="ticker-tape">
        <div className="ticker-inner">
          {[...ticker, ...ticker].map(([t, p], i) => {
            const chg = ((p - STOCKS[t].price) / STOCKS[t].price) * 100
            return (
              <span key={i} className="tick-item">
                <span className="tick-sym">{t}</span>
                <span className="tick-price">{fmt(p)}</span>
                <span className={`tick-chg ${chg >= 0 ? 'pos' : 'neg'}`}>{chg >= 0 ? '▲' : '▼'}{Math.abs(chg).toFixed(2)}%</span>
              </span>
            )
          })}
        </div>
      </div>

      <div className="chatbot-layout">
        {/* ── Sidebar ── */}
        <aside className="chat-sidebar">
          <div className="sidebar-header">
            <span className="sidebar-title">Portfolio</span>
            <span className="sim-badge">SIMULATION</span>
          </div>

          <div className="balance-card">
            <div className="balance-label">Total Value</div>
            <div className="balance-amount">{fmt(totalValue)}</div>
            <div className={`balance-pnl ${pnl >= 0 ? 'pos' : 'neg'}`}>
              {pnl >= 0 ? '▲' : '▼'} {fmt(Math.abs(pnl))} ({pnl >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%)
            </div>
          </div>

          <div className="sidebar-row"><span>Cash</span><span className="sidebar-val">{fmt(balance)}</span></div>
          <div className="sidebar-row"><span>Invested</span><span className="sidebar-val">{fmt(totalValue - balance)}</span></div>
          <div className="sidebar-divider" />

          {Object.keys(portfolio).length === 0 ? (
            <div className="empty-portfolio">
              <span>📭</span>
              <p>No positions.<br />Try <strong>BUY 5 VTI</strong></p>
            </div>
          ) : (
            <>
              <div className="positions-header"><span>Positions</span><span>{Object.keys(portfolio).length}</span></div>
              <div className="positions-list">
                {Object.entries(portfolio).map(([t, { shares, avgCost }]) => {
                  const p = prices[t], value = shares * p
                  const gainPct = ((p - avgCost) / avgCost) * 100
                  return (
                    <div key={t} className="position-row">
                      <div className="pos-left">
                        <span className="pos-ticker">{t}</span>
                        <span className="pos-shares">{fmtS(shares)} sh</span>
                      </div>
                      <div className="pos-right">
                        <span className="pos-value">{fmt(value)}</span>
                        <span className={`pos-gain ${gainPct >= 0 ? 'pos' : 'neg'}`}>{gainPct >= 0 ? '+' : ''}{gainPct.toFixed(2)}%</span>
                      </div>
                    </div>
                  )
                })}
              </div>
              {sidebarSectorTotal > 0 && (
                <>
                  <div className="sidebar-divider" />
                  <div className="sidebar-sectors-label">Sector Allocation</div>
                  {Object.entries(sidebarSectorPcts).sort((a, b) => b[1] - a[1]).map(([sec, pct]) => (
                    <div key={sec} className="sector-bar-row">
                      <span className="sec-name">{sec}</span>
                      <div className="sec-bar-track">
                        <div className="sec-bar-fill" style={{ width: `${pct * 100}%`, background: SECTOR_COLORS[sec] || '#555' }} />
                      </div>
                      <span className="sec-pct">{(pct * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </>
              )}
            </>
          )}

          <div className="sidebar-divider" />
          <div className="stock-list-header">Live Prices</div>
          <div className="stock-ticker-list">
            {Object.entries(prices).slice(0, 8).map(([t, p]) => {
              const chg = ((p - STOCKS[t].price) / STOCKS[t].price) * 100
              return (
                <div key={t} className="stock-row">
                  <span className="stock-sym">{t}</span>
                  <span className="stock-price">{fmt(p)}</span>
                  <span className={`stock-chg ${chg >= 0 ? 'pos' : 'neg'}`}>{chg >= 0 ? '+' : ''}{chg.toFixed(2)}%</span>
                </div>
              )
            })}
          </div>
        </aside>

        {/* ── Chat Panel ── */}
        <div className="chat-panel">
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="bot-avatar">💹</div>
              <div>
                <div className="bot-name">moneasey AI Analyst</div>
                <div className="bot-status"><span className="status-dot" /> Live · {Object.keys(STOCKS).length} stocks · Prices updating</div>
              </div>
            </div>
            <button className="reset-chat-btn" onClick={() => { setMessages([WELCOME]); setPortfolio({}); setBalance(INITIAL_BALANCE); setTradeHistory([]); setWatchlist([]); setPrices(INITIAL_PRICES) }}>
              Reset
            </button>
          </div>

          <div className="chat-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`msg-wrap msg-${msg.from}`}>
                {msg.from === 'bot' && <div className="msg-avatar">💹</div>}
                <div className={`msg-bubble msg-bubble-${msg.from}`}>
                  {msg.type === 'portfolio' ? <PortfolioMessage msg={msg} /> :
                   msg.type === 'analyze' ? <AnalyzeMessage analysis={msg.analysis} /> :
                   <div className="msg-text">{renderText(msg.text)}</div>}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="msg-wrap msg-bot">
                <div className="msg-avatar">💹</div>
                <div className="msg-bubble msg-bubble-bot">
                  <div className="typing-dots"><span /><span /><span /></div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="quick-actions">
            {QUICK_ACTIONS.map(q => (
              <button key={q} className="quick-btn" onClick={() => sendMessage(q)}>{q}</button>
            ))}
          </div>

          <div className="chat-input-area">
            <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey} placeholder="BUY 5 AAPL · ANALYZE · COMPARE SPY VTI · Ask anything..."
              className="chat-input" />
            <button className="send-btn" onClick={() => sendMessage()} disabled={!input.trim()}>Send</button>
          </div>
        </div>
      </div>
    </main>
  )
}
