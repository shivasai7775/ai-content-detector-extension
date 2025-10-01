// Content Script
// Analyzes webpage content for AI-generated text detection

class ContentAnalyzer {
    constructor() {
        this.setupMessageListener();
        console.log('AI Content Detector content script loaded');
    }

    setupMessageListener() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'analyzePage') {
                this.analyzePage()
                    .then(results => {
                        sendResponse({ success: true, data: results });
                    })
                    .catch(error => {
                        console.error('Analysis error:', error);
                        sendResponse({ success: false, error: error.message });
                    });
                return true; // Indicates async response
            }
        });
    }

    async analyzePage() {
        console.log('Starting page analysis...');

        // Extract text content from the page
        const textContent = this.extractTextContent();
        
        // Analyze the content
        const analysis = this.performAnalysis(textContent);
        
        console.log('Analysis complete:', analysis);
        return analysis;
    }

    extractTextContent() {
        // Get all visible text from the page
        const elements = document.querySelectorAll('p, article, section, div, span, h1, h2, h3, h4, h5, h6, li');
        let text = '';

        elements.forEach(element => {
            // Skip hidden elements
            if (this.isElementVisible(element)) {
                const elementText = element.textContent.trim();
                if (elementText && elementText.length > 20) { // Minimum content length
                    text += elementText + ' ';
                }
            }
        });

        return text.trim();
    }

    isElementVisible(element) {
        const style = window.getComputedStyle(element);
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               style.opacity !== '0' &&
               element.offsetWidth > 0 &&
               element.offsetHeight > 0;
    }

    performAnalysis(text) {
        if (!text || text.length === 0) {
            return {
                aiContentPercent: 0,
                humanContentPercent: 100,
                confidence: 'N/A',
                wordsAnalyzed: 0
            };
        }

        // Count words
        const words = text.split(/\s+/).filter(word => word.length > 0);
        const wordCount = words.length;

        // Perform heuristic analysis (in production, this would use ML models)
        const aiScore = this.calculateAIScore(text, words);
        const aiPercent = Math.round(aiScore * 100);
        const humanPercent = 100 - aiPercent;
        
        // Calculate confidence based on text length and patterns
        const confidence = this.calculateConfidence(wordCount, aiScore);

        return {
            aiContentPercent: aiPercent,
            humanContentPercent: humanPercent,
            confidence: confidence,
            wordsAnalyzed: wordCount
        };
    }

    calculateAIScore(text, words) {
        let score = 0;
        let indicators = 0;

        // Indicator 1: Repetitive sentence structure (AI tends to be more uniform)
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
        if (sentences.length > 3) {
            const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length;
            const sentenceLengthVariance = this.calculateVariance(sentences.map(s => s.split(/\s+/).length));
            
            if (sentenceLengthVariance < 20) {
                score += 0.15; // Low variance indicates potential AI
            }
            indicators++;
        }

        // Indicator 2: Common AI phrases and patterns
        const aiPhrases = [
            'it is important to note',
            'it is worth mentioning',
            'in conclusion',
            'to summarize',
            'overall',
            'furthermore',
            'moreover',
            'additionally',
            'in addition to',
            'as a result',
            'consequently'
        ];

        const textLower = text.toLowerCase();
        let phraseCount = 0;
        aiPhrases.forEach(phrase => {
            if (textLower.includes(phrase)) {
                phraseCount++;
            }
        });

        if (phraseCount > 2) {
            score += Math.min(phraseCount * 0.05, 0.2);
        }
        indicators++;

        // Indicator 3: Formal language and lack of contractions
        const contractions = text.match(/\b\w+'\w+\b/g) || [];
        const contractionRatio = contractions.length / words.length;
        
        if (contractionRatio < 0.01 && words.length > 100) {
            score += 0.1; // Very few contractions suggests formal AI text
        }
        indicators++;

        // Indicator 4: Vocabulary complexity and diversity
        const uniqueWords = new Set(words.map(w => w.toLowerCase()));
        const vocabularyDiversity = uniqueWords.size / words.length;
        
        if (vocabularyDiversity > 0.6 && vocabularyDiversity < 0.8) {
            score += 0.15; // AI tends to have moderate vocabulary diversity
        }
        indicators++;

        // Indicator 5: Paragraph structure uniformity
        const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 50);
        if (paragraphs.length > 2) {
            const avgParaLength = paragraphs.reduce((sum, p) => sum + p.length, 0) / paragraphs.length;
            const paraLengthVariance = this.calculateVariance(paragraphs.map(p => p.length));
            const relativeVariance = paraLengthVariance / avgParaLength;
            
            if (relativeVariance < 0.3) {
                score += 0.1;
            }
            indicators++;
        }

        // Normalize score to 0-1 range
        const normalizedScore = Math.min(Math.max(score, 0), 1);
        
        return normalizedScore;
    }

    calculateVariance(values) {
        if (values.length === 0) return 0;
        
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
        const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
        
        return variance;
    }

    calculateConfidence(wordCount, aiScore) {
        // Confidence is higher with more text and clearer indicators
        if (wordCount < 50) return 'Low';
        if (wordCount < 200) return 'Medium';
        
        // Higher confidence if score is clearly high or low
        if (aiScore > 0.7 || aiScore < 0.3) {
            return 'High';
        }
        
        return 'Medium';
    }
}

// Initialize content analyzer
const contentAnalyzer = new ContentAnalyzer();
