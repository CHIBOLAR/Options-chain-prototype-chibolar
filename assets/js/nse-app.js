// NSE Option Chain Application
// Professional-grade option chain interface for NSE/BSE markets

class NSEOptionChain {
    constructor() {
        this.currentUnderlying = 'NIFTY';
        this.currentExpiry = '2025-09-19';
        this.currentStrikeRange = 30;
        this.optionData = {};
        this.greeksData = {};
        this.isMarketOpen = true;
        this.lastUpdateTime = new Date();
        
        this.init();
    }

    init() {
        this.generateMockData();
        this.bindEvents();
        this.renderOptionChain();
        this.updateMarketSummary();
        this.startRealTimeUpdates();
        this.setupTableControls();
    }

    // NSE-specific option data structure
    generateMockData() {
        const underlyings = {
            'NIFTY': { price: 24413.50, lotSize: 25, tickSize: 0.05, change: 156.75, changePercent: 0.65 },
            'BANKNIFTY': { price: 52745.30, lotSize: 15, tickSize: 0.05, change: -248.60, changePercent: -0.47 },
            'FINNIFTY': { price: 23847.20, lotSize: 25, tickSize: 0.05, change: 89.45, changePercent: 0.38 },
            'MIDCPNIFTY': { price: 14562.80, lotSize: 50, tickSize: 0.05, change: -23.15, changePercent: -0.16 },
            'RELIANCE': { price: 2847.50, lotSize: 250, tickSize: 0.05, change: 12.30, changePercent: 0.43 },
            'TCS': { price: 4125.80, lotSize: 125, tickSize: 0.05, change: -15.60, changePercent: -0.38 }
        };

        const underlying = underlyings[this.currentUnderlying];
        const atmStrike = Math.round(underlying.price / 50) * 50;
        
        this.optionData = {};
        this.greeksData = {};

        // Generate strikes around ATM
        const strikeRange = this.currentStrikeRange === 'all' ? 50 : parseInt(this.currentStrikeRange);
        const strikeInterval = this.currentUnderlying === 'NIFTY' ? 50 : 
                              this.currentUnderlying === 'BANKNIFTY' ? 100 : 50;

        for (let i = -strikeRange; i <= strikeRange; i++) {
            const strike = atmStrike + (i * strikeInterval);
            if (strike <= 0) continue;

            const moneyness = strike / underlying.price;
            const isITM_Call = strike < underlying.price;
            const isITM_Put = strike > underlying.price;
            
            // Realistic IV curve (smile)
            const atmIV = 0.12 + Math.random() * 0.03;
            const ivSkew = Math.abs(moneyness - 1) * 0.15;
            const callIV = atmIV + ivSkew + (Math.random() - 0.5) * 0.02;
            const putIV = atmIV + ivSkew * 1.1 + (Math.random() - 0.5) * 0.02;

            // Options pricing using simplified Black-Scholes approximation
            const timeToExpiry = this.getTimeToExpiry();
            const callPrice = this.calculateOptionPrice(underlying.price, strike, timeToExpiry, callIV, true);
            const putPrice = this.calculateOptionPrice(underlying.price, strike, timeToExpiry, putIV, false);

            // Open Interest patterns (higher at round numbers and ITM options)
            const roundNumberMultiplier = (strike % (strikeInterval * 2) === 0) ? 2.5 : 1;
            const itmMultiplier = (isITM_Call || isITM_Put) ? 1.5 : 1;
            const distanceMultiplier = Math.max(0.3, 1 - Math.abs(moneyness - 1) * 2);

            const baseCallOI = Math.floor((50000 + Math.random() * 100000) * roundNumberMultiplier * distanceMultiplier);
            const basePutOI = Math.floor((40000 + Math.random() * 120000) * roundNumberMultiplier * itmMultiplier);

            // Volume patterns (higher for ATM and recent activity)
            const callVolume = Math.floor(baseCallOI * (0.05 + Math.random() * 0.15));
            const putVolume = Math.floor(basePutOI * (0.05 + Math.random() * 0.15));

            this.optionData[strike] = {
                call: {
                    oi: baseCallOI,
                    changeInOI: Math.floor((Math.random() - 0.5) * baseCallOI * 0.1),
                    volume: callVolume,
                    iv: callIV,
                    ltp: callPrice,
                    change: (Math.random() - 0.5) * callPrice * 0.15,
                    bidQty: Math.floor(underlying.lotSize * (1 + Math.random() * 5)),
                    bid: callPrice * (0.995 - Math.random() * 0.01),
                    ask: callPrice * (1.005 + Math.random() * 0.01)
                },
                put: {
                    oi: basePutOI,
                    changeInOI: Math.floor((Math.random() - 0.5) * basePutOI * 0.1),
                    volume: putVolume,
                    iv: putIV,
                    ltp: putPrice,
                    change: (Math.random() - 0.5) * putPrice * 0.15,
                    bidQty: Math.floor(underlying.lotSize * (1 + Math.random() * 5)),
                    bid: putPrice * (0.995 - Math.random() * 0.01),
                    ask: putPrice * (1.005 + Math.random() * 0.01)
                }
            };

            // Calculate Greeks
            this.greeksData[strike] = {
                call: this.calculateGreeks(underlying.price, strike, timeToExpiry, callIV, true),
                put: this.calculateGreeks(underlying.price, strike, timeToExpiry, putIV, false)
            };
        }
    }

    calculateOptionPrice(spotPrice, strike, timeToExpiry, iv, isCall) {
        const d1 = (Math.log(spotPrice / strike) + (0.05 + Math.pow(iv, 2) / 2) * timeToExpiry) / (iv * Math.sqrt(timeToExpiry));
        const d2 = d1 - iv * Math.sqrt(timeToExpiry);
        
        const nd1 = this.normalCDF(d1);
        const nd2 = this.normalCDF(d2);
        const nMinusd1 = this.normalCDF(-d1);
        const nMinusd2 = this.normalCDF(-d2);
        
        if (isCall) {
            return Math.max(0, spotPrice * nd1 - strike * Math.exp(-0.05 * timeToExpiry) * nd2);
        } else {
            return Math.max(0, strike * Math.exp(-0.05 * timeToExpiry) * nMinusd2 - spotPrice * nMinusd1);
        }
    }

    calculateGreeks(spotPrice, strike, timeToExpiry, iv, isCall) {
        const d1 = (Math.log(spotPrice / strike) + (0.05 + Math.pow(iv, 2) / 2) * timeToExpiry) / (iv * Math.sqrt(timeToExpiry));
        const d2 = d1 - iv * Math.sqrt(timeToExpiry);
        
        const nd1 = this.normalCDF(d1);
        const pdf = (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * Math.pow(d1, 2));
        
        const delta = isCall ? nd1 : nd1 - 1;
        const gamma = pdf / (spotPrice * iv * Math.sqrt(timeToExpiry));
        const theta = isCall ? 
            (-spotPrice * pdf * iv / (2 * Math.sqrt(timeToExpiry)) - 0.05 * strike * Math.exp(-0.05 * timeToExpiry) * this.normalCDF(d2)) / 365 :
            (-spotPrice * pdf * iv / (2 * Math.sqrt(timeToExpiry)) + 0.05 * strike * Math.exp(-0.05 * timeToExpiry) * this.normalCDF(-d2)) / 365;
        const vega = spotPrice * pdf * Math.sqrt(timeToExpiry) / 100;
        
        return { delta: delta, gamma: gamma, theta: theta, vega: vega };
    }

    normalCDF(x) {
        return 0.5 * (1 + this.erf(x / Math.sqrt(2)));
    }

    erf(x) {
        const a1 =  0.254829592;
        const a2 = -0.284496736;
        const a3 =  1.421413741;
        const a4 = -1.453152027;
        const a5 =  1.061405429;
        const p  =  0.3275911;
        
        const sign = x < 0 ? -1 : 1;
        x = Math.abs(x);
        
        const t = 1.0 / (1.0 + p * x);
        const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
        
        return sign * y;
    }

    getTimeToExpiry() {
        const expiryDate = new Date(this.currentExpiry);
        const today = new Date();
        const diffTime = expiryDate - today;
        return Math.max(0.01, diffTime / (1000 * 60 * 60 * 24 * 365)); // Years
    }

    renderOptionChain() {
        const tbody = document.getElementById('optionChainBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        
        const strikes = Object.keys(this.optionData)
            .map(s => parseInt(s))
            .sort((a, b) => a - b);

        const underlying = this.getCurrentUnderlyingData();
        const spotPrice = underlying.price;

        strikes.forEach(strike => {
            const data = this.optionData[strike];
            const row = document.createElement('tr');
            
            const isATM = Math.abs(strike - spotPrice) < 25;
            const isITM_Call = strike < spotPrice;
            const isITM_Put = strike > spotPrice;
            
            if (isATM) row.classList.add('atm-row');

            row.innerHTML = `
                <!-- Call Options -->
                <td class="oi-cell ${isITM_Call ? 'itm' : 'otm'}">${this.formatNumber(data.call.oi)}</td>
                <td class="change-oi-cell ${data.call.changeInOI >= 0 ? 'positive' : 'negative'}">
                    ${data.call.changeInOI >= 0 ? '+' : ''}${this.formatNumber(data.call.changeInOI)}
                </td>
                <td class="volume-cell">${this.formatNumber(data.call.volume)}</td>
                <td class="iv-cell">${(data.call.iv * 100).toFixed(2)}</td>
                <td class="ltp-cell call-ltp ${isITM_Call ? 'itm' : 'otm'}">${data.call.ltp.toFixed(2)}</td>
                <td class="change-cell ${data.call.change >= 0 ? 'positive' : 'negative'}">
                    ${data.call.change >= 0 ? '+' : ''}${data.call.change.toFixed(2)}
                </td>
                <td class="bid-qty-cell">${data.call.bidQty}</td>
                <td class="bid-cell">${data.call.bid.toFixed(2)}</td>
                <td class="ask-cell">${data.call.ask.toFixed(2)}</td>
                
                <!-- Strike Price -->
                <td class="strike-cell ${isATM ? 'atm-strike' : ''}" data-strike="${strike}">${strike}</td>
                
                <!-- Put Options -->
                <td class="ask-cell">${data.put.ask.toFixed(2)}</td>
                <td class="bid-cell">${data.put.bid.toFixed(2)}</td>
                <td class="bid-qty-cell">${data.put.bidQty}</td>
                <td class="change-cell ${data.put.change >= 0 ? 'positive' : 'negative'}">
                    ${data.put.change >= 0 ? '+' : ''}${data.put.change.toFixed(2)}
                </td>
                <td class="ltp-cell put-ltp ${isITM_Put ? 'itm' : 'otm'}">${data.put.ltp.toFixed(2)}</td>
                <td class="iv-cell">${(data.put.iv * 100).toFixed(2)}</td>
                <td class="volume-cell">${this.formatNumber(data.put.volume)}</td>
                <td class="change-oi-cell ${data.put.changeInOI >= 0 ? 'positive' : 'negative'}">
                    ${data.put.changeInOI >= 0 ? '+' : ''}${this.formatNumber(data.put.changeInOI)}
                </td>
                <td class="oi-cell ${isITM_Put ? 'itm' : 'otm'}">${this.formatNumber(data.put.oi)}</td>
            `;
            
            tbody.appendChild(row);
        });

        this.updateGreeksTable();
    }

    updateGreeksTable() {
        const greeksBody = document.getElementById('greeksTableBody');
        if (!greeksBody) return;

        greeksBody.innerHTML = '';
        
        const strikes = Object.keys(this.greeksData)
            .map(s => parseInt(s))
            .sort((a, b) => a - b);

        strikes.forEach(strike => {
            const greeks = this.greeksData[strike];
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td class="strike-cell">${strike}</td>
                <td class="delta-cell">${greeks.call.delta.toFixed(3)}</td>
                <td class="gamma-cell">${greeks.call.gamma.toFixed(4)}</td>
                <td class="theta-cell">${greeks.call.theta.toFixed(3)}</td>
                <td class="vega-cell">${greeks.call.vega.toFixed(3)}</td>
                <td class="delta-cell">${greeks.put.delta.toFixed(3)}</td>
                <td class="gamma-cell">${greeks.put.gamma.toFixed(4)}</td>
                <td class="theta-cell">${greeks.put.theta.toFixed(3)}</td>
                <td class="vega-cell">${greeks.put.vega.toFixed(3)}</td>
            `;
            
            greeksBody.appendChild(row);
        });
    }

    updateMarketSummary() {
        const totalCallOI = Object.values(this.optionData).reduce((sum, data) => sum + data.call.oi, 0);
        const totalPutOI = Object.values(this.optionData).reduce((sum, data) => sum + data.put.oi, 0);
        const totalVolume = Object.values(this.optionData).reduce((sum, data) => sum + data.call.volume + data.put.volume, 0);
        
        const pcr = (totalPutOI / totalCallOI).toFixed(2);
        const maxPain = this.calculateMaxPain();
        const atmIV = this.calculateATMIV();
        
        document.getElementById('pcrValue').textContent = pcr;
        document.getElementById('maxPain').textContent = maxPain.toLocaleString();
        document.getElementById('atmIV').textContent = (atmIV * 100).toFixed(2) + '%';
        document.getElementById('totalOI').textContent = this.formatLargeNumber(totalCallOI + totalPutOI);
        document.getElementById('totalVolume').textContent = this.formatLargeNumber(totalVolume);
    }

    calculateMaxPain() {
        const underlying = this.getCurrentUnderlyingData();
        let minPain = Infinity;
        let maxPainStrike = 0;

        Object.keys(this.optionData).forEach(strike => {
            const strikePrice = parseInt(strike);
            let totalPain = 0;

            Object.keys(this.optionData).forEach(otherStrike => {
                const otherStrikePrice = parseInt(otherStrike);
                const data = this.optionData[otherStrike];

                if (strikePrice < otherStrikePrice) {
                    totalPain += data.call.oi * (otherStrikePrice - strikePrice);
                }
                if (strikePrice > otherStrikePrice) {
                    totalPain += data.put.oi * (strikePrice - otherStrikePrice);
                }
            });

            if (totalPain < minPain) {
                minPain = totalPain;
                maxPainStrike = strikePrice;
            }
        });

        return maxPainStrike;
    }

    calculateATMIV() {
        const underlying = this.getCurrentUnderlyingData();
        const atmStrike = Math.round(underlying.price / 50) * 50;
        
        if (this.optionData[atmStrike]) {
            return (this.optionData[atmStrike].call.iv + this.optionData[atmStrike].put.iv) / 2;
        }
        
        return 0.12;
    }

    getCurrentUnderlyingData() {
        const underlyings = {
            'NIFTY': { price: 24413.50, lotSize: 25, change: 156.75, changePercent: 0.65 },
            'BANKNIFTY': { price: 52745.30, lotSize: 15, change: -248.60, changePercent: -0.47 },
            'FINNIFTY': { price: 23847.20, lotSize: 25, change: 89.45, changePercent: 0.38 },
            'MIDCPNIFTY': { price: 14562.80, lotSize: 50, change: -23.15, changePercent: -0.16 },
            'RELIANCE': { price: 2847.50, lotSize: 250, change: 12.30, changePercent: 0.43 },
            'TCS': { price: 4125.80, lotSize: 125, change: -15.60, changePercent: -0.38 }
        };
        
        return underlyings[this.currentUnderlying];
    }

    formatNumber(num) {
        if (num >= 10000000) return (num / 10000000).toFixed(1) + 'Cr';
        if (num >= 100000) return (num / 100000).toFixed(1) + 'L';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    }

    formatLargeNumber(num) {
        if (num >= 10000000) return (num / 10000000).toFixed(2) + ' Cr';
        if (num >= 100000) return (num / 100000).toFixed(1) + ' L';
        return this.formatNumber(num);
    }

    bindEvents() {
        // Underlying selection
        const underlyingSelect = document.getElementById('underlyingSelect');
        if (underlyingSelect) {
            underlyingSelect.addEventListener('change', (e) => {
                this.currentUnderlying = e.target.value;
                this.generateMockData();
                this.renderOptionChain();
                this.updateMarketSummary();
            });
        }

        // Expiry selection
        const expirySelect = document.getElementById('expirySelect');
        if (expirySelect) {
            expirySelect.addEventListener('change', (e) => {
                this.currentExpiry = e.target.value;
                this.generateMockData();
                this.renderOptionChain();
                this.updateMarketSummary();
            });
        }

        // Strike range selection
        const strikeRange = document.getElementById('strikeRange');
        if (strikeRange) {
            strikeRange.addEventListener('change', (e) => {
                this.currentStrikeRange = e.target.value;
                this.generateMockData();
                this.renderOptionChain();
                this.updateMarketSummary();
            });
        }

        // View options
        const viewBtns = document.querySelectorAll('.view-btn');
        viewBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                viewBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.filterTableView(e.target.dataset.view);
            });
        });

        // Sortable headers
        const sortableHeaders = document.querySelectorAll('.sortable');
        sortableHeaders.forEach(header => {
            header.addEventListener('click', () => {
                this.sortTable(header.dataset.sort);
            });
        });
    }

    filterTableView(view) {
        const table = document.getElementById('optionChainTable');
        const rows = table.querySelectorAll('tbody tr');
        
        rows.forEach(row => {
            row.style.display = '';
            const callLtp = parseFloat(row.querySelector('.call-ltp').textContent);
            const putLtp = parseFloat(row.querySelector('.put-ltp').textContent);
            const strike = parseInt(row.querySelector('.strike-cell').textContent);
            const underlying = this.getCurrentUnderlyingData();
            
            switch(view) {
                case 'calls':
                    row.querySelectorAll('td').forEach((cell, index) => {
                        if (index >= 10 && index <= 18) cell.style.display = 'none';
                    });
                    break;
                case 'puts':
                    row.querySelectorAll('td').forEach((cell, index) => {
                        if (index >= 0 && index <= 8) cell.style.display = 'none';
                    });
                    break;
                case 'itm':
                    const isCallITM = strike < underlying.price;
                    const isPutITM = strike > underlying.price;
                    if (!isCallITM && !isPutITM) row.style.display = 'none';
                    break;
                default:
                    row.querySelectorAll('td').forEach(cell => cell.style.display = '');
            }
        });
    }

    sortTable(sortBy) {
        // Implementation for table sorting
        console.log('Sorting by:', sortBy);
    }

    setupTableControls() {
        // Settings button
        const settingsBtn = document.querySelector('.settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                console.log('Table settings clicked');
            });
        }

        // Export button
        const exportBtn = document.querySelector('.export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportData();
            });
        }
    }

    exportData() {
        const csvData = this.generateCSVData();
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.currentUnderlying}_option_chain_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    }

    generateCSVData() {
        let csv = 'Strike,Call OI,Call Change OI,Call Volume,Call IV,Call LTP,Call Change,Put LTP,Put Change,Put IV,Put Volume,Put Change OI,Put OI\n';
        
        Object.keys(this.optionData).sort((a, b) => parseInt(a) - parseInt(b)).forEach(strike => {
            const data = this.optionData[strike];
            csv += `${strike},${data.call.oi},${data.call.changeInOI},${data.call.volume},${data.call.iv.toFixed(4)},${data.call.ltp.toFixed(2)},${data.call.change.toFixed(2)},${data.put.ltp.toFixed(2)},${data.put.change.toFixed(2)},${data.put.iv.toFixed(4)},${data.put.volume},${data.put.changeInOI},${data.put.oi}\n`;
        });
        
        return csv;
    }

    startRealTimeUpdates() {
        setInterval(() => {
            if (this.isMarketOpen) {
                this.updatePricesRealTime();
            }
        }, 2000);

        setInterval(() => {
            document.querySelector('.time').textContent = new Date().toLocaleTimeString('en-IN');
        }, 1000);
    }

    updatePricesRealTime() {
        Object.keys(this.optionData).forEach(strike => {
            const data = this.optionData[strike];
            
            // Small random price movements
            const callChange = (Math.random() - 0.5) * 0.5;
            const putChange = (Math.random() - 0.5) * 0.5;
            
            data.call.ltp = Math.max(0.05, data.call.ltp + callChange);
            data.put.ltp = Math.max(0.05, data.put.ltp + putChange);
            data.call.change += callChange;
            data.put.change += putChange;
            
            // Update bid/ask
            data.call.bid = data.call.ltp * (0.995 - Math.random() * 0.01);
            data.call.ask = data.call.ltp * (1.005 + Math.random() * 0.01);
            data.put.bid = data.put.ltp * (0.995 - Math.random() * 0.01);
            data.put.ask = data.put.ltp * (1.005 + Math.random() * 0.01);
        });
        
        // Update only visible cells to avoid full re-render
        this.updateVisibleCells();
    }

    updateVisibleCells() {
        const rows = document.querySelectorAll('#optionChainBody tr');
        rows.forEach((row, index) => {
            const strike = row.querySelector('.strike-cell').textContent;
            const data = this.optionData[strike];
            if (!data) return;
            
            // Update LTP cells
            const callLtpCell = row.querySelector('.call-ltp');
            const putLtpCell = row.querySelector('.put-ltp');
            
            if (callLtpCell) {
                callLtpCell.textContent = data.call.ltp.toFixed(2);
                callLtpCell.classList.add('updated');
                setTimeout(() => callLtpCell.classList.remove('updated'), 500);
            }
            
            if (putLtpCell) {
                putLtpCell.textContent = data.put.ltp.toFixed(2);
                putLtpCell.classList.add('updated');
                setTimeout(() => putLtpCell.classList.remove('updated'), 500);
            }
        });
    }
}

// Global functions for HTML onclick handlers
function refreshOptionChain() {
    if (window.nseApp) {
        window.nseApp.generateMockData();
        window.nseApp.renderOptionChain();
        window.nseApp.updateMarketSummary();
    }
}

function toggleGreeks() {
    const greeksSection = document.getElementById('greeksSection');
    const toggleBtn = document.querySelector('.toggle-greeks');
    
    if (greeksSection.style.display === 'none') {
        greeksSection.style.display = 'block';
        toggleBtn.textContent = 'Hide Greeks';
    } else {
        greeksSection.style.display = 'none';
        toggleBtn.textContent = 'Show Greeks';
    }
}

function showAnalysis() {
    const analysisPanel = document.getElementById('analysisPanel');
    if (analysisPanel.style.display === 'none') {
        analysisPanel.style.display = 'block';
        // Initialize charts here if needed
    } else {
        analysisPanel.style.display = 'none';
    }
}

function showStrategies() {
    console.log('Strategy builder - Coming soon');
}

function showAlerts() {
    console.log('Price alerts - Coming soon');
}

function showPremiumFeatures() {
    console.log('Pro tools - Coming soon');
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.nseApp = new NSEOptionChain();
});