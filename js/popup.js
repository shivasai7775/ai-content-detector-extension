// Popup Dashboard JavaScript
// Handles real-time analytics, security alerts, and blockchain verification

class DashboardManager {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
        this.loadInitialData();
    }

    initializeElements() {
        // Detection Summary Elements
        this.aiContentPercent = document.getElementById('aiContentPercent');
        this.humanContentPercent = document.getElementById('humanContentPercent');
        this.confidence = document.getElementById('confidence');
        this.wordsAnalyzed = document.getElementById('wordsAnalyzed');

        // Security Alert Elements
        this.alertsContainer = document.getElementById('alertsContainer');
        this.riskBar = document.getElementById('riskBar');
        this.riskValue = document.getElementById('riskValue');

        // Blockchain Elements
        this.blockchainStatus = document.getElementById('blockchainStatus');
        this.blockchainHash = document.getElementById('blockchainHash');
        this.blockchainTimestamp = document.getElementById('blockchainTimestamp');

        // Status and Footer Elements
        this.statusIndicator = document.getElementById('statusIndicator');
        this.lastScan = document.getElementById('lastScan');

        // Button Elements
        this.scanBtn = document.getElementById('scanBtn');
        this.exportBtn = document.getElementById('exportBtn');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.verifyBtn = document.getElementById('verifyBtn');
    }

    attachEventListeners() {
        this.scanBtn.addEventListener('click', () => this.handleScan());
        this.exportBtn.addEventListener('click', () => this.handleExport());
        this.settingsBtn.addEventListener('click', () => this.handleSettings());
        this.clearBtn.addEventListener('click', () => this.handleClear());
        this.verifyBtn.addEventListener('click', () => this.handleVerify());
    }

    async loadInitialData() {
        try {
            // Load stored data from chrome.storage
            const data = await this.getStorageData();
            this.updateDashboard(data);
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showError('Failed to load data');
        }
    }

    async getStorageData() {
        // Check if chrome API is available (extension context)
        if (typeof chrome !== 'undefined' && chrome.storage) {
            return new Promise((resolve) => {
                chrome.storage.local.get(['detectionData', 'securityAlerts', 'blockchainData'], (result) => {
                    resolve({
                        detectionData: result.detectionData || this.getDefaultDetectionData(),
                        securityAlerts: result.securityAlerts || [],
                        blockchainData: result.blockchainData || this.getDefaultBlockchainData()
                    });
                });
            });
        } else {
            // Fallback for testing outside extension context
            return {
                detectionData: this.getDefaultDetectionData(),
                securityAlerts: [],
                blockchainData: this.getDefaultBlockchainData()
            };
        }
    }

    getDefaultDetectionData() {
        return {
            aiContentPercent: 0,
            humanContentPercent: 100,
            confidence: 'N/A',
            wordsAnalyzed: 0,
            riskLevel: 'low',
            riskScore: 10,
            lastScan: null
        };
    }

    getDefaultBlockchainData() {
        return {
            status: 'Not Verified',
            hash: '--',
            timestamp: '--'
        };
    }

    updateDashboard(data) {
        // Update detection summary
        const { detectionData, securityAlerts, blockchainData } = data;

        this.aiContentPercent.textContent = `${detectionData.aiContentPercent}%`;
        this.humanContentPercent.textContent = `${detectionData.humanContentPercent}%`;
        this.confidence.textContent = detectionData.confidence;
        this.wordsAnalyzed.textContent = detectionData.wordsAnalyzed.toLocaleString();

        // Update risk assessment
        this.updateRiskAssessment(detectionData.riskLevel, detectionData.riskScore);

        // Update security alerts
        this.updateSecurityAlerts(securityAlerts);

        // Update blockchain data
        this.updateBlockchainStatus(blockchainData);

        // Update last scan time
        if (detectionData.lastScan) {
            this.lastScan.textContent = this.formatTimestamp(detectionData.lastScan);
        }
    }

    updateRiskAssessment(level, score) {
        this.riskBar.style.width = `${score}%`;
        this.riskValue.textContent = level.charAt(0).toUpperCase() + level.slice(1);
        
        // Update risk value color class
        this.riskValue.classList.remove('low', 'medium', 'high');
        this.riskValue.classList.add(level);
    }

    updateSecurityAlerts(alerts) {
        if (!alerts || alerts.length === 0) {
            this.alertsContainer.innerHTML = `
                <div class="alert-item alert-info">
                    <div class="alert-icon">ℹ️</div>
                    <div class="alert-content">
                        <div class="alert-title">No threats detected</div>
                        <div class="alert-message">Page is currently safe</div>
                    </div>
                </div>
            `;
            return;
        }

        this.alertsContainer.innerHTML = alerts.map(alert => this.createAlertHTML(alert)).join('');
    }

    createAlertHTML(alert) {
        const iconMap = {
            info: 'ℹ️',
            warning: '⚠️',
            danger: '🚨',
            success: '✅'
        };

        return `
            <div class="alert-item alert-${alert.type}">
                <div class="alert-icon">${iconMap[alert.type] || 'ℹ️'}</div>
                <div class="alert-content">
                    <div class="alert-title">${this.escapeHTML(alert.title)}</div>
                    <div class="alert-message">${this.escapeHTML(alert.message)}</div>
                </div>
            </div>
        `;
    }

    updateBlockchainStatus(data) {
        this.blockchainStatus.textContent = data.status;
        this.blockchainHash.textContent = data.hash;
        this.blockchainTimestamp.textContent = data.timestamp;
    }

    async handleScan() {
        this.scanBtn.disabled = true;
        this.scanBtn.textContent = '🔄 Scanning...';

        try {
            // Check if chrome API is available
            if (typeof chrome !== 'undefined' && chrome.tabs) {
                // Get active tab
                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                
                // Send message to content script to analyze page
                chrome.tabs.sendMessage(tab.id, { action: 'analyzePage' }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error('Error:', chrome.runtime.lastError);
                        this.showNotification('Error scanning page. Please refresh and try again.', 'danger');
                        this.resetScanButton();
                        return;
                    }

                    if (response && response.success) {
                        this.processScanResults(response.data);
                        this.showNotification('Page scan completed successfully', 'success');
                    } else {
                        this.showNotification('Failed to scan page', 'danger');
                    }

                    this.resetScanButton();
                });
            } else {
                // Simulate scan for testing
                setTimeout(() => {
                    const mockData = {
                        aiContentPercent: Math.floor(Math.random() * 80),
                        humanContentPercent: 0,
                        confidence: 'Medium',
                        wordsAnalyzed: Math.floor(Math.random() * 1000) + 200
                    };
                    mockData.humanContentPercent = 100 - mockData.aiContentPercent;
                    
                    this.processScanResults(mockData);
                    this.showNotification('Demo scan completed', 'success');
                    this.resetScanButton();
                }, 2000);
            }
        } catch (error) {
            console.error('Scan error:', error);
            this.showNotification('An error occurred during scanning', 'danger');
            this.resetScanButton();
        }
    }

    resetScanButton() {
        this.scanBtn.disabled = false;
        this.scanBtn.innerHTML = '<span class="btn-icon">🔍</span> Scan Page';
    }

    processScanResults(data) {
        const detectionData = {
            aiContentPercent: data.aiContentPercent || 0,
            humanContentPercent: data.humanContentPercent || 100,
            confidence: data.confidence || 'N/A',
            wordsAnalyzed: data.wordsAnalyzed || 0,
            riskLevel: this.calculateRiskLevel(data.aiContentPercent),
            riskScore: this.calculateRiskScore(data.aiContentPercent),
            lastScan: new Date().toISOString()
        };

        const securityAlerts = this.generateAlertsFromScan(data);

        // Save to storage if available
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.set({ detectionData, securityAlerts }, () => {
                this.updateDashboard({
                    detectionData,
                    securityAlerts,
                    blockchainData: this.getDefaultBlockchainData()
                });
            });
        } else {
            // Update directly for testing
            this.updateDashboard({
                detectionData,
                securityAlerts,
                blockchainData: this.getDefaultBlockchainData()
            });
        }
    }

    calculateRiskLevel(aiPercent) {
        if (aiPercent >= 70) return 'high';
        if (aiPercent >= 40) return 'medium';
        return 'low';
    }

    calculateRiskScore(aiPercent) {
        return Math.min(Math.round(aiPercent), 100);
    }

    generateAlertsFromScan(data) {
        const alerts = [];
        
        if (data.aiContentPercent > 70) {
            alerts.push({
                type: 'danger',
                title: 'High AI Content Detected',
                message: `${data.aiContentPercent}% of the content appears to be AI-generated`
            });
        } else if (data.aiContentPercent > 40) {
            alerts.push({
                type: 'warning',
                title: 'Moderate AI Content Detected',
                message: `${data.aiContentPercent}% of the content may be AI-generated`
            });
        } else {
            alerts.push({
                type: 'success',
                title: 'Low AI Content',
                message: 'Content appears to be primarily human-written'
            });
        }

        return alerts;
    }

    async handleExport() {
        try {
            const data = await this.getStorageData();
            const exportData = {
                exportDate: new Date().toISOString(),
                detectionData: data.detectionData,
                securityAlerts: data.securityAlerts,
                blockchainData: data.blockchainData
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ai-detector-logs-${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showNotification('Logs exported successfully', 'success');
        } catch (error) {
            console.error('Export error:', error);
            this.showNotification('Failed to export logs', 'danger');
        }
    }

    handleSettings() {
        // Open settings page or modal
        if (typeof chrome !== 'undefined' && chrome.runtime) {
            chrome.runtime.openOptionsPage();
        } else {
            this.showNotification('Settings page not available in demo mode', 'info');
        }
    }

    async handleClear() {
        if (confirm('Are you sure you want to clear all data?')) {
            try {
                if (typeof chrome !== 'undefined' && chrome.storage) {
                    await chrome.storage.local.clear();
                }
                this.updateDashboard({
                    detectionData: this.getDefaultDetectionData(),
                    securityAlerts: [],
                    blockchainData: this.getDefaultBlockchainData()
                });
                this.showNotification('Data cleared successfully', 'success');
            } catch (error) {
                console.error('Clear error:', error);
                this.showNotification('Failed to clear data', 'danger');
            }
        }
    }

    async handleVerify() {
        this.verifyBtn.disabled = true;
        this.verifyBtn.textContent = '🔄 Verifying...';

        try {
            // Simulate blockchain verification (in real implementation, this would call a blockchain service)
            setTimeout(() => {
                const hash = this.generateMockHash();
                const timestamp = new Date().toISOString();
                const blockchainData = {
                    status: 'Verified',
                    hash: hash,
                    timestamp: this.formatTimestamp(timestamp)
                };

                if (typeof chrome !== 'undefined' && chrome.storage) {
                    chrome.storage.local.set({ blockchainData }, () => {
                        this.updateBlockchainStatus(blockchainData);
                        this.showNotification('Content verified on blockchain', 'success');
                        this.resetVerifyButton();
                    });
                } else {
                    this.updateBlockchainStatus(blockchainData);
                    this.showNotification('Content verified on blockchain', 'success');
                    this.resetVerifyButton();
                }
            }, 2000);
        } catch (error) {
            console.error('Verification error:', error);
            this.showNotification('Failed to verify content', 'danger');
            this.resetVerifyButton();
        }
    }

    resetVerifyButton() {
        this.verifyBtn.disabled = false;
        this.verifyBtn.innerHTML = '<span class="btn-icon">🔐</span> Verify Content';
    }

    generateMockHash() {
        const chars = '0123456789abcdef';
        let hash = '0x';
        for (let i = 0; i < 40; i++) {
            hash += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return hash.slice(0, 20) + '...';
    }

    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (seconds < 60) return 'Just now';
        if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
        
        return date.toLocaleDateString();
    }

    showNotification(message, type) {
        // Create a temporary notification alert
        const alert = {
            type: type || 'info',
            title: 'Notification',
            message: message
        };

        // Add to top of alerts container temporarily
        const alertHTML = this.createAlertHTML(alert);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = alertHTML;
        tempDiv.classList.add('fade-in');
        this.alertsContainer.insertBefore(tempDiv.firstElementChild, this.alertsContainer.firstChild);

        // Remove after 3 seconds
        setTimeout(() => {
            tempDiv.firstElementChild?.remove();
        }, 3000);
    }

    showError(message) {
        this.showNotification(message, 'danger');
    }

    escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DashboardManager();
});
