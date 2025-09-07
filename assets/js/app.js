/**
 * OptionTrade Pro - Main Application JavaScript
 * Handles all interactions, real-time updates, and navigation
 */

// Global Application State
window.OptionTradeApp = {
    // Configuration
    config: {
        updateInterval: 2000, // Price update interval in ms
        enableRealTimeUpdates: true,
        apiEndpoint: null, // Would be set for real data
        commission: 0.65 // Per contract commission
    },
    
    // Application state
    state: {
        currentSymbol: 'AAPL',
        currentExpiry: '2025-09-21',
        selectedOptions: new Map(),
        priceUpdateInterval: null,
        lastUpdateTime: null
    },
    
    // Initialize application
    init: function() {
        this.setupEventListeners();
        this.setupModalHandlers();
        this.setupNavigationHandlers();
        this.startPriceUpdates();
        this.updateTimestamp();
        
        console.log('OptionTrade Pro initialized');
    },
    
    // Event Listeners Setup
    setupEventListeners: function() {
        // Search functionality
        const searchInput = document.getElementById('stockSearch');
        if (searchInput) {
            searchInput.addEventListener('input', this.handleSearch.bind(this));
            searchInput.addEventListener('keydown', this.handleSearchKeydown.bind(this));
        }
        
        // Help button
        const helpBtn = document.getElementById('helpBtn');
        if (helpBtn) {
            helpBtn.addEventListener('click', this.showHelp.bind(this));
        }
        
        // Mode switches
        const modeSwitch = document.getElementById('modeSwitch');
        if (modeSwitch) {
            modeSwitch.addEventListener('click', this.toggleMode.bind(this));
        }
        
        // Auto-refresh toggles
        const autoRefreshSwitch = document.getElementById('autoRefreshSwitch');
        if (autoRefreshSwitch) {
            autoRefreshSwitch.addEventListener('click', this.toggleAutoRefresh.bind(this));
        }
        
        // Navigation tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', this.handleNavigation.bind(this));
        });
        
        // Quantity selectors
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('quantity-btn')) {
                this.handleQuantityChange(e);
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));
        
        // Window resize handling
        window.addEventListener('resize', this.handleResize.bind(this));
    },
    
    // Modal Handlers Setup
    setupModalHandlers: function() {
        // Modal close buttons
        document.querySelectorAll('.modal-close, [data-dismiss="modal"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal-overlay');
                if (modal) {
                    this.closeModal(modal);
                }
            });
        });
        
        // Modal overlay click to close
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeModal(overlay);
                }
            });
        });
        
        // Order type changes
        const orderTypeSelects = document.querySelectorAll('#orderType, #strategyOrderType');
        orderTypeSelects.forEach(select => {
            select.addEventListener('change', this.handleOrderTypeChange.bind(this));
        });
    },
    
    // Navigation Handlers
    setupNavigationHandlers: function() {
        // Mobile navigation
        document.querySelectorAll('.nav-tab[data-tab]').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchMobileTab(e.target.dataset.tab);
            });
        });
        
        // Breadcrumb navigation
        this.updateBreadcrumbs();
    },
    
    // Search Functionality
    handleSearch: function(e) {
        const query = e.target.value.toLowerCase();
        
        if (query.length < 1) {
            this.hideSuggestions();
            return;
        }
        
        // Mock search suggestions
        const suggestions = this.getSearchSuggestions(query);
        this.showSuggestions(suggestions);
    },
    
    handleSearchKeydown: function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const query = e.target.value.toUpperCase();
            if (this.isValidSymbol(query)) {
                this.navigateToSymbol(query);
            }
        }
    },
    
    getSearchSuggestions: function(query) {
        const symbols = [
            { symbol: 'AAPL', name: 'Apple Inc.', price: 150.25, change: '+1.85' },
            { symbol: 'TSLA', name: 'Tesla Inc.', price: 208.50, change: '-0.80' },
            { symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.90, change: '+0.50' },
            { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 138.75, change: '+1.80' },
            { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 143.20, change: '-0.30' },
            { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 875.30, change: '+24.50' },
            { symbol: 'META', name: 'Meta Platforms Inc.', price: 299.45, change: '+3.20' },
            { symbol: 'NFLX', name: 'Netflix Inc.', price: 445.67, change: '-2.15' }
        ];
        
        return symbols.filter(s => 
            s.symbol.toLowerCase().includes(query) || 
            s.name.toLowerCase().includes(query)
        ).slice(0, 5);
    },
    
    showSuggestions: function(suggestions) {
        const container = document.getElementById('searchSuggestions');
        if (!container) return;
        
        if (suggestions.length === 0) {
            this.hideSuggestions();
            return;
        }
        
        container.innerHTML = suggestions.map(suggestion => `
            <div class="search-suggestion" onclick="OptionTradeApp.selectSuggestion('${suggestion.symbol}')"
                 style="padding: 0.75rem; border-bottom: 1px solid var(--gray-200); cursor: pointer; transition: background-color var(--transition-fast);"
                 onmouseover="this.style.backgroundColor='var(--gray-100)'"
                 onmouseout="this.style.backgroundColor='transparent'">
                <div class="d-flex justify-between align-center">
                    <div>
                        <div class="fw-bold">${suggestion.symbol}</div>
                        <div style="font-size: 0.875rem; color: var(--gray-600);">${suggestion.name}</div>
                    </div>
                    <div class="text-right">
                        <div class="fw-semibold">$${suggestion.price}</div>
                        <div class="${suggestion.change.startsWith('+') ? 'text-success' : 'text-danger'}" style="font-size: 0.875rem;">
                            ${suggestion.change}
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
        container.classList.remove('d-none');
        container.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border: 1px solid var(--gray-200);
            border-top: none;
            border-radius: 0 0 var(--border-radius) var(--border-radius);
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            max-height: 300px;
            overflow-y: auto;
        `;
    },
    
    hideSuggestions: function() {
        const container = document.getElementById('searchSuggestions');
        if (container) {
            container.classList.add('d-none');
        }
    },
    
    selectSuggestion: function(symbol) {
        this.navigateToSymbol(symbol);
        this.hideSuggestions();
    },
    
    isValidSymbol: function(symbol) {
        return /^[A-Z]{1,5}$/.test(symbol);
    },
    
    navigateToSymbol: function(symbol) {
        this.state.currentSymbol = symbol;
        
        // Update search input
        const searchInput = document.getElementById('stockSearch');
        if (searchInput) {
            searchInput.value = symbol;
        }
        
        // Update all stock symbols on page
        document.querySelectorAll('#stockSymbol').forEach(el => {
            el.textContent = symbol;
        });
        
        // Update company name (mock data)
        const companyNames = {
            'AAPL': 'Apple Inc.',
            'TSLA': 'Tesla Inc.',
            'MSFT': 'Microsoft Corp.',
            'GOOGL': 'Alphabet Inc.',
            'AMZN': 'Amazon.com Inc.',
            'NVDA': 'NVIDIA Corp.'
        };
        
        document.querySelectorAll('#companyName').forEach(el => {
            el.textContent = companyNames[symbol] || symbol;
        });
        
        this.hideSuggestions();
        this.refreshOptionData();
    },
    
    // Price Updates and Real-time Data
    startPriceUpdates: function() {
        if (!this.config.enableRealTimeUpdates) return;
        
        this.state.priceUpdateInterval = setInterval(() => {
            this.updatePrices();
            this.updateTimestamp();
        }, this.config.updateInterval);
    },
    
    stopPriceUpdates: function() {
        if (this.state.priceUpdateInterval) {
            clearInterval(this.state.priceUpdateInterval);
            this.state.priceUpdateInterval = null;
        }
    },
    
    updatePrices: function() {
        // Update stock price
        this.updateStockPrice();
        
        // Update option prices
        this.updateOptionPrices();
        
        // Update volume indicators
        this.updateVolumeIndicators();
        
        // Update Greeks (simulated changes)
        this.updateGreeks();
    },
    
    updateStockPrice: function() {
        const priceElements = document.querySelectorAll('#stockPrice');
        const changeElements = document.querySelectorAll('#stockChange');
        
        priceElements.forEach(el => {
            const currentPrice = parseFloat(el.textContent.replace('$', ''));
            const change = (Math.random() - 0.5) * 0.5; // Random change ±$0.25
            const newPrice = Math.max(0.01, currentPrice + change);
            
            el.textContent = '$' + newPrice.toFixed(2);
            
            // Update change indicators
            changeElements.forEach(changeEl => {
                const totalChange = newPrice - 150.25; // Assuming base price of $150.25
                const percentChange = (totalChange / 150.25) * 100;
                const changeSign = totalChange >= 0 ? '+' : '';
                
                changeEl.textContent = `${changeSign}$${totalChange.toFixed(2)} (${changeSign}${percentChange.toFixed(2)}%)`;
                changeEl.className = totalChange >= 0 ? 'text-success' : 'text-danger';
            });
        });
    },
    
    updateOptionPrices: function() {
        const priceCells = document.querySelectorAll('.price-cell[data-price], .last-price, .price');
        
        priceCells.forEach(cell => {
            if (Math.random() < 0.12) { // 12% chance of price change
                const currentPrice = parseFloat(cell.dataset.price || cell.textContent.replace('$', ''));
                const volatility = this.calculateVolatility(currentPrice);
                const change = (Math.random() - 0.5) * volatility;
                const newPrice = Math.max(0.01, currentPrice + change);
                
                // Update price
                if (cell.dataset.price) {
                    cell.dataset.price = newPrice.toFixed(2);
                }
                cell.textContent = cell.textContent.includes('$') ? '$' + newPrice.toFixed(2) : newPrice.toFixed(2);
                
                // Add flash effect
                this.addPriceFlash(cell, change);
                
                // Update related elements
                this.updateRelatedPrices(cell, newPrice);
            }
        });
    },
    
    calculateVolatility: function(price) {
        // Higher volatility for lower-priced options
        if (price < 1) return 0.05;
        if (price < 3) return 0.08;
        if (price < 10) return 0.15;
        return 0.25;
    },
    
    addPriceFlash: function(element, change) {
        element.classList.remove('price-up', 'price-down');
        
        if (change > 0) {
            element.classList.add('price-up');
        } else if (change < 0) {
            element.classList.add('price-down');
        }
        
        setTimeout(() => {
            element.classList.remove('price-up', 'price-down');
        }, 1000);
    },
    
    updateRelatedPrices: function(priceCell, newPrice) {
        // Update bid/ask spread
        const row = priceCell.closest('tr');
        if (row) {
            const bidCell = row.querySelector('.bid-cell');
            const askCell = row.querySelector('.ask-cell');
            
            if (bidCell && askCell) {
                const spread = 0.05 + (Math.random() * 0.10); // $0.05-0.15 spread
                bidCell.textContent = (newPrice - spread/2).toFixed(2);
                askCell.textContent = (newPrice + spread/2).toFixed(2);
            }
        }
    },
    
    updateVolumeIndicators: function() {
        const volumeCells = document.querySelectorAll('.volume-cell');
        
        volumeCells.forEach(cell => {
            if (Math.random() < 0.08) { // 8% chance of volume spike
                const currentVol = parseInt(cell.dataset.volume) || this.parseVolume(cell.textContent);
                const increase = Math.floor(Math.random() * 500) + 100;
                const newVol = currentVol + increase;
                
                cell.dataset.volume = newVol;
                cell.textContent = this.formatVolume(newVol);
                
                // Add volume spike indicator
                if (increase > 300) {
                    cell.classList.add('volume-spike');
                    setTimeout(() => {
                        cell.classList.remove('volume-spike');
                    }, 5000);
                }
            }
        });
    },
    
    parseVolume: function(text) {
        const num = parseFloat(text.replace(/[^0-9.]/g, ''));
        if (text.includes('K')) return num * 1000;
        return num || 0;
    },
    
    formatVolume: function(volume) {
        if (volume >= 1000) {
            return (volume / 1000).toFixed(1) + 'K';
        }
        return volume.toString();
    },
    
    updateGreeks: function() {
        const greekCells = document.querySelectorAll('.greek-cell');
        
        greekCells.forEach(cell => {
            if (Math.random() < 0.05) { // 5% chance of Greek change
                const currentValue = parseFloat(cell.textContent);
                const change = (Math.random() - 0.5) * 0.02; // Small change
                const newValue = currentValue + change;
                
                // Format based on Greek type
                if (cell.classList.contains('delta-cell')) {
                    cell.textContent = newValue.toFixed(2);
                } else if (cell.classList.contains('gamma-cell')) {
                    cell.textContent = Math.max(0, newValue).toFixed(3);
                } else if (cell.classList.contains('theta-cell')) {
                    cell.textContent = Math.min(0, newValue).toFixed(2);
                } else if (cell.classList.contains('vega-cell')) {
                    cell.textContent = Math.max(0, newValue).toFixed(2);
                }
            }
        });
    },
    
    updateTimestamp: function() {
        const timestampElements = document.querySelectorAll('#lastUpdate');
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', {
            timeZone: 'America/New_York',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        }) + ' ET';
        
        timestampElements.forEach(el => {
            el.textContent = timeString;
        });
        
        this.state.lastUpdateTime = now;
    },
    
    // Modal Management
    showModal: function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    },
    
    closeModal: function(modal) {
        if (typeof modal === 'string') {
            modal = document.getElementById(modal);
        }
        
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    },
    
    // Option Trading Functions
    openOrderModal: function(type, strike, premium, action = 'buy') {
        const modal = document.getElementById('orderModal');
        if (!modal) return;
        
        // Populate modal with option data
        const title = document.getElementById('modalTitle');
        const summary = document.getElementById('optionSummary');
        const premiumSummary = document.getElementById('premiumSummary');
        
        if (title) title.textContent = `${action.charAt(0).toUpperCase() + action.slice(1)} ${type.charAt(0).toUpperCase() + type.slice(1)} Option`;
        if (summary) summary.textContent = `${this.state.currentSymbol} $${strike} ${type.toUpperCase()}`;
        if (premiumSummary) premiumSummary.textContent = `$${premium}`;
        
        // Reset form
        const quantityInput = document.getElementById('quantity');
        if (quantityInput) quantityInput.value = '1';
        
        // Update costs
        this.updateOrderCost();
        
        this.showModal('orderModal');
    },
    
    updateOrderCost: function() {
        const quantity = parseInt(document.getElementById('quantity')?.value) || 1;
        const premium = parseFloat(document.getElementById('premiumSummary')?.textContent.replace('$', '')) || 0;
        const orderType = document.getElementById('orderType')?.value || 'market';
        
        let price = premium;
        if (orderType === 'limit') {
            price = parseFloat(document.getElementById('limitPrice')?.value) || premium;
        }
        
        const totalCost = quantity * price * 100; // Options are per 100 shares
        const commission = quantity * this.config.commission;
        const netCost = totalCost + commission;
        
        // Update displays
        const elements = {
            'totalCost': totalCost.toFixed(2),
            'maxLoss': totalCost.toFixed(2),
            'estimatedCost': netCost.toFixed(2)
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = '$' + value;
        });
    },
    
    // Navigation and UI
    toggleMode: function() {
        const currentPage = window.location.pathname;
        
        if (currentPage.includes('mobile-beginner')) {
            window.location.href = 'mobile-advanced.html';
        } else if (currentPage.includes('mobile-advanced')) {
            window.location.href = 'mobile-beginner.html';
        }
    },
    
    toggleAutoRefresh: function(e) {
        const toggle = e.target;
        const isActive = toggle.classList.contains('active');
        
        if (isActive) {
            toggle.classList.remove('active');
            this.stopPriceUpdates();
        } else {
            toggle.classList.add('active');
            this.startPriceUpdates();
        }
    },
    
    switchMobileTab: function(tab) {
        // Update active states
        document.querySelectorAll('.nav-tab').forEach(t => {
            t.classList.remove('active');
        });
        
        document.querySelector(`[data-tab="${tab}"]`)?.classList.add('active');
        
        // In a real app, this would switch content sections
        console.log('Switched to tab:', tab);
    },
    
    updateBreadcrumbs: function() {
        const path = window.location.pathname;
        const breadcrumb = document.getElementById('breadcrumb');
        
        if (!breadcrumb) return;
        
        const pathMap = {
            '/': 'Home',
            'mobile-beginner.html': 'Mobile › Beginner',
            'mobile-advanced.html': 'Mobile › Advanced',
            'desktop-table.html': 'Desktop › Option Chain',
            'filter-panel.html': 'Desktop › Filters',
            'bulk-orders.html': 'Desktop › Bulk Orders',
            'multi-expiry.html': 'Analysis › Multi-Expiry',
            'order-entry.html': 'Demo › Order Entry'
        };
        
        const currentPath = Object.keys(pathMap).find(key => path.includes(key)) || '/';
        breadcrumb.textContent = pathMap[currentPath];
    },
    
    // Keyboard Shortcuts
    handleKeyboardShortcuts: function(e) {
        // Only handle shortcuts when not in input fields
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        const shortcuts = {
            'KeyB': () => this.quickBuyAction(),
            'KeyS': () => this.quickSellAction(),
            'KeyF': () => this.focusSearch(),
            'KeyR': () => this.refreshData(),
            'KeyH': () => this.showHelp(),
            'Escape': () => this.closeAllModals()
        };
        
        if (e.ctrlKey || e.metaKey) {
            const handler = shortcuts[e.code];
            if (handler) {
                e.preventDefault();
                handler();
            }
        }
    },
    
    quickBuyAction: function() {
        // Find the first visible option and trigger buy
        const firstOption = document.querySelector('.option-card:not([style*="none"]), .option-row:not([style*="none"])');
        if (firstOption) {
            const strike = firstOption.dataset.strike || '150';
            const type = firstOption.dataset.type || 'call';
            this.openOrderModal(type, strike, 3.25, 'buy');
        }
    },
    
    quickSellAction: function() {
        // Find the first visible option and trigger sell
        const firstOption = document.querySelector('.option-card:not([style*="none"]), .option-row:not([style*="none"])');
        if (firstOption) {
            const strike = firstOption.dataset.strike || '150';
            const type = firstOption.dataset.type || 'call';
            this.openOrderModal(type, strike, 3.25, 'sell');
        }
    },
    
    focusSearch: function() {
        const searchInput = document.getElementById('stockSearch');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    },
    
    refreshData: function() {
        this.updatePrices();
        this.showNotification('Data refreshed', 'success');
    },
    
    closeAllModals: function() {
        document.querySelectorAll('.modal-overlay.show').forEach(modal => {
            this.closeModal(modal);
        });
    },
    
    // Utility Functions
    showHelp: function() {
        const helpModal = document.getElementById('helpModal');
        if (helpModal) {
            this.showModal('helpModal');
        } else {
            // Generic help alert if no modal
            alert('Keyboard Shortcuts:\n\nB - Quick Buy\nS - Quick Sell\nF - Focus Search\nR - Refresh Data\nH - Show Help\nEsc - Close Modals\n\nMobile: Swipe left on cards for quick actions\nDesktop: Right-click for context menus');
        }
    },
    
    showNotification: function(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background-color: ${type === 'success' ? 'var(--success-color)' : type === 'error' ? 'var(--danger-color)' : 'var(--primary-color)'};
            color: white;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-lg);
            z-index: 9999;
            transform: translateX(100%);
            transition: transform var(--transition-normal);
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Auto-remove
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, duration);
    },
    
    handleResize: function() {
        // Handle responsive changes
        const isMobile = window.innerWidth < 768;
        
        // Show/hide mobile navigation
        const mobileNav = document.getElementById('mobileNav');
        if (mobileNav) {
            mobileNav.style.display = isMobile ? 'flex' : 'none';
        }
        
        // Adjust table containers for mobile
        if (isMobile) {
            document.querySelectorAll('.table-container').forEach(container => {
                container.style.overflowX = 'auto';
            });
        }
    },
    
    handleQuantityChange: function(e) {
        const btn = e.target;
        const isIncrement = btn.textContent === '+';
        const input = btn.parentElement.querySelector('input[type="number"], .quantity-input');
        
        if (input) {
            const currentValue = parseInt(input.value) || 1;
            const newValue = isIncrement ? 
                Math.min(100, currentValue + 1) : 
                Math.max(1, currentValue - 1);
            
            input.value = newValue;
            
            // Trigger change event
            input.dispatchEvent(new Event('change'));
        }
    },
    
    handleOrderTypeChange: function(e) {
        const orderType = e.target.value;
        const limitGroup = document.getElementById('limitPriceGroup') || document.getElementById('netLimitGroup');
        
        if (limitGroup) {
            if (orderType === 'limit' || orderType === 'individual') {
                limitGroup.classList.remove('d-none');
            } else {
                limitGroup.classList.add('d-none');
            }
        }
        
        this.updateOrderCost();
    },
    
    handleNavigation: function(e) {
        const target = e.target;
        const href = target.getAttribute('href');
        
        if (href && !href.startsWith('#')) {
            // Add loading state
            target.style.opacity = '0.6';
            target.style.pointerEvents = 'none';
            
            // Reset after navigation
            setTimeout(() => {
                target.style.opacity = '1';
                target.style.pointerEvents = 'auto';
            }, 1000);
        }
    },
    
    refreshOptionData: function() {
        // Simulate data refresh for new symbol
        this.updatePrices();
        this.showNotification(`Updated data for ${this.state.currentSymbol}`, 'success');
    },
    
    // Accessibility helpers
    announceToScreenReader: function(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }
};

// Global functions for HTML onclick handlers
window.openOrderModal = function(type, strike, premium, action = 'buy') {
    OptionTradeApp.openOrderModal(type, strike, premium, action);
};

window.adjustQuantity = function(change) {
    const quantityInput = document.getElementById('quantity');
    if (quantityInput) {
        const currentValue = parseInt(quantityInput.value) || 1;
        const newValue = Math.max(1, Math.min(100, currentValue + change));
        quantityInput.value = newValue;
        OptionTradeApp.updateOrderCost();
    }
};

window.showOptionDetails = function(type, strike) {
    // This would show detailed option information
    console.log('Showing details for', type, strike);
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    OptionTradeApp.init();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        OptionTradeApp.stopPriceUpdates();
    } else {
        if (OptionTradeApp.config.enableRealTimeUpdates) {
            OptionTradeApp.startPriceUpdates();
        }
    }
});

// Handle beforeunload to clean up
window.addEventListener('beforeunload', function() {
    OptionTradeApp.stopPriceUpdates();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OptionTradeApp;
}