// voice-assistant.js - Voice control for CropDoc

(function() {
    'use strict';

    let recognition = null;
    let isListening = false;
    let commandHistory = [];

    function init() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.warn('Speech recognition not supported');
            return false;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = handleResult;
        recognition.onerror = handleError;
        recognition.onend = handleEnd;

        setupUI();
        return true;
    }

    function setupUI() {
        const btn = document.getElementById('voiceBtn');
        if (btn) {
            btn.addEventListener('click', toggleListening);
        }
    }

    function toggleListening() {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    }

    function startListening() {
        if (!recognition) return;
        recognition.start();
        isListening = true;
        updateUIState('listening');
        speak('Listening for commands');
    }

    function stopListening() {
        if (recognition) {
            recognition.stop();
        }
        isListening = false;
        updateUIState('idle');
    }

    function handleResult(event) {
        const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('');

        if (event.results[0].isFinal) {
            processCommand(transcript);
        }

        // Update visual feedback
        const feedbackEl = document.getElementById('voiceFeedback');
        if (feedbackEl) {
            feedbackEl.textContent = transcript;
        }
    }

    function handleError(event) {
        console.warn('Voice error:', event.error);
        if (event.error === 'not-allowed') {
            speak('Please allow microphone access');
        }
        stopListening();
    }

    function handleEnd() {
        isListening = false;
        updateUIState('idle');
    }

    function processCommand(transcript) {
        const lower = transcript.toLowerCase();
        commandHistory.push({ command: transcript, timestamp: new Date().toISOString() });

        // Commands mapping
        const commands = {
            'scan': () => {
                if (window.ScannerFull) {
                    window.ScannerFull.takeSnapshot();
                    speak('Scanning now');
                }
            },
            'record': () => {
                if (window.ScannerFull) {
                    window.ScannerFull.toggleRecording();
                    speak('Recording started');
                }
            },
            'root scan': () => {
                if (window.ScannerFull) {
                    window.ScannerFull.performRootScan();
                    speak('Root scan initiated');
                }
            },
            'filter': () => {
                document.getElementById('filterBtn')?.click();
                speak('Filter panel toggled');
            },
            'gallery': () => {
                window.location.href = 'gallery.html';
            },
            'analytics': () => {
                window.location.href = 'analytics.html';
            },
            'reports': () => {
                window.location.href = 'reports.html';
            },
            'print': () => {
                if (window.ScannerFull) {
                    window.ScannerFull.printReport();
                }
            },
            'help': () => {
                speak('Available commands: scan, record, root scan, filter, gallery, analytics, reports, print, help');
            }
        };

        // Find matching command
        for (const [key, action] of Object.entries(commands)) {
            if (lower.includes(key)) {
                action();
                addToLog(`✅ Command: "${key}"`);
                return;
            }
        }

        // No match
        speak('Command not recognized. Say "help" for available commands.');
        addToLog(`❌ Unknown: "${transcript}"`);
    }

    function speak(text) {
        if (!('speechSynthesis' in window)) return;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        speechSynthesis.speak(utterance);
    }

    function updateUIState(state) {
        const dot = document.getElementById('voiceDot');
        const label = document.getElementById('voiceLabel');
        if (dot) {
            dot.className = 'voice-dot';
            if (state === 'listening') dot.classList.add('listening');
        }
        if (label) {
            label.textContent = state === 'listening' ? '🎤 Listening...' : '🎤 Tap to speak';
        }
    }

    function addToLog(message) {
        const log = document.getElementById('voiceLog');
        if (!log) return;
        const entry = document.createElement('div');
        entry.className = 'voice-log-entry';
        entry.textContent = `${new Date().toLocaleTimeString()} ${message}`;
        log.prepend(entry);
        if (log.children.length > 20) {
            log.removeChild(log.lastChild);
        }
    }

    // Expose VoiceAssistant
    window.VoiceAssistant = {
        init: init,
        start: startListening,
        stop: stopListening,
        toggle: toggleListening,
        speak: speak,
        getHistory: () => commandHistory
    };

    // Auto-init if voice button exists
    document.addEventListener('DOMContentLoaded', () => {
        if (document.getElementById('voiceBtn')) {
            init();
        }
    });

})();
