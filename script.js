// NSE Options Chain Trading Platform - Professional JavaScript Implementation
// Author: TradePro Platform
// Version: 1.0.0

class NSEOptionsChain {
    constructor() {
        this.currentSymbol = 'NIFTY';
        this.currentExpiry = '2024-01-25';
        this.spotPrice = 21347.50;
        this.isAutoRefresh = true;
        this.refreshInterval = 5000; // 5 seconds
        this.refreshTimer = null;
        this.basket = [];
        this.isTradeModalOpen = false;
        this.isStrikeModalOpen = false;
        this.marketData = {};
        this.greeks = {};
        
        // Indian market parameters
        this.riskFreeRate = 0.065; // 6.5% RBI repo rate
        this.dividendYield = 0.012; // 1.2% average dividend yield
        
        // Market symbols configuration
        this.symbols = {
            'NIFTY': {
                lotSize: 50,
                tickSize: 0.05,
                multiplier: 1,
                sector: 'Index',
                underlyingPrice: 21347.50
            },
            'BANKNIFTY': {
                lotSize: 15,
                tickSize: 0.05,
                multiplier: 1,
                sector: 'Banking Index',
                underlyingPrice: 46284.70
            },
            'FINNIFTY': {
                lotSize: 40,
                tickSize: 0.05,
                multiplier: 1,
                sector: 'Financial Index',
                underlyingPrice: 19867.25
            },
            'RELIANCE': {
                lotSize: 250,
                tickSize: 0.05,
                multiplier: 1,
                sector: 'Oil & Gas',
                underlyingPrice: 2456.80
            },
            'TCS': {
                lotSize: 125,
                tickSize: 0.05,
                multiplier: 1,
                sector: 'IT Services',
                underlyingPrice: 3789.45
            }
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.initializeTradingMode();
        this.generateOptionsData();
        this.startAutoRefresh();
        this.updateMarketTime();
        this.showLoadingOverlay();
        
        // Simulate initial data load
        setTimeout(() => {
            this.hideLoadingOverlay();
            this.showToast('success', 'Market Data Loaded', 'Live NSE options data loaded successfully');
        }, 2000);
    }
    
    setupEventListeners() {
        // Navigation tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const targetTab = e.currentTarget.getAttribute('data-tab');
                this.switchTab(targetTab);
            });
        });
        
        // Trading mode toggle
        const tradingModeToggle = document.getElementById('trading-mode');
        tradingModeToggle.addEventListener('change', (e) => {
            this.toggleTradingMode(e.target.checked);
        });
        
        // Symbol selection
        const symbolSelect = document.getElementById('symbol-select');
        symbolSelect.addEventListener('change', (e) => {
            this.changeSymbol(e.target.value);
        });
        
        // Expiry selection
        const expirySelect = document.getElementById('expiry-select');
        expirySelect.addEventListener('change', (e) => {
            this.changeExpiry(e.target.value);
        });
        
        // Refresh button
        const refreshBtn = document.getElementById('refresh-data');
        refreshBtn.addEventListener('click', () => {
            this.toggleAutoRefresh();
        });
        
        // Search functionality
        const searchInput = document.getElementById('options-search');
        searchInput.addEventListener('input', (e) => {
            this.filterOptions(e.target.value);
        });
        
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.applyFilter(e.target.getAttribute('data-filter'));
            });
        });
        
        // Basket sidebar
        const closeBasket = document.getElementById('close-basket');
        closeBasket.addEventListener('click', () => {
            this.closeBasket();
        });
        
        // Modal close buttons
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeModals();
            });
        });
        
        // Modal background clicks
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModals();
                }
            });
        });
        
        // Basket actions
        document.querySelector('.clear-basket').addEventListener('click', () => {
            this.clearBasket();
        });
        
        document.querySelector('.execute-all').addEventListener('click', () => {
            this.executeAllOrders();
        });
        
        // Trade form actions
        document.querySelector('.add-to-basket').addEventListener('click', () => {
            this.addToBasket();
        });
        
        document.querySelector('.place-order').addEventListener('click', () => {
            this.placeOrder();
        });
        
        // Order type change
        document.getElementById('order-type').addEventListener('change', (e) => {
            this.togglePriceInput(e.target.value);
        });
        
        // Quantity and price inputs
        document.getElementById('quantity').addEventListener('input', () => {
            this.updateRiskAnalysis();
        });
        
        document.getElementById('price').addEventListener('input', () => {
            this.updateRiskAnalysis();
        });
        
        // Table sorting
        document.querySelectorAll('.sortable').forEach(th => {
            th.addEventListener('click', (e) => {
                this.sortTable(e.target.getAttribute('data-sort'));
            });
        });
    }
    
    initializeTradingMode() {
        const tradingModeToggle = document.getElementById('trading-mode');
        const isProfessional = tradingModeToggle.checked;
        this.toggleTradingMode(isProfessional);
    }
    
    toggleTradingMode(isProfessional) {
        if (isProfessional) {
            document.body.classList.add('professional-mode');
            this.showToast('info', 'Professional Mode', 'Advanced trading features enabled');
        } else {
            document.body.classList.remove('professional-mode');
            this.showToast('info', 'Beginner Mode', 'Simplified view for beginners');
        }
        
        // Regenerate table to show/hide columns
        this.generateOptionsData();
    }
    
    switchTab(tabName) {
        // Update navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Show/hide pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        document.getElementById(`${tabName}-page`).classList.add('active');
        
        if (tabName === 'options') {
            this.generateOptionsData();
        }
    }
    
    changeSymbol(symbol) {
        this.currentSymbol = symbol;
        this.spotPrice = this.symbols[symbol].underlyingPrice;
        
        // Update spot price display
        document.getElementById('spot-price').textContent = this.formatPrice(this.spotPrice);
        
        // Generate new options data
        this.generateOptionsData();
        
        this.showToast('info', 'Symbol Changed', `Switched to ${symbol} options chain`);
    }
    
    changeExpiry(expiry) {
        this.currentExpiry = expiry;
        this.generateOptionsData();
        
        const expiryDate = new Date(expiry);
        const daysToExpiry = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
        
        this.showToast('info', 'Expiry Changed', `${daysToExpiry} days to expiration`);
    }
    
    generateOptionsData() {
        const tbody = document.getElementById('options-tbody');
        tbody.innerHTML = '';
        
        const currentSpot = this.spotPrice;
        const symbol = this.currentSymbol;
        const lotSize = this.symbols[symbol].lotSize;
        
        // Generate strike prices around current spot
        const strikes = this.generateStrikePrices(currentSpot);
        
        // Calculate time to expiry in years
        const expiryDate = new Date(this.currentExpiry);
        const timeToExpiry = (expiryDate - new Date()) / (1000 * 60 * 60 * 24 * 365);
        
        strikes.forEach(strike => {
            const row = this.createOptionRow(strike, currentSpot, timeToExpiry, symbol);
            tbody.appendChild(row);
        });
        
        this.marketData[symbol] = { strikes, timeToExpiry, spotPrice: currentSpot };
    }
    
    generateStrikePrices(spotPrice) {
        const strikes = [];
        const interval = this.getStrikeInterval(spotPrice);
        
        // Generate strikes from -20 to +20 intervals around spot
        for (let i = -20; i <= 20; i++) {
            const strike = Math.round((spotPrice + (i * interval)) / interval) * interval;
            if (strike > 0) {
                strikes.push(strike);
            }
        }
        
        return strikes.sort((a, b) => a - b);
    }
    
    getStrikeInterval(spotPrice) {
        if (spotPrice < 500) return 5;
        if (spotPrice < 1000) return 10;
        if (spotPrice < 5000) return 25;
        if (spotPrice < 10000) return 50;
        return 100;
    }
    
    createOptionRow(strike, spotPrice, timeToExpiry, symbol) {
        const row = document.createElement('tr');
        const isATM = Math.abs(strike - spotPrice) < this.getStrikeInterval(spotPrice);
        const isITM_Call = strike < spotPrice;
        const isITM_Put = strike > spotPrice;
        
        // Calculate option prices using Black-Scholes
        const callPrice = this.blackScholesCall(spotPrice, strike, timeToExpiry, this.riskFreeRate, 0.25);
        const putPrice = this.blackScholesPut(spotPrice, strike, timeToExpiry, this.riskFreeRate, 0.25);
        
        // Calculate Greeks
        const callDelta = this.calculateDelta(spotPrice, strike, timeToExpiry, this.riskFreeRate, 0.25, true);
        const putDelta = this.calculateDelta(spotPrice, strike, timeToExpiry, this.riskFreeRate, 0.25, false);
        const iv = this.calculateImpliedVolatility(strike, spotPrice, timeToExpiry);
        
        // Generate realistic volume and OI
        const callOI = this.generateOI(strike, spotPrice, true);
        const putOI = this.generateOI(strike, spotPrice, false);
        const callVol = Math.floor(callOI * (0.1 + Math.random() * 0.3));
        const putVol = Math.floor(putOI * (0.1 + Math.random() * 0.3));
        
        // Generate price changes
        const callChange = (Math.random() - 0.5) * 20;
        const putChange = (Math.random() - 0.5) * 20;
        
        const isProfessional = document.body.classList.contains('professional-mode');
        
        row.innerHTML = `
            <!-- Call Options -->
            <td class="oi-cell call-data">${this.formatNumber(callOI)}</td>
            <td class="vol-cell call-data">${this.formatNumber(callVol)}</td>
            <td class="ltp-cell call-ltp call-data" 
                onclick="this.openTradeModal('${symbol}', ${strike}, 'CALL', ${callPrice})"
                data-option-type="CALL" data-strike="${strike}" data-price="${callPrice}">
                ${this.formatPrice(callPrice)}
            </td>
            <td class="change-cell call-data ${callChange >= 0 ? 'positive' : 'negative'}">
                ${callChange >= 0 ? '+' : ''}${callChange.toFixed(2)}%
            </td>
            ${isProfessional ? `<td class="iv-cell call-data">${iv.toFixed(2)}%</td>` : ''}
            ${isProfessional ? `<td class="delta-cell call-data">${callDelta.toFixed(3)}</td>` : ''}
            
            <!-- Strike Price -->
            <td class="strike-cell ${isATM ? 'atm' : ''}" 
                onclick="this.openStrikeModal(${strike})"
                data-strike="${strike}">
                ${this.formatPrice(strike)}
            </td>
            
            <!-- Put Options -->
            ${isProfessional ? `<td class="delta-cell put-data">${putDelta.toFixed(3)}</td>` : ''}
            ${isProfessional ? `<td class="iv-cell put-data">${iv.toFixed(2)}%</td>` : ''}
            <td class="change-cell put-data ${putChange >= 0 ? 'positive' : 'negative'}">
                ${putChange >= 0 ? '+' : ''}${putChange.toFixed(2)}%
            </td>
            <td class="ltp-cell put-ltp put-data" 
                onclick="this.openTradeModal('${symbol}', ${strike}, 'PUT', ${putPrice})"
                data-option-type="PUT" data-strike="${strike}" data-price="${putPrice}">
                ${this.formatPrice(putPrice)}
            </td>
            <td class="vol-cell put-data">${this.formatNumber(putVol)}</td>
            <td class="oi-cell put-data">${this.formatNumber(putOI)}</td>
        `;
        
        return row;
    }
    
    // Black-Scholes Option Pricing Model
    blackScholesCall(S, K, T, r, sigma) {
        const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
        const d2 = d1 - sigma * Math.sqrt(T);
        
        return S * this.normalCDF(d1) - K * Math.exp(-r * T) * this.normalCDF(d2);
    }
    
    blackScholesPut(S, K, T, r, sigma) {
        const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
        const d2 = d1 - sigma * Math.sqrt(T);
        
        return K * Math.exp(-r * T) * this.normalCDF(-d2) - S * this.normalCDF(-d1);
    }
    
    // Normal cumulative distribution function
    normalCDF(x) {
        return 0.5 * (1 + this.erf(x / Math.sqrt(2)));
    }
    
    // Error function approximation
    erf(x) {
        const a1 =  0.254829592;
        const a2 = -0.284496736;
        const a3 =  1.421413741;
        const a4 = -1.453152027;
        const a5 =  1.061405429;
        const p  =  0.3275911;
        
        const sign = x >= 0 ? 1 : -1;
        x = Math.abs(x);
        
        const t = 1.0 / (1.0 + p * x);
        const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
        
        return sign * y;
    }
    
    calculateDelta(S, K, T, r, sigma, isCall) {
        const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
        
        if (isCall) {
            return this.normalCDF(d1);
        } else {
            return this.normalCDF(d1) - 1;
        }
    }
    
    calculateImpliedVolatility(strike, spot, timeToExpiry) {
        const moneyness = strike / spot;
        let baseVol = 0.20; // Base volatility 20%
        
        // Volatility smile: higher volatility for OTM options
        if (moneyness < 0.95 || moneyness > 1.05) {
            baseVol += 0.05;
        }
        if (moneyness < 0.90 || moneyness > 1.10) {
            baseVol += 0.05;
        }
        
        // Term structure: higher volatility for shorter expiry
        if (timeToExpiry < 0.08) { // Less than 1 month
            baseVol += 0.03;
        }
        
        // Add some randomness
        baseVol += (Math.random() - 0.5) * 0.04;
        
        return Math.max(baseVol * 100, 10); // Minimum 10% IV
    }
    
    generateOI(strike, spot, isCall) {
        const moneyness = strike / spot;
        let baseOI = 10000;
        
        // Higher OI for ATM options
        if (Math.abs(moneyness - 1) < 0.02) {
            baseOI *= 5;
        } else if (Math.abs(moneyness - 1) < 0.05) {
            baseOI *= 3;
        }
        
        // Different patterns for calls vs puts
        if (isCall) {
            if (moneyness > 1.05) baseOI *= 0.7; // Lower OI for OTM calls
        } else {
            if (moneyness < 0.95) baseOI *= 0.7; // Lower OI for OTM puts
        }
        
        return Math.floor(baseOI * (0.5 + Math.random()));
    }
    
    openTradeModal(symbol, strike, optionType, price) {
        const modal = document.getElementById('trade-modal');
        const title = document.getElementById('trade-modal-title');
        const optionDetails = document.getElementById('option-details');
        
        title.textContent = `Trade ${symbol} ${strike} ${optionType}`;
        
        const expiryDate = new Date(this.currentExpiry);
        const daysToExpiry = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
        const lotSize = this.symbols[symbol].lotSize;
        
        optionDetails.innerHTML = `
            <div class="option-summary">
                <h4>${symbol} ${this.formatPrice(strike)} ${optionType}</h4>
                <div class="option-meta">
                    <span>Expiry: ${expiryDate.toLocaleDateString()}</span>
                    <span>Days to Expiry: ${daysToExpiry}</span>
                    <span>Lot Size: ${lotSize}</span>
                    <span>LTP: ${this.formatPrice(price)}</span>
                </div>
            </div>
        `;
        
        // Set default price
        document.getElementById('price').value = price;
        
        // Store current option data
        this.currentOption = {
            symbol,
            strike,
            optionType,
            price,
            lotSize
        };
        
        this.updateRiskAnalysis();
        modal.classList.add('active');
        this.isTradeModalOpen = true;
    }
    
    openStrikeModal(strike) {
        const modal = document.getElementById('strike-modal');
        const title = document.getElementById('strike-modal-title');
        const content = document.getElementById('strike-analysis-content');
        
        title.textContent = `${this.currentSymbol} ${this.formatPrice(strike)} Strike Analysis`;
        
        const symbol = this.currentSymbol;
        const spotPrice = this.spotPrice;
        const timeToExpiry = (new Date(this.currentExpiry) - new Date()) / (1000 * 60 * 60 * 24 * 365);
        
        // Calculate comprehensive analytics
        const callPrice = this.blackScholesCall(spotPrice, strike, timeToExpiry, this.riskFreeRate, 0.25);
        const putPrice = this.blackScholesPut(spotPrice, strike, timeToExpiry, this.riskFreeRate, 0.25);
        const callDelta = this.calculateDelta(spotPrice, strike, timeToExpiry, this.riskFreeRate, 0.25, true);
        const putDelta = this.calculateDelta(spotPrice, strike, timeToExpiry, this.riskFreeRate, 0.25, false);
        const iv = this.calculateImpliedVolatility(strike, spotPrice, timeToExpiry);
        
        const isITM_Call = strike < spotPrice;
        const isITM_Put = strike > spotPrice;
        const moneyness = (spotPrice / strike - 1) * 100;
        
        content.innerHTML = `
            <div class="strike-analysis-grid">
                <div class="analysis-section">
                    <h4>Strike Information</h4>
                    <div class="info-grid">
                        <div class="info-item">
                            <span>Strike Price:</span>
                            <span class="text-gold">${this.formatPrice(strike)}</span>
                        </div>
                        <div class="info-item">
                            <span>Spot Price:</span>
                            <span>${this.formatPrice(spotPrice)}</span>
                        </div>
                        <div class="info-item">
                            <span>Moneyness:</span>
                            <span class="${moneyness >= 0 ? 'text-success' : 'text-danger'}">${moneyness.toFixed(2)}%</span>
                        </div>
                        <div class="info-item">
                            <span>Time to Expiry:</span>
                            <span>${Math.ceil(timeToExpiry * 365)} days</span>
                        </div>
                    </div>
                </div>
                
                <div class="analysis-section">
                    <h4>Call Option (${isITM_Call ? 'ITM' : 'OTM'})</h4>
                    <div class="info-grid">
                        <div class="info-item">
                            <span>Premium:</span>
                            <span class="text-success">${this.formatPrice(callPrice)}</span>
                        </div>
                        <div class="info-item">
                            <span>Delta:</span>
                            <span>${callDelta.toFixed(3)}</span>
                        </div>
                        <div class="info-item">
                            <span>Breakeven:</span>
                            <span>${this.formatPrice(strike + callPrice)}</span>
                        </div>
                        <div class="info-item">
                            <span>Max Profit:</span>
                            <span class="text-success">Unlimited</span>
                        </div>
                        <div class="info-item">
                            <span>Max Loss:</span>
                            <span class="text-danger">${this.formatPrice(callPrice)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="analysis-section">
                    <h4>Put Option (${isITM_Put ? 'ITM' : 'OTM'})</h4>
                    <div class="info-grid">
                        <div class="info-item">
                            <span>Premium:</span>
                            <span class="text-danger">${this.formatPrice(putPrice)}</span>
                        </div>
                        <div class="info-item">
                            <span>Delta:</span>
                            <span>${putDelta.toFixed(3)}</span>
                        </div>
                        <div class="info-item">
                            <span>Breakeven:</span>
                            <span>${this.formatPrice(strike - putPrice)}</span>
                        </div>
                        <div class="info-item">
                            <span>Max Profit:</span>
                            <span class="text-success">${this.formatPrice(strike - putPrice)}</span>
                        </div>
                        <div class="info-item">
                            <span>Max Loss:</span>
                            <span class="text-danger">${this.formatPrice(putPrice)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="analysis-section">
                    <h4>Market Data</h4>
                    <div class="info-grid">
                        <div class="info-item">
                            <span>Implied Volatility:</span>
                            <span>${iv.toFixed(2)}%</span>
                        </div>
                        <div class="info-item">
                            <span>Time Decay (per day):</span>
                            <span class="text-warning">-${(callPrice * 0.05).toFixed(2)}</span>
                        </div>
                        <div class="info-item">
                            <span>Liquidity:</span>
                            <span class="text-info">${this.getLiquidityRating(strike, spotPrice)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="analysis-section full-width">
                    <h4>Trading Strategies</h4>
                    <div class="strategies-grid">
                        <div class="strategy-card">
                            <h5>Long Call</h5>
                            <p>Bullish strategy. Buy call if expecting price to rise above ${this.formatPrice(strike + callPrice)}</p>
                        </div>
                        <div class="strategy-card">
                            <h5>Long Put</h5>
                            <p>Bearish strategy. Buy put if expecting price to fall below ${this.formatPrice(strike - putPrice)}</p>
                        </div>
                        <div class="strategy-card">
                            <h5>Short Straddle</h5>
                            <p>Neutral strategy. Sell both options if expecting low volatility</p>
                        </div>
                        <div class="strategy-card">
                            <h5>Iron Condor</h5>
                            <p>Use this strike as part of a range-bound strategy</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        modal.classList.add('active');
        this.isStrikeModalOpen = true;
    }
    
    getLiquidityRating(strike, spotPrice) {
        const moneyness = Math.abs(strike / spotPrice - 1);
        if (moneyness < 0.02) return 'Excellent';
        if (moneyness < 0.05) return 'Good';
        if (moneyness < 0.10) return 'Moderate';
        return 'Low';
    }
    
    updateRiskAnalysis() {
        if (!this.currentOption) return;
        
        const quantity = parseInt(document.getElementById('quantity').value) || 1;
        const price = parseFloat(document.getElementById('price').value) || this.currentOption.price;
        const action = document.querySelector('input[name="action"]:checked').value;
        const lotSize = this.currentOption.lotSize;
        
        const totalShares = quantity * lotSize;
        let totalCost = totalShares * price;
        let marginRequired = totalCost;
        
        // For selling options, calculate margin differently
        if (action === 'SELL') {
            marginRequired = this.calculateMarginRequirement(this.currentOption, quantity, price);
            totalCost = totalShares * price; // Premium received (negative cost)
        }
        
        const breakeven = this.calculateBreakeven(this.currentOption, price, action);
        
        document.getElementById('total-cost').textContent = 
            action === 'BUY' ? `₹${this.formatNumber(totalCost)}` : `₹${this.formatNumber(-totalCost)} (Credit)`;
        document.getElementById('margin-required').textContent = `₹${this.formatNumber(marginRequired)}`;
        document.getElementById('individual-breakeven').textContent = `₹${this.formatPrice(breakeven)}`;
    }
    
    calculateMarginRequirement(option, quantity, price) {
        const lotSize = option.lotSize;
        const totalShares = quantity * lotSize;
        const premium = totalShares * price;
        
        // SPAN margin calculation (simplified)
        const underlyingValue = this.spotPrice * totalShares;
        const spanMargin = underlyingValue * 0.15; // 15% of underlying value
        const exposureMargin = underlyingValue * 0.05; // 5% exposure margin
        
        return Math.max(spanMargin + exposureMargin - premium, underlyingValue * 0.05);
    }
    
    calculateBreakeven(option, price, action) {
        if (action === 'BUY') {
            return option.optionType === 'CALL' ? 
                option.strike + price : 
                option.strike - price;
        } else {
            return option.optionType === 'CALL' ? 
                option.strike + price : 
                option.strike - price;
        }
    }
    
    togglePriceInput(orderType) {
        const priceGroup = document.getElementById('price-group');
        const priceInput = document.getElementById('price');
        
        if (orderType === 'MARKET') {
            priceGroup.style.display = 'none';
        } else {
            priceGroup.style.display = 'block';
            if (orderType === 'LIMIT') {
                priceInput.placeholder = 'Enter limit price';
            } else if (orderType.startsWith('SL')) {
                priceInput.placeholder = 'Enter trigger price';
            }
        }
        
        this.updateRiskAnalysis();
    }
    
    addToBasket() {
        if (!this.currentOption) return;
        
        const quantity = parseInt(document.getElementById('quantity').value) || 1;
        const price = parseFloat(document.getElementById('price').value) || this.currentOption.price;
        const action = document.querySelector('input[name="action"]:checked').value;
        const orderType = document.getElementById('order-type').value;
        
        const basketItem = {
            id: Date.now(),
            symbol: this.currentOption.symbol,
            strike: this.currentOption.strike,
            optionType: this.currentOption.optionType,
            action: action,
            quantity: quantity,
            price: price,
            orderType: orderType,
            lotSize: this.currentOption.lotSize,
            timestamp: new Date().toLocaleTimeString()
        };
        
        this.basket.push(basketItem);
        this.updateBasketDisplay();
        this.showBasket();
        
        this.showToast('success', 'Added to Basket', 
            `${action} ${quantity}x ${this.currentOption.symbol} ${this.currentOption.strike} ${this.currentOption.optionType}`);
        
        this.closeModals();
    }
    
    placeOrder() {
        if (!this.currentOption) return;
        
        const quantity = parseInt(document.getElementById('quantity').value) || 1;
        const price = parseFloat(document.getElementById('price').value) || this.currentOption.price;
        const action = document.querySelector('input[name="action"]:checked').value;
        const orderType = document.getElementById('order-type').value;
        
        // Simulate order placement
        this.showLoadingOverlay('Placing order...');
        
        setTimeout(() => {
            this.hideLoadingOverlay();
            
            const orderId = 'ORD' + Date.now().toString().slice(-6);
            
            this.showToast('success', 'Order Placed', 
                `Order ${orderId} placed successfully for ${action} ${quantity}x ${this.currentOption.symbol} ${this.currentOption.strike} ${this.currentOption.optionType}`);
            
            this.closeModals();
        }, 2000);
    }
    
    updateBasketDisplay() {
        const basketItems = document.getElementById('basket-items');
        const basketSummary = document.getElementById('basket-summary');
        
        if (this.basket.length === 0) {
            basketItems.innerHTML = `
                <div class="empty-basket">
                    <i class="fas fa-basket-shopping"></i>
                    <p>No options selected</p>
                    <small>Click on option prices to add to basket</small>
                </div>
            `;
            basketSummary.style.display = 'none';
            return;
        }
        
        basketItems.innerHTML = this.basket.map(item => this.createBasketItemHTML(item)).join('');
        basketSummary.style.display = 'block';
        
        this.updateBasketSummary();
    }
    
    createBasketItemHTML(item) {
        const totalCost = item.quantity * item.lotSize * item.price;
        const costDisplay = item.action === 'BUY' ? 
            `₹${this.formatNumber(totalCost)}` : 
            `₹${this.formatNumber(-totalCost)} (Credit)`;
        
        return `
            <div class="basket-item">
                <div class="basket-item-header">
                    <div class="basket-item-title">
                        ${item.symbol} ${this.formatPrice(item.strike)} ${item.optionType}
                    </div>
                    <button class="remove-item" onclick="this.removeFromBasket(${item.id})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="basket-item-details">
                    <div class="basket-item-row">
                        <span>Action:</span>
                        <span class="${item.action === 'BUY' ? 'text-success' : 'text-danger'}">${item.action}</span>
                    </div>
                    <div class="basket-item-row">
                        <span>Quantity:</span>
                        <span>${item.quantity} lots (${item.quantity * item.lotSize} shares)</span>
                    </div>
                    <div class="basket-item-row">
                        <span>Price:</span>
                        <span>${this.formatPrice(item.price)}</span>
                    </div>
                    <div class="basket-item-row">
                        <span>Order Type:</span>
                        <span>${item.orderType}</span>
                    </div>
                    <div class="basket-item-row">
                        <span>Cost:</span>
                        <span class="font-weight-bold">${costDisplay}</span>
                    </div>
                    <div class="basket-item-row">
                        <span>Time:</span>
                        <span class="text-muted">${item.timestamp}</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    removeFromBasket(itemId) {
        this.basket = this.basket.filter(item => item.id !== itemId);
        this.updateBasketDisplay();
        
        this.showToast('info', 'Removed from Basket', 'Option removed from basket');
    }
    
    updateBasketSummary() {
        let netPremium = 0;
        let maxProfit = 0;
        let maxLoss = 0;
        
        this.basket.forEach(item => {
            const cost = item.quantity * item.lotSize * item.price;
            if (item.action === 'BUY') {
                netPremium -= cost;
                maxLoss += cost;
            } else {
                netPremium += cost;
                maxProfit += cost;
            }
        });
        
        document.getElementById('net-premium').textContent = 
            `₹${this.formatNumber(Math.abs(netPremium))} ${netPremium >= 0 ? '(Credit)' : '(Debit)'}`;
        document.getElementById('max-profit').textContent = 
            maxProfit === 0 ? 'Unlimited' : `₹${this.formatNumber(maxProfit)}`;
        document.getElementById('max-loss').textContent = 
            maxLoss === 0 ? '₹0' : `₹${this.formatNumber(maxLoss)}`;
        document.getElementById('breakeven').textContent = 'Multiple levels';
    }
    
    showBasket() {
        document.getElementById('basket-sidebar').classList.add('active');
    }
    
    closeBasket() {
        document.getElementById('basket-sidebar').classList.remove('active');
    }
    
    clearBasket() {
        this.basket = [];
        this.updateBasketDisplay();
        this.showToast('info', 'Basket Cleared', 'All options removed from basket');
    }
    
    executeAllOrders() {
        if (this.basket.length === 0) {
            this.showToast('warning', 'Empty Basket', 'No orders to execute');
            return;
        }
        
        this.showLoadingOverlay('Executing orders...');
        
        setTimeout(() => {
            this.hideLoadingOverlay();
            
            const orderCount = this.basket.length;
            const orderIds = this.basket.map(() => 'ORD' + Date.now().toString().slice(-6));
            
            this.clearBasket();
            this.closeBasket();
            
            this.showToast('success', 'Orders Executed', 
                `${orderCount} orders executed successfully. Order IDs: ${orderIds.slice(0, 3).join(', ')}${orderCount > 3 ? '...' : ''}`);
        }, 3000);
    }
    
    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
        this.isTradeModalOpen = false;
        this.isStrikeModalOpen = false;
        this.currentOption = null;
    }
    
    filterOptions(searchTerm) {
        const rows = document.querySelectorAll('#options-tbody tr');
        const term = searchTerm.toLowerCase();
        
        rows.forEach(row => {
            const strikeCell = row.querySelector('.strike-cell');
            const strike = strikeCell ? strikeCell.textContent : '';
            
            const shouldShow = strike.toLowerCase().includes(term) || 
                             term === '' ||
                             this.currentSymbol.toLowerCase().includes(term);
            
            row.style.display = shouldShow ? '' : 'none';
        });
    }
    
    applyFilter(filterType) {
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filterType}"]`).classList.add('active');
        
        const rows = document.querySelectorAll('#options-tbody tr');
        const spotPrice = this.spotPrice;
        
        rows.forEach(row => {
            const strikeCell = row.querySelector('.strike-cell');
            if (!strikeCell) return;
            
            const strike = parseFloat(strikeCell.textContent.replace(/,/g, ''));
            let shouldShow = true;
            
            switch (filterType) {
                case 'itm':
                    shouldShow = strike < spotPrice; // ITM calls or OTM puts
                    break;
                case 'atm':
                    const interval = this.getStrikeInterval(spotPrice);
                    shouldShow = Math.abs(strike - spotPrice) < interval;
                    break;
                case 'otm':
                    shouldShow = strike > spotPrice; // OTM calls or ITM puts
                    break;
                case 'high-volume':
                    // Show options with higher volume (simulated)
                    const volCells = row.querySelectorAll('.vol-cell');
                    const hasHighVol = Array.from(volCells).some(cell => {
                        const vol = parseInt(cell.textContent.replace(/,/g, ''));
                        return vol > 5000;
                    });
                    shouldShow = hasHighVol;
                    break;
                case 'all':
                default:
                    shouldShow = true;
                    break;
            }
            
            row.style.display = shouldShow ? '' : 'none';
        });
    }
    
    sortTable(sortBy) {
        const tbody = document.getElementById('options-tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        
        // Determine sort direction
        const currentSort = tbody.getAttribute('data-sort');
        const currentDirection = tbody.getAttribute('data-direction') || 'asc';
        const newDirection = (currentSort === sortBy && currentDirection === 'asc') ? 'desc' : 'asc';
        
        tbody.setAttribute('data-sort', sortBy);
        tbody.setAttribute('data-direction', newDirection);
        
        // Sort rows
        rows.sort((a, b) => {
            let aVal, bVal;
            
            switch (sortBy) {
                case 'call-oi':
                case 'put-oi':
                    const oiIndex = sortBy.includes('call') ? 0 : -1;
                    aVal = parseInt(a.querySelectorAll('.oi-cell')[oiIndex]?.textContent.replace(/,/g, '') || '0');
                    bVal = parseInt(b.querySelectorAll('.oi-cell')[oiIndex]?.textContent.replace(/,/g, '') || '0');
                    break;
                    
                case 'call-vol':
                case 'put-vol':
                    const volIndex = sortBy.includes('call') ? 0 : -1;
                    aVal = parseInt(a.querySelectorAll('.vol-cell')[volIndex]?.textContent.replace(/,/g, '') || '0');
                    bVal = parseInt(b.querySelectorAll('.vol-cell')[volIndex]?.textContent.replace(/,/g, '') || '0');
                    break;
                    
                case 'call-ltp':
                case 'put-ltp':
                    const ltpClass = sortBy.includes('call') ? '.call-ltp' : '.put-ltp';
                    aVal = parseFloat(a.querySelector(ltpClass)?.textContent || '0');
                    bVal = parseFloat(b.querySelector(ltpClass)?.textContent || '0');
                    break;
                    
                case 'call-chg':
                case 'put-chg':
                    const changeIndex = sortBy.includes('call') ? 0 : 1;
                    aVal = parseFloat(a.querySelectorAll('.change-cell')[changeIndex]?.textContent.replace('%', '') || '0');
                    bVal = parseFloat(b.querySelectorAll('.change-cell')[changeIndex]?.textContent.replace('%', '') || '0');
                    break;
                    
                default:
                    aVal = a.querySelector('.strike-cell')?.textContent || '';
                    bVal = b.querySelector('.strike-cell')?.textContent || '';
                    break;
            }
            
            if (newDirection === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });
        
        // Re-append sorted rows
        rows.forEach(row => tbody.appendChild(row));
        
        // Update sort indicators
        document.querySelectorAll('.sortable').forEach(th => {
            th.classList.remove('sort-asc', 'sort-desc');
        });
        
        const sortedHeader = document.querySelector(`[data-sort="${sortBy}"]`);
        if (sortedHeader) {
            sortedHeader.classList.add(newDirection === 'asc' ? 'sort-asc' : 'sort-desc');
        }
    }
    
    toggleAutoRefresh() {
        this.isAutoRefresh = !this.isAutoRefresh;
        const refreshBtn = document.getElementById('refresh-data');
        
        if (this.isAutoRefresh) {
            refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Auto-refresh';
            refreshBtn.classList.add('active');
            this.startAutoRefresh();
            this.showToast('success', 'Auto-refresh On', 'Market data will refresh every 5 seconds');
        } else {
            refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Manual';
            refreshBtn.classList.remove('active');
            this.stopAutoRefresh();
            this.showToast('info', 'Auto-refresh Off', 'Click to manually refresh data');
        }
    }
    
    startAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }
        
        this.refreshTimer = setInterval(() => {
            if (this.isAutoRefresh) {
                this.refreshMarketData();
            }
        }, this.refreshInterval);
    }
    
    stopAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
    }
    
    refreshMarketData() {
        // Update spot price with small random movement
        const change = (Math.random() - 0.5) * this.spotPrice * 0.002; // ±0.2% movement
        this.spotPrice += change;
        
        // Update spot price display
        const spotPriceEl = document.getElementById('spot-price');
        const spotChangeEl = document.getElementById('spot-change');
        
        spotPriceEl.textContent = this.formatPrice(this.spotPrice);
        
        const changePercent = (change / (this.spotPrice - change)) * 100;
        const changeText = `${change >= 0 ? '+' : ''}${change.toFixed(2)} (${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)`;
        spotChangeEl.textContent = changeText;
        spotChangeEl.className = `change ${change >= 0 ? 'positive' : 'negative'}`;
        
        // Regenerate options data with new prices
        this.generateOptionsData();
    }
    
    updateMarketTime() {
        const timeEl = document.getElementById('market-time');
        
        setInterval(() => {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('en-IN', { 
                hour12: false,
                timeZone: 'Asia/Kolkata'
            });
            timeEl.textContent = timeStr;
        }, 1000);
    }
    
    switchToOptions(symbol) {
        // Change to options tab
        this.switchTab('options');
        
        // Change symbol
        document.getElementById('symbol-select').value = symbol;
        this.changeSymbol(symbol);
    }
    
    showLoadingOverlay(message = 'Loading market data...') {
        const overlay = document.getElementById('loading-overlay');
        const messageEl = overlay.querySelector('span');
        messageEl.textContent = message;
        overlay.classList.add('active');
    }
    
    hideLoadingOverlay() {
        document.getElementById('loading-overlay').classList.remove('active');
    }
    
    showToast(type, title, message, duration = 5000) {
        const container = document.getElementById('toast-container');
        const toastId = 'toast-' + Date.now();
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.id = toastId;
        toast.innerHTML = `
            <div class="toast-header">
                <div class="toast-title">${title}</div>
                <button class="toast-close" onclick="this.removeToast('${toastId}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="toast-message">${message}</div>
        `;
        
        container.appendChild(toast);
        
        // Auto-remove after duration
        setTimeout(() => {
            this.removeToast(toastId);
        }, duration);
    }
    
    removeToast(toastId) {
        const toast = document.getElementById(toastId);
        if (toast) {
            toast.style.animation = 'toastSlideOut 0.3s ease forwards';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }
    }
    
    formatPrice(price) {
        return new Intl.NumberFormat('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(price);
    }
    
    formatNumber(num) {
        return new Intl.NumberFormat('en-IN').format(num);
    }
}

// Global functions for event handlers
window.openTradeModal = function(symbol, strike, optionType, price) {
    if (window.optionsChain) {
        window.optionsChain.openTradeModal(symbol, strike, optionType, price);
    }
};

window.openStrikeModal = function(strike) {
    if (window.optionsChain) {
        window.optionsChain.openStrikeModal(strike);
    }
};

window.removeFromBasket = function(itemId) {
    if (window.optionsChain) {
        window.optionsChain.removeFromBasket(itemId);
    }
};

window.removeToast = function(toastId) {
    if (window.optionsChain) {
        window.optionsChain.removeToast(toastId);
    }
};

window.switchToOptions = function(symbol) {
    if (window.optionsChain) {
        window.optionsChain.switchToOptions(symbol);
    }
};

// Additional CSS for toast animations
const additionalStyles = `
@keyframes toastSlideOut {
    from {
        opacity: 1;
        transform: translateX(0);
    }
    to {
        opacity: 0;
        transform: translateX(100%);
    }
}

.strike-analysis-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
}

.analysis-section {
    background: var(--tertiary-bg);
    border-radius: var(--radius-md);
    padding: var(--spacing-lg);
}

.analysis-section.full-width {
    grid-column: 1 / -1;
}

.info-grid {
    display: grid;
    gap: var(--spacing-sm);
}

.info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-sm) 0;
    border-bottom: 1px solid var(--border-color);
}

.info-item:last-child {
    border-bottom: none;
}

.strategies-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--spacing-md);
    margin-top: var(--spacing-md);
}

.strategy-card {
    background: var(--quaternary-bg);
    border-radius: var(--radius-sm);
    padding: var(--spacing-md);
    border: 1px solid var(--border-color);
    transition: all var(--transition-fast);
}

.strategy-card:hover {
    border-color: var(--gold);
    transform: translateY(-2px);
}

.strategy-card h5 {
    color: var(--gold);
    margin-bottom: var(--spacing-sm);
}

.strategy-card p {
    font-size: 0.9rem;
    color: var(--secondary-text);
}

@media (max-width: 768px) {
    .strike-analysis-grid {
        grid-template-columns: 1fr;
    }
    
    .strategies-grid {
        grid-template-columns: 1fr;
    }
}
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.optionsChain = new NSEOptionsChain();
    
    // Set initial focus for accessibility
    document.querySelector('.nav-tab.active').focus();
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl+R for refresh
        if (e.ctrlKey && e.key === 'r') {
            e.preventDefault();
            if (window.optionsChain) {
                window.optionsChain.refreshMarketData();
            }
        }
        
        // Escape to close modals
        if (e.key === 'Escape') {
            if (window.optionsChain) {
                window.optionsChain.closeModals();
                window.optionsChain.closeBasket();
            }
        }
        
        // Space to toggle auto-refresh
        if (e.key === ' ' && e.target === document.body) {
            e.preventDefault();
            if (window.optionsChain) {
                window.optionsChain.toggleAutoRefresh();
            }
        }
    });
    
    // Handle visibility change to pause/resume auto-refresh
    document.addEventListener('visibilitychange', () => {
        if (window.optionsChain) {
            if (document.hidden) {
                window.optionsChain.stopAutoRefresh();
            } else if (window.optionsChain.isAutoRefresh) {
                window.optionsChain.startAutoRefresh();
            }
        }
    });
});

// Service Worker registration for offline capability (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Export for testing purposes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NSEOptionsChain;
}