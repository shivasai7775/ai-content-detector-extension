// Background Service Worker
// Manages extension state, storage, and communication between components

class BackgroundService {
    constructor() {
        this.initializeExtension();
        this.setupMessageListeners();
        this.setupStorageListeners();
    }

    initializeExtension() {
        console.log('AI Content Detector Extension initialized');
        
        // Initialize storage with default values if not present
        chrome.storage.local.get(['detectionData', 'settings'], (result) => {
            if (!result.detectionData) {
                const defaultData = {
                    aiContentPercent: 0,
                    humanContentPercent: 100,
                    confidence: 'N/A',
                    wordsAnalyzed: 0,
                    riskLevel: 'low',
                    riskScore: 10,
                    lastScan: null
                };
                chrome.storage.local.set({ detectionData: defaultData });
            }

            if (!result.settings) {
                const defaultSettings = {
                    detectionSensitivity: 'medium',
                    notificationsEnabled: true,
                    autoScan: false,
                    theme: 'light'
                };
                chrome.storage.local.set({ settings: defaultSettings });
            }
        });
    }

    setupMessageListeners() {
        // Listen for messages from popup and content scripts
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            console.log('Message received:', request);

            switch (request.action) {
                case 'getDetectionData':
                    this.handleGetDetectionData(sendResponse);
                    return true; // Indicates async response

                case 'updateDetectionData':
                    this.handleUpdateDetectionData(request.data, sendResponse);
                    return true;

                case 'addSecurityAlert':
                    this.handleAddSecurityAlert(request.alert, sendResponse);
                    return true;

                case 'getSettings':
                    this.handleGetSettings(sendResponse);
                    return true;

                case 'updateSettings':
                    this.handleUpdateSettings(request.settings, sendResponse);
                    return true;

                case 'clearData':
                    this.handleClearData(sendResponse);
                    return true;

                default:
                    console.warn('Unknown action:', request.action);
                    sendResponse({ success: false, error: 'Unknown action' });
                    return false;
            }
        });
    }

    setupStorageListeners() {
        // Listen for storage changes
        chrome.storage.onChanged.addListener((changes, areaName) => {
            console.log('Storage changed:', changes, 'in area:', areaName);
            
            // Broadcast changes to all open popups
            if (changes.detectionData) {
                this.notifyPopups({
                    type: 'dataUpdated',
                    data: changes.detectionData.newValue
                });
            }
        });
    }

    handleGetDetectionData(sendResponse) {
        chrome.storage.local.get(['detectionData', 'securityAlerts', 'blockchainData'], (result) => {
            sendResponse({
                success: true,
                data: {
                    detectionData: result.detectionData || this.getDefaultDetectionData(),
                    securityAlerts: result.securityAlerts || [],
                    blockchainData: result.blockchainData || this.getDefaultBlockchainData()
                }
            });
        });
    }

    handleUpdateDetectionData(data, sendResponse) {
        chrome.storage.local.set({ detectionData: data }, () => {
            if (chrome.runtime.lastError) {
                sendResponse({ success: false, error: chrome.runtime.lastError.message });
            } else {
                sendResponse({ success: true });
                this.checkAndNotify(data);
            }
        });
    }

    handleAddSecurityAlert(alert, sendResponse) {
        chrome.storage.local.get(['securityAlerts'], (result) => {
            const alerts = result.securityAlerts || [];
            alerts.unshift(alert); // Add to beginning
            
            // Keep only last 10 alerts
            if (alerts.length > 10) {
                alerts.splice(10);
            }

            chrome.storage.local.set({ securityAlerts: alerts }, () => {
                if (chrome.runtime.lastError) {
                    sendResponse({ success: false, error: chrome.runtime.lastError.message });
                } else {
                    sendResponse({ success: true });
                }
            });
        });
    }

    handleGetSettings(sendResponse) {
        chrome.storage.local.get(['settings'], (result) => {
            sendResponse({
                success: true,
                settings: result.settings || this.getDefaultSettings()
            });
        });
    }

    handleUpdateSettings(settings, sendResponse) {
        chrome.storage.local.set({ settings }, () => {
            if (chrome.runtime.lastError) {
                sendResponse({ success: false, error: chrome.runtime.lastError.message });
            } else {
                sendResponse({ success: true });
            }
        });
    }

    handleClearData(sendResponse) {
        chrome.storage.local.clear(() => {
            if (chrome.runtime.lastError) {
                sendResponse({ success: false, error: chrome.runtime.lastError.message });
            } else {
                this.initializeExtension(); // Reinitialize with defaults
                sendResponse({ success: true });
            }
        });
    }

    checkAndNotify(data) {
        chrome.storage.local.get(['settings'], (result) => {
            const settings = result.settings || this.getDefaultSettings();
            
            if (settings.notificationsEnabled) {
                // Show notification for high risk content
                if (data.riskLevel === 'high') {
                    this.showNotification(
                        'High AI Content Detected',
                        `${data.aiContentPercent}% of the content appears to be AI-generated`,
                        'warning'
                    );
                }
            }
        });
    }

    showNotification(title, message, type) {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'images/icon48.png',
            title: title,
            message: message,
            priority: type === 'warning' ? 2 : 1
        });
    }

    notifyPopups(message) {
        // Send message to all extension views (popups)
        chrome.runtime.sendMessage(message).catch(() => {
            // Ignore errors if no popup is open
        });
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

    getDefaultSettings() {
        return {
            detectionSensitivity: 'medium',
            notificationsEnabled: true,
            autoScan: false,
            theme: 'light'
        };
    }
}

// Initialize background service
const backgroundService = new BackgroundService();

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
    console.log('Extension icon clicked for tab:', tab.id);
});
