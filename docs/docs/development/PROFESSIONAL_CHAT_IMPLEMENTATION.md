<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🤖 AI LUKAS - ERP AI Assistant | Claude + RAG</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        :root {
            /* Enterprise Colors */
            --primary-blue: #1e40af;
            --primary-light: #3b82f6;
            --secondary-purple: #7c3aed;
            --accent-green: #059669;
            --accent-orange: #ea580c;
            --accent-red: #dc2626;
            
            /* Advanced Gradients */
            --gradient-primary: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #7c3aed 100%);
            --gradient-success: linear-gradient(135deg, #059669 0%, #10b981 100%);
            --gradient-warning: linear-gradient(135deg, #ea580c 0%, #f59e0b 100%);
            --gradient-glass: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
            
            /* Professional Neutrals */
            --bg-primary: #ffffff;
            --bg-secondary: #f8fafc;
            --bg-tertiary: #f1f5f9;
            --bg-dark: #0f172a;
            --bg-glass: rgba(255, 255, 255, 0.85);
            
            /* Text Colors */
            --text-primary: #1e293b;
            --text-secondary: #64748b;
            --text-light: #94a3b8;
            --text-white: #ffffff;
            
            /* Borders & Effects */
            --border-light: #e2e8f0;
            --border-medium: #cbd5e1;
            --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
            --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
            --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
            --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
            --shadow-glass: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
            
            /* Radius */
            --radius-sm: 8px;
            --radius-md: 12px;
            --radius-lg: 16px;
            --radius-xl: 20px;
            --radius-full: 9999px;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #6B73FF 100%);
            min-height: 100vh;
            padding: 20px;
            position: relative;
            overflow-x: hidden;
        }

        /* Animated Background */
        body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: 
                radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, rgba(120, 200, 255, 0.2) 0%, transparent 50%);
            animation: backgroundShift 20s ease-in-out infinite;
            z-index: -1;
        }

        /* Main Chat Container */
        .mega-chat-container {
            max-width: 1200px;
            margin: 0 auto;
            background: var(--bg-glass);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: var(--radius-xl);
            box-shadow: var(--shadow-glass);
            height: 85vh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            position: relative;
        }

        /* Ultra Advanced Header */
        .mega-header {
            background: var(--gradient-primary);
            color: var(--text-white);
            padding: 24px 32px;
            display: grid;
            grid-template-columns: auto 1fr auto;
            gap: 24px;
            align-items: center;
            position: relative;
            overflow: hidden;
        }

        .mega-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: var(--gradient-glass);
            backdrop-filter: blur(10px);
        }

        .mega-header > * {
            position: relative;
            z-index: 2;
        }

        .assistant-profile {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .mega-avatar {
            position: relative;
            width: 64px;
            height: 64px;
            background: var(--gradient-glass);
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: var(--radius-full);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            backdrop-filter: blur(20px);
            animation: avatarPulse 3s ease-in-out infinite;
        }

        .mega-avatar::after {
            content: '';
            position: absolute;
            bottom: 2px;
            right: 2px;
            width: 18px;
            height: 18px;
            background: var(--accent-green);
            border: 3px solid white;
            border-radius: var(--radius-full);
            animation: pulse 2s infinite;
        }

        .profile-info h1 {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 4px;
            background: linear-gradient(45deg, #ffffff, #e2e8f0);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .profile-status {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 14px;
            opacity: 0.9;
        }

        .tech-stack {
            display: flex;
            gap: 8px;
        }

        .tech-badge {
            background: rgba(255, 255, 255, 0.15);
            padding: 4px 10px;
            border-radius: var(--radius-sm);
            font-size: 11px;
            font-weight: 600;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        /* Real-time Metrics Dashboard */
        .metrics-dashboard {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 16px;
            text-align: center;
        }

        .metric-card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(15px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: var(--radius-md);
            padding: 16px 12px;
            transition: all 0.3s ease;
        }

        .metric-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .metric-value {
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 4px;
            color: var(--text-white);
        }

        .metric-label {
            font-size: 11px;
            opacity: 0.8;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        /* Advanced Control Panel */
        .control-panel {
            display: flex;
            gap: 12px;
            align-items: center;
        }

        .control-button {
            background: rgba(255, 255, 255, 0.15);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: white;
            padding: 10px 12px;
            border-radius: var(--radius-md);
            cursor: pointer;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
            font-size: 14px;
        }

        .control-button:hover {
            background: rgba(255, 255, 255, 0.25);
            transform: translateY(-1px);
        }

        .control-button.active {
            background: var(--accent-green);
            border-color: var(--accent-green);
        }

        /* Messages Area with Advanced Styling */
        .mega-messages-area {
            flex: 1;
            padding: 24px;
            overflow-y: auto;
            background: linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
            position: relative;
        }

        /* Custom Scrollbar */
        .mega-messages-area::-webkit-scrollbar {
            width: 8px;
        }

        .mega-messages-area::-webkit-scrollbar-track {
            background: transparent;
        }

        .mega-messages-area::-webkit-scrollbar-thumb {
            background: var(--border-medium);
            border-radius: var(--radius-full);
        }

        .mega-messages-area::-webkit-scrollbar-thumb:hover {
            background: var(--text-secondary);
        }

        /* Advanced Message Styling */
        .mega-message {
            margin-bottom: 24px;
            animation: messageSlideIn 0.5s ease-out;
        }

        /* User Message */
        .user-message {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 20px;
        }

        .user-bubble {
            background: var(--gradient-primary);
            color: var(--text-white);
            padding: 18px 24px;
            border-radius: 24px 24px 8px 24px;
            max-width: 70%;
            box-shadow: var(--shadow-lg);
            position: relative;
            backdrop-filter: blur(10px);
        }

        .user-bubble::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: var(--gradient-glass);
            border-radius: inherit;
            backdrop-filter: blur(5px);
        }

        .user-bubble > * {
            position: relative;
            z-index: 1;
        }

        .user-meta {
            margin-top: 8px;
            font-size: 12px;
            opacity: 0.8;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        /* AI Assistant Message */
        .ai-message {
            display: flex;
            gap: 16px;
            align-items: flex-start;
        }

        .ai-avatar {
            width: 48px;
            height: 48px;
            background: var(--gradient-primary);
            border-radius: var(--radius-full);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 20px;
            box-shadow: var(--shadow-md);
            flex-shrink: 0;
            position: relative;
        }

        .ai-avatar::after {
            content: '';
            position: absolute;
            bottom: -2px;
            right: -2px;
            width: 16px;
            height: 16px;
            background: var(--accent-green);
            border: 2px solid white;
            border-radius: var(--radius-full);
        }

        .ai-bubble {
            flex: 1;
            background: var(--bg-primary);
            border: 1px solid var(--border-light);
            border-radius: 24px 24px 24px 8px;
            padding: 24px;
            box-shadow: var(--shadow-lg);
            position: relative;
        }

        /* Message Header */
        .message-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
            padding-bottom: 12px;
            border-bottom: 1px solid var(--border-light);
        }

        .message-type {
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 600;
            color: var(--primary-blue);
            font-size: 14px;
        }

        .confidence-indicator {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .confidence-badge {
            padding: 6px 12px;
            border-radius: var(--radius-full);
            font-size: 12px;
            font-weight: 600;
            border: 1px solid;
        }

        .confidence-high {
            background: rgba(5, 150, 105, 0.1);
            color: var(--accent-green);
            border-color: var(--accent-green);
        }

        .confidence-medium {
            background: rgba(234, 88, 12, 0.1);
            color: var(--accent-orange);
            border-color: var(--accent-orange);
        }

        .confidence-low {
            background: rgba(220, 38, 38, 0.1);
            color: var(--accent-red);
            border-color: var(--accent-red);
        }

        .confidence-meter {
            width: 60px;
            height: 4px;
            background: var(--border-light);
            border-radius: var(--radius-full);
            overflow: hidden;
        }

        .confidence-fill {
            height: 100%;
            border-radius: var(--radius-full);
            transition: width 1s ease-out;
        }

        /* Structured Response Content */
        .structured-content h3 {
            color: var(--text-primary);
            margin-bottom: 16px;
            font-size: 18px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .response-section {
            margin: 20px 0;
            padding: 20px;
            background: var(--bg-secondary);
            border-radius: var(--radius-md);
            border-left: 4px solid var(--primary-blue);
            position: relative;
        }

        .response-section::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: var(--gradient-glass);
            border-radius: inherit;
            opacity: 0.5;
        }

        .response-section > * {
            position: relative;
            z-index: 1;
        }

        .section-title {
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 12px;
            font-size: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .step-list {
            list-style: none;
            padding: 0;
        }

        .step-item {
            padding: 8px 0;
            color: var(--text-secondary);
            position: relative;
            padding-left: 24px;
            line-height: 1.6;
        }

        .step-item::before {
            content: '▶';
            position: absolute;
            left: 0;
            color: var(--primary-blue);
            font-size: 12px;
            top: 8px;
        }

        /* Advanced Message Footer */
        .message-footer {
            margin-top: 20px;
            padding-top: 16px;
            border-top: 1px solid var(--border-light);
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 12px;
        }

        .sources-section {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
        }

        .sources-label {
            font-size: 12px;
            color: var(--text-secondary);
            font-weight: 600;
        }

        .source-tag {
            background: rgba(30, 64, 175, 0.1);
            color: var(--primary-blue);
            padding: 4px 10px;
            border-radius: var(--radius-full);
            font-size: 11px;
            font-weight: 500;
            border: 1px solid rgba(30, 64, 175, 0.2);
            transition: all 0.2s ease;
        }

        .source-tag:hover {
            background: rgba(30, 64, 175, 0.2);
            transform: translateY(-1px);
        }

        .action-buttons {
            display: flex;
            gap: 8px;
        }

        .action-btn {
            background: transparent;
            border: 1px solid var(--border-light);
            padding: 8px 10px;
            border-radius: var(--radius-sm);
            cursor: pointer;
            transition: all 0.2s ease;
            color: var(--text-secondary);
            font-size: 12px;
        }

        .action-btn:hover {
            background: var(--bg-secondary);
            border-color: var(--primary-blue);
            color: var(--primary-blue);
            transform: translateY(-1px);
        }

        /* Ultimate Quick Actions Panel */
        .mega-quick-panel {
            background: var(--bg-primary);
            border-top: 1px solid var(--border-light);
            padding: 20px 24px;
        }

        .panel-header {
            display: flex;
            justify-content: between;
            align-items: center;
            margin-bottom: 16px;
        }

        .panel-title {
            font-size: 16px;
            font-weight: 600;
            color: var(--text-primary);
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .quick-actions-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 12px;
        }

        .quick-action-btn {
            background: var(--bg-secondary);
            border: 1px solid var(--border-light);
            padding: 16px 20px;
            border-radius: var(--radius-md);
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: left;
            display: flex;
            align-items: center;
            gap: 12px;
            position: relative;
            overflow: hidden;
        }

        .quick-action-btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: var(--gradient-primary);
            transition: left 0.3s ease;
            opacity: 0.1;
        }

        .quick-action-btn:hover::before {
            left: 0;
        }

        .quick-action-btn:hover {
            border-color: var(--primary-blue);
            transform: translateY(-2px);
            box-shadow: var(--shadow-lg);
        }

        .quick-action-btn.primary {
            background: var(--gradient-primary);
            color: white;
            border-color: var(--primary-blue);
        }

        .action-icon {
            font-size: 20px;
            width: 24px;
            text-align: center;
        }

        .action-content {
            flex: 1;
        }

        .action-title {
            font-weight: 600;
            margin-bottom: 2px;
            font-size: 14px;
        }

        .action-desc {
            font-size: 12px;
            opacity: 0.7;
        }

        /* AI Suggestions Panel */
        .ai-suggestions {
            margin-bottom: 16px;
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease;
        }

        .ai-suggestions.active {
            max-height: 200px;
        }

        .suggestions-header {
            font-size: 14px;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .suggestions-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }

        .suggestion-chip {
            background: var(--bg-secondary);
            border: 1px solid var(--border-light);
            padding: 8px 14px;
            border-radius: var(--radius-full);
            font-size: 13px;
            cursor: pointer;
            transition: all 0.2s ease;
            color: var(--text-secondary);
        }

        .suggestion-chip:hover {
            background: var(--primary-blue);
            color: white;
            border-color: var(--primary-blue);
            transform: translateY(-1px);
        }

        /* Ultimate Input Section */
        .mega-input-section {
            background: var(--bg-primary);
            border-top: 1px solid var(--border-light);
            padding: 24px;
        }

        .input-controls {
            display: flex;
            gap: 12px;
            margin-bottom: 16px;
            align-items: center;
        }

        .input-control-btn {
            background: var(--bg-secondary);
            border: 1px solid var(--border-light);
            padding: 12px;
            border-radius: var(--radius-md);
            cursor: pointer;
            transition: all 0.2s ease;
            color: var(--text-secondary);
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .input-control-btn:hover {
            background: var(--primary-blue);
            color: white;
            border-color: var(--primary-blue);
            transform: translateY(-1px);
        }

        .input-control-btn.active {
            background: var(--primary-blue);
            color: white;
            border-color: var(--primary-blue);
        }

        .input-wrapper {
            position: relative;
            display: flex;
            gap: 12px;
            align-items: flex-end;
        }

        .mega-input {
            flex: 1;
            background: var(--bg-secondary);
            border: 2px solid var(--border-light);
            border-radius: var(--radius-lg);
            padding: 16px 20px;
            font-size: 16px;
            font-family: inherit;
            resize: none;
            min-height: 60px;
            max-height: 120px;
            transition: all 0.3s ease;
            color: var(--text-primary);
        }

        .mega-input:focus {
            outline: none;
            border-color: var(--primary-blue);
            background: var(--bg-primary);
            box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.1);
        }

        .mega-input::placeholder {
            color: var(--text-light);
        }

        .mega-send-btn {
            background: var(--gradient-primary);
            border: none;
            padding: 16px 24px;
            border-radius: var(--radius-lg);
            color: white;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
            min-width: 120px;
            justify-content: center;
        }

        .mega-send-btn:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-lg);
        }

        .mega-send-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
        }

        /* Input Footer */
        .input-footer {
            margin-top: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            color: var(--text-light);
        }

        .mode-indicator {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .mode-badge {
            background: rgba(30, 64, 175, 0.1);
            color: var(--primary-blue);
            padding: 4px 8px;
            border-radius: var(--radius-sm);
            font-weight: 600;
            border: 1px solid rgba(30, 64, 175, 0.2);
        }

        .typing-indicator {
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--text-secondary);
        }

        .typing-dots {
            display: flex;
            gap: 2px;
        }

        .typing-dot {
            width: 4px;
            height: 4px;
            background: var(--text-secondary);
            border-radius: var(--radius-full);
            animation: typingBounce 1.4s infinite;
        }

        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }

        /* Animations */
        @keyframes backgroundShift {
            0%, 100% { transform: translateX(0) translateY(0); }
            25% { transform: translateX(-20px) translateY(-10px); }
            50% { transform: translateX(20px) translateY(-20px); }
            75% { transform: translateX(-10px) translateY(10px); }
        }

        @keyframes avatarPulse {
            0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.3); }
            50% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(255, 255, 255, 0); }
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }

        @keyframes messageSlideIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes typingBounce {
            0%, 80%, 100% {
                transform: scale(0.8);
                opacity: 0.5;
            }
            40% {
                transform: scale(1);
                opacity: 1;
            }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
            body {
                padding: 10px;
            }

            .mega-chat-container {
                height: 95vh;
                border-radius: var(--radius-md);
            }

            .mega-header {
                padding: 16px 20px;
                grid-template-columns: 1fr;
                gap: 16px;
                text-align: center;
            }

            .metrics-dashboard {
                grid-template-columns: repeat(2, 1fr);
            }

            .user-bubble,
            .ai-bubble {
                max-width: 90%;
            }

            .quick-actions-grid {
                grid-template-columns: 1fr;
            }

            .mega-input-section {
                padding: 16px 20px;
            }

            .input-wrapper {
                flex-direction: column;
                gap: 12px;
            }

            .mega-send-btn {
                width: 100%;
            }
        }

        @media (max-width: 480px) {
            .mega-header {
                padding: 12px 16px;
            }

            .mega-messages-area {
                padding: 16px;
            }

            .ai-message {
                gap: 12px;
            }

            .ai-avatar {
                width: 40px;
                height: 40px;
                font-size: 16px;
            }

            .input-controls {
                justify-content: center;
                flex-wrap: wrap;
            }
        }

        /* Special Effects */
        .sparkle {
            position: relative;
        }

        .sparkle::after {
            content: '✨';
            position: absolute;
            top: -10px;
            right: -10px;
            font-size: 12px;
            animation: sparkle 2s infinite;
        }

        @keyframes sparkle {
            0%, 100% { opacity: 0; transform: scale(0); }
            50% { opacity: 1; transform: scale(1); }
        }

        /* Loading States */
        .loading {
            opacity: 0.7;
            pointer-events: none;
        }

        .loading::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 20px;
            height: 20px;
            margin: -10px 0 0 -10px;
            border: 2px solid var(--border-light);
            border-top-color: var(--primary-blue);
            border-radius: var(--radius-full);
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="mega-chat-container">
        <!-- Ultra Advanced Header -->
        <div class="mega-header">
            <div class="assistant-profile">
                <div class="mega-avatar">🤖</div>
                <div class="profile-info">
                    <h1>AI LUKAS - Asystent ERP</h1>
                    <div class="profile-status">
                        <span class="tech-stack">
                            <span class="tech-badge">Claude AI</span>
                            <span class="tech-badge">RAG v2.0</span>
                            <span class="tech-badge">Comarch XL</span>
                        </span>
                    </div>
                </div>
            </div>

            <!-- Real-time Metrics Dashboard -->
            <div class="metrics-dashboard">
                <div class="metric-card">
                    <div class="metric-value">94%</div>
                    <div class="metric-label">Pewność AI</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">6</div>
                    <div class="metric-label">Moduły KB</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">2.1s</div>
                    <div class="metric-label">Czas Odpowiedzi</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">Online</div>
                    <div class="metric-label">Status RAG</div>
                </div>
            </div>

            <!-- Advanced Control Panel -->
            <div class="control-panel">
                <button class="control-button active" title="Advanced RAG">
                    <i class="fas fa-brain"></i>
                </button>
                <button class="control-button" title="Export Chat">
                    <i class="fas fa-download"></i>
                </button>
                <button class="control-button" title="Settings">
                    <i class="fas fa-cog"></i>
                </button>
            </div>
        </div>

        <!-- Messages Area -->
        <div class="mega-messages-area" id="messagesArea">
            <!-- Welcome Message -->
            <div class="mega-message">
                <div class="ai-message">
                    <div class="ai-avatar">🎯</div>
                    <div class="ai-bubble">
                        <div class="message-header">
                            <div class="message-type">
                                <i class="fas fa-robot"></i>
                                Witaj w ERP AI Assistant!
                            </div>
                            <div class="confidence-indicator">
                                <div class="confidence-badge confidence-high">System Ready</div>
                            </div>
                        </div>
                        
                        <div class="structured-content">
                            <h3>🚀 Jestem Claude 3 Sonnet zintegrowany z zaawansowanym systemem RAG v2.0. Mogę pomóc Ci z:</h3>
                            
                            <div class="response-section">
                                <div class="section-title">🏢 Systemy ERP Comarch</div>
                                <ul class="step-list">
                                    <li>Konfiguracja modułów finansowych i CRM</li>
                                    <li>Planowanie i wdrażanie projektów ERP</li>
                                    <li>Integracje z systemami zewnętrznymi</li>
                                    <li>Optymalizacja procesów biznesowych</li>
                                </ul>
                            </div>

                            <div class="response-section">
                                <div class="section-title">🛠️ Analiza SQL i Baz Danych</div>
                                <ul class="step-list">
                                    <li>Pisanie i optymalizacja zapytań SQL</li>
                                    <li>Analiza struktury bazy danych ERP</li>
                                    <li>Raportowanie i business intelligence</li>
                                </ul>
                            </div>

                            <div class="response-section">
                                <div class="section-title">⚡ Zaawansowany RAG v2.0</div>
                                <ul class="step-list">
                                    <li>Hybrydowe wyszukiwanie (Semantic + BM25)</li>
                                    <li>Re-ranking wyników cross-encoder</li>
                                    <li>Multi-step reasoning dla złożonych pytań</li>
                                    <li>Kompresja kontekstu do 2048 tokenów</li>
                                </ul>
                            </div>
                        </div>

                        <div class="message-footer">
                            <div class="sources-section">
                                <span class="sources-label">📚 Baza wiedzy:</span>
                                <span class="source-tag">systemy_erp.md</span>
                                <span class="source-tag">comarch_config.pdf</span>
                                <span class="source-tag">sql_optymalizacja.md</span>
                            </div>
                            <div class="action-buttons">
                                <button class="action-btn" title="Rozpocznij Quick Setup">
                                    <i class="fas fa-rocket"></i> Quick Start
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Ultimate Quick Actions Panel -->
        <div class="mega-quick-panel">
            <div class="panel-header">
                <div class="panel-title">
                    <i class="fas fa-bolt"></i>
                    Szybkie Akcje ERP
                </div>
            </div>
            
            <div class="quick-actions-grid">
                <button class="quick-action-btn primary" onclick="quickAction('config')">
                    <div class="action-icon">⚙️</div>
                    <div class="action-content">
                        <div class="action-title">Konfiguracja Modułów</div>
                        <div class="action-desc">Setup CRM, Finance, HR</div>
                    </div>
                </button>

                <button class="quick-action-btn" onclick="quickAction('integration')">
                    <div class="action-icon">🔌</div>
                    <div class="action-content">
                        <div class="action-title">Sprawdź Integracje</div>
                        <div class="action-desc">API, Webhooks, Sync</div>
                    </div>
                </button>

                <button class="quick-action-btn" onclick="quickAction('reports')">
                    <div class="action-icon">📊</div>
                    <div class="action-content">
                        <div class="action-title">Wygeneruj Raport</div>
                        <div class="action-desc">SQL, Excel, PDF</div>
                    </div>
                </button>

                <button class="quick-action-btn" onclick="quickAction('troubleshoot')">
                    <div class="action-icon">🛠️</div>
                    <div class="action-content">
                        <div class="action-title">Rozwiąż Problem</div>
                        <div class="action-desc">Debug, Logs, Fix</div>
                    </div>
                </button>
            </div>
        </div>

        <!-- AI Suggestions Panel -->
        <div class="mega-input-section">
            <div class="ai-suggestions" id="aiSuggestions">
                <div class="suggestions-header">
                    <i class="fas fa-lightbulb"></i>
                    Smart Suggestions
                </div>
                <div class="suggestions-grid">
                    <div class="suggestion-chip" onclick="applySuggestion(this)">
                        💡 "Jak zintegrować CRM z e-commerce?"
                    </div>
                    <div class="suggestion-chip" onclick="applySuggestion(this)">
                        💡 "Konfiguracja automatycznych raportów"
                    </div>
                    <div class="suggestion-chip" onclick="applySuggestion(this)">
                        💡 "Backup danych przed aktualizacją"
                    </div>
                    <div class="suggestion-chip" onclick="applySuggestion(this)">
                        💡 "Optymalizacja wydajności SQL"
                    </div>
                </div>
            </div>

            <div class="input-controls">
                <button class="input-control-btn" title="Załącz plik" onclick="attachFile()">
                    <i class="fas fa-paperclip"></i>
                </button>
                <button class="input-control-btn" title="Wejście głosowe" onclick="toggleVoice()">
                    <i class="fas fa-microphone"></i>
                </button>
                <button class="input-control-btn active" title="Advanced RAG" onclick="toggleRAG()">
                    <i class="fas fa-brain"></i>
                </button>
                <button class="input-control-btn" title="Show Suggestions" onclick="toggleSuggestions()">
                    <i class="fas fa-lightbulb"></i>
                </button>
            </div>

            <div class="input-wrapper">
                <textarea 
                    id="messageInput" 
                    class="mega-input"
                    placeholder="💬 Zadaj pytanie o konfigurację ERP, integracje, SQL, analizę danych lub rozwiązywanie problemów..."
                    rows="3"
                    maxlength="4000"
                ></textarea>
                
                <button class="mega-send-btn" id="sendButton" onclick="sendMessage()">
                    <span>Wyślij</span>
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>

            <div class="input-footer">
                <div class="mode-indicator">
                    <span class="mode-badge sparkle">🧠 Advanced RAG</span>
                    <span>Claude-3 Sonnet + ChromaDB</span>
                </div>
                <div class="typing-indicator" id="typingIndicator" style="display: none;">
                    <span>AI LUKAS pisze</span>
                    <div class="typing-dots">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>
                <div id="charCounter">0/4000</div>
            </div>
        </div>
    </div>

    <script>
        // Global State
        let isAdvancedRAG = true;
        let isVoiceActive = false;
        let sessionId = 'erp_chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

        // Initialize
        document.addEventListener('DOMContentLoaded', function() {
            const messageInput = document.getElementById('messageInput');
            const charCounter = document.getElementById('charCounter');
            
            // Character counter
            messageInput.addEventListener('input', function() {
                const length = this.value.length;
                charCounter.textContent = `${length}/4000`;
                charCounter.style.color = length > 3800 ? '#dc2626' : length > 3500 ? '#ea580c' : '#64748b';
            });

            // Auto-resize textarea
            messageInput.addEventListener('input', function() {
                this.style.height = 'auto';
                this.style.height = Math.min(this.scrollHeight, 120) + 'px';
            });

            // Keyboard shortcuts
            messageInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });

            // Global shortcuts
            document.addEventListener('keydown', function(e) {
                if (e.ctrlKey || e.metaKey) {
                    switch(e.key) {
                        case 'k':
                            e.preventDefault();
                            messageInput.focus();
                            break;
                        case 'l':
                            e.preventDefault();
                            clearChat();
                            break;
                        case 'e':
                            e.preventDefault();
                            exportChat();
                            break;
                    }
                }
            });
        });

        // Send Message Function
        async function sendMessage() {
            const messageInput = document.getElementById('messageInput');
            const message = messageInput.value.trim();
            
            if (!message) return;

            // Add user message to chat
            addUserMessage(message);
            messageInput.value = '';
            messageInput.style.height = 'auto';
            document.getElementById('charCounter').textContent = '0/4000';

            // Show typing indicator
            showTypingIndicator();

            try {
                const response = await fetch('http://localhost:5000/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: message,
                        session_id: sessionId,
                        rag_config: {
                            useHybridSearch: isAdvancedRAG,
                            useReranking: isAdvancedRAG,
                            useMultiStepReasoning: isAdvancedRAG,
                            useContextCompression: isAdvancedRAG,
                            citationsEnabled: true
                        }
                    })
                });

                const data = await response.json();
                hideTypingIndicator();
                
                if (data.response || data.answer) {
                    addAIMessage(data);
                    updateMetrics(data);
                } else {
                    throw new Error('Invalid response format');
                }
            } catch (error) {
                hideTypingIndicator();
                addErrorMessage('Przepraszam, wystąpił błąd połączenia. Sprawdź czy backend działa na porcie 5000.');
                console.error('Error:', error);
            }
        }

        // Add User Message
        function addUserMessage(message) {
            const messagesArea = document.getElementById('messagesArea');
            const timestamp = new Date().toLocaleTimeString('pl-PL', {hour: '2-digit', minute: '2-digit'});
            
            const messageHTML = `
                <div class="mega-message">
                    <div class="user-message">
                        <div class="user-bubble">
                            <div class="message-text">${escapeHtml(message)}</div>
                            <div class="user-meta">
                                <span>${timestamp}</span>
                                <span>Konsultant ERP</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            messagesArea.insertAdjacentHTML('beforeend', messageHTML);
            scrollToBottom();
        }

        // Add AI Message
        function addAIMessage(data) {
            const messagesArea = document.getElementById('messagesArea');
            const response = data.response || data.answer || 'Brak odpowiedzi';
            const confidence = data.confidence || 0.85;
            const sources = data.sources || [];
            const processingTime = data.processing_time || '2.1s';
            
            // Determine confidence level
            let confidenceClass = 'confidence-medium';
            let confidenceText = 'Średnia';
            if (confidence >= 0.9) {
                confidenceClass = 'confidence-high';
                confidenceText = 'Wysoka';
            } else if (confidence < 0.7) {
                confidenceClass = 'confidence-low';
                confidenceText = 'Niska';
            }

            // Format response as structured content
            const formattedResponse = formatResponse(response);
            
            const messageHTML = `
                <div class="mega-message">
                    <div class="ai-message">
                        <div class="ai-avatar">🎯</div>
                        <div class="ai-bubble">
                            <div class="message-header">
                                <div class="message-type">
                                    <i class="fas fa-robot"></i>
                                    Odpowiedź ERP AI
                                </div>
                                <div class="confidence-indicator">
                                    <div class="confidence-badge ${confidenceClass}">
                                        ${confidenceText}: ${Math.round(confidence * 100)}%
                                    </div>
                                    <div class="confidence-meter">
                                        <div class="confidence-fill ${confidenceClass.replace('confidence-', '')}" 
                                             style="width: ${confidence * 100}%; background: ${getConfidenceColor(confidence)}"></div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="structured-content">
                                ${formattedResponse}
                            </div>

                            <div class="message-footer">
                                <div class="sources-section">
                                    <span class="sources-label">📚 Źródła:</span>
                                    ${sources.map(source => `<span class="source-tag">${source}</span>`).join('')}
                                    ${sources.length === 0 ? '<span class="source-tag">Wiedza ogólna AI</span>' : ''}
                                </div>
                                <div class="action-buttons">
                                    <button class="action-btn" onclick="copyMessage(this)" title="Kopiuj">
                                        <i class="fas fa-copy"></i>
                                    </button>
                                    <button class="action-btn" onclick="exportMessage(this)" title="Eksportuj">
                                        <i class="fas fa-download"></i>
                                    </button>
                                    <button class="action-btn" onclick="likeMessage(this)" title="Przydatne">
                                        <i class="fas fa-thumbs-up"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            messagesArea.insertAdjacentHTML('beforeend', messageHTML);
            scrollToBottom();
        }

        // Format Response
        function formatResponse(response) {
            // Convert markdown-like formatting to HTML
            let formatted = response
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/`(.*?)`/g, '<code>$1</code>')
                .replace(/\n\n/g, '</p><p>')
                .replace(/\n/g, '<br>');

            // Wrap in paragraph if not already formatted
            if (!formatted.includes('<p>') && !formatted.includes('<div>')) {
                formatted = '<p>' + formatted + '</p>';
            }

            return formatted;
        }

        // Add Error Message
        function addErrorMessage(message) {
            const messagesArea = document.getElementById('messagesArea');
            
            const messageHTML = `
                <div class="mega-message">
                    <div class="ai-message">
                        <div class="ai-avatar" style="background: var(--accent-red);">⚠️</div>
                        <div class="ai-bubble">
                            <div class="message-header">
                                <div class="message-type" style="color: var(--accent-red);">
                                    <i class="fas fa-exclamation-triangle"></i>
                                    Błąd Połączenia
                                </div>
                                <div class="confidence-badge confidence-low">Błąd</div>
                            </div>
                            
                            <div class="structured-content">
                                <p>${message}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            messagesArea.insertAdjacentHTML('beforeend', messageHTML);
            scrollToBottom();
        }

        // Quick Actions
        function quickAction(action) {
            const actions = {
                'config': 'Jak skonfigurować moduły ERP Comarch XL? Pokaż krok po kroku proces konfiguracji modułów finansowych, CRM i HR.',
                'integration': 'Sprawdź status integracji systemów ERP. Jakie są najczęściej używane API do integracji z systemami zewnętrznymi?',
                'reports': 'Pomóż mi wygenerować raport finansowy w ERP. Jaknie najlepsze praktyki tworzenia raportów SQL?',
                'troubleshoot': 'Diagnostyka problemów ERP - jakie są najczęstsze błędy i jak je rozwiązać?'
            };
            
            const messageInput = document.getElementById('messageInput');
            messageInput.value = actions[action];
            messageInput.focus();
            sendMessage();
        }

        // Utility Functions
        function toggleSuggestions() {
            const suggestions = document.getElementById('aiSuggestions');
            suggestions.classList.toggle('active');
        }

        function applySuggestion(element) {
            const text = element.textContent.replace('💡 "', '').replace('"', '');
            document.getElementById('messageInput').value = text;
            document.getElementById('messageInput').focus();
        }

        function toggleRAG() {
            isAdvancedRAG = !isAdvancedRAG;
            const button = event.target.closest('.input-control-btn');
            button.classList.toggle('active');
            
            const modeText = document.querySelector('.mode-indicator .mode-badge');
            modeText.textContent = isAdvancedRAG ? '🧠 Advanced RAG' : '⚡ Standard RAG';
        }

        function toggleVoice() {
            isVoiceActive = !isVoiceActive;
            const button = event.target.closest('.input-control-btn');
            button.classList.toggle('active');
            
            if (isVoiceActive) {
                startVoiceRecognition();
            } else {
                stopVoiceRecognition();
            }
        }

        function attachFile() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.pdf,.doc,.docx,.txt,.csv,.xlsx';
            input.onchange = function(e) {
                const file = e.target.files[0];
                if (file) {
                    alert(`Plik ${file.name} zostanie przesłany (funkcja w rozwoju)`);
                }
            };
            input.click();
        }

        function showTypingIndicator() {
            document.getElementById('typingIndicator').style.display = 'flex';
        }

        function hideTypingIndicator() {
            document.getElementById('typingIndicator').style.display = 'none';
        }

        function scrollToBottom() {
            const messagesArea = document.getElementById('messagesArea');
            messagesArea.scrollTop = messagesArea.scrollHeight;
        }

        function updateMetrics(data) {
            // Update metrics in header
            const confidenceMetric = document.querySelector('.metric-card .metric-value');
            if (confidenceMetric && data.confidence) {
                confidenceMetric.textContent = Math.round(data.confidence * 100) + '%';
            }
            
            const timeMetric = document.querySelectorAll('.metric-card .metric-value')[2];
            if (timeMetric && data.processing_time) {
                timeMetric.textContent = data.processing_time;
            }
        }

        function getConfidenceColor(confidence) {
            if (confidence >= 0.9) return '#059669';
            if (confidence >= 0.7) return '#ea580c';
            return '#dc2626';
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        function copyMessage(button) {
            const messageText = button.closest('.ai-bubble').querySelector('.structured-content').textContent;
            navigator.clipboard.writeText(messageText).then(() => {
                button.innerHTML = '<i class="fas fa-check"></i>';
                setTimeout(() => {
                    button.innerHTML = '<i class="fas fa-copy"></i>';
                }, 2000);
            });
        }

        function exportMessage(button) {
            alert('Export do PDF - funkcja w rozwoju');
        }

        function likeMessage(button) {
            button.style.color = '#059669';
            button.innerHTML = '<i class="fas fa-thumbs-up"></i>';
        }

        function clearChat() {
            if (confirm('Czy na pewno chcesz wyczyścić czat?')) {
                const messagesArea = document.getElementById('messagesArea');
                const welcomeMessage = messagesArea.querySelector('.mega-message');
                messagesArea.innerHTML = '';
                messagesArea.appendChild(welcomeMessage);
            }
        }

        function exportChat() {
            alert('Export całego czatu do PDF - funkcja w rozwoju');
        }

        // Voice Recognition (if supported)
        function startVoiceRecognition() {
            if ('webkitSpeechRecognition' in window) {
                const recognition = new webkitSpeechRecognition();
                recognition.lang = 'pl-PL';
                recognition.continuous = false;
                recognition.interimResults = false;

                recognition.onresult = function(event) {
                    const transcript = event.results[0][0].transcript;
                    document.getElementById('messageInput').value = transcript;
                };

                recognition.onerror = function(event) {
                    console.error('Speech recognition error:', event.error);
                    isVoiceActive = false;
                    document.querySelector('[title="Wejście głosowe"]').classList.remove('active');
                };

                recognition.start();
            } else {
                alert('Twoja przeglądarka nie obsługuje rozpoznawania mowy');
                isVoiceActive = false;
                document.querySelector('[title="Wejście głosowe"]').classList.remove('active');
            }
        }

        function stopVoiceRecognition() {
            // Voice recognition stops automatically after result
        }

        // Initialize suggestions toggle
        setTimeout(() => {
            toggleSuggestions();
        }, 1000);
    </script>
</body>
</html>
