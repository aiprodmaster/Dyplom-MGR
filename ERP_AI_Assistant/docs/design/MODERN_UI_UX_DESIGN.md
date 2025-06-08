# 🎨 MODERN UI/UX DESIGN SYSTEM
## Profesjonalny Interfejs dla ERP AI Assistant

**Wersja:** v2.0.0  
**Data projektu:** 07.06.2025  
**Cel:** Enterprise-grade UI/UX eliminujący chaos wizualny

---

## 🎯 **DESIGN REQUIREMENTS**

### **✅ Główne Założenia:**
1. **Dark theme z opcją light mode**
2. **Glassmorphism effects** i backdrop blur
3. **Smooth animations** i micro-interactions
4. **Enterprise color palette** z profesjonalnymi kolorami
5. **Professional typography** (Inter/Roboto)
6. **Responsive design** (mobile-first approach)

---

## 🎨 **DESIGN SYSTEM ARCHITECTURE**

### **🌈 Enterprise Color Palette**
```css
/* Primary Colors - Professional Blues */
--primary-blue: #1e40af;        /* Main brand color */
--primary-light: #3b82f6;       /* Hover states */
--primary-dark: #1e3a8a;        /* Active states */

/* Secondary Colors - Purple Accents */
--secondary-purple: #7c3aed;    /* Premium accent */
--secondary-light: #a855f7;     /* Secondary hover */
--secondary-dark: #6d28d9;      /* Secondary active */

/* Functional Colors */
--accent-green: #059669;        /* Success states */
--accent-orange: #ea580c;       /* Warning states */
--accent-red: #dc2626;          /* Error states */
--accent-yellow: #d97706;       /* Info states */

/* Neutral Grays - Professional */
--gray-50: #f8fafc;
--gray-100: #f1f5f9;
--gray-200: #e2e8f0;
--gray-300: #cbd5e1;
--gray-400: #94a3b8;
--gray-500: #64748b;
--gray-600: #475569;
--gray-700: #334155;
--gray-800: #1e293b;
--gray-900: #0f172a;

/* Glassmorphism Effects */
--glass-primary: rgba(255, 255, 255, 0.1);
--glass-secondary: rgba(255, 255, 255, 0.05);
--glass-border: rgba(255, 255, 255, 0.2);
--backdrop-blur: blur(20px);
```

### **🔤 Typography System**
```css
/* Font Families */
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-secondary: 'Roboto', system-ui, sans-serif;
--font-mono: 'Fira Code', 'Consolas', monospace;

/* Font Weights */
--font-light: 300;
--font-regular: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;

/* Font Sizes - Modular Scale */
--text-xs: 0.75rem;     /* 12px */
--text-sm: 0.875rem;    /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg: 1.125rem;    /* 18px */
--text-xl: 1.25rem;     /* 20px */
--text-2xl: 1.5rem;     /* 24px */
--text-3xl: 1.875rem;   /* 30px */
--text-4xl: 2.25rem;    /* 36px */

/* Line Heights */
--leading-tight: 1.25;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 2;
```

### **📐 Spacing & Layout System**
```css
/* Spacing Scale */
--space-1: 0.25rem;     /* 4px */
--space-2: 0.5rem;      /* 8px */
--space-3: 0.75rem;     /* 12px */
--space-4: 1rem;        /* 16px */
--space-5: 1.25rem;     /* 20px */
--space-6: 1.5rem;      /* 24px */
--space-8: 2rem;        /* 32px */
--space-10: 2.5rem;     /* 40px */
--space-12: 3rem;       /* 48px */
--space-16: 4rem;       /* 64px */
--space-20: 5rem;       /* 80px */

/* Border Radius */
--radius-none: 0;
--radius-sm: 0.125rem;  /* 2px */
--radius-md: 0.375rem;  /* 6px */
--radius-lg: 0.5rem;    /* 8px */
--radius-xl: 0.75rem;   /* 12px */
--radius-2xl: 1rem;     /* 16px */
--radius-3xl: 1.5rem;   /* 24px */
--radius-full: 9999px;

/* Shadows - Layered Depth */
--shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
--shadow-glass: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
```

---

## 🏗️ **LAYOUT STRUKTURA**

### **📱 Responsive Breakpoints**
```css
/* Mobile First Approach */
--breakpoint-sm: 640px;    /* Small devices */
--breakpoint-md: 768px;    /* Medium devices */
--breakpoint-lg: 1024px;   /* Large devices */
--breakpoint-xl: 1280px;   /* Extra large devices */
--breakpoint-2xl: 1536px;  /* 2X large devices */

/* Layout Containers */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-4);
}

@media (min-width: 640px) {
  .container { padding: 0 var(--space-6); }
}

@media (min-width: 1024px) {
  .container { padding: 0 var(--space-8); }
}
```

### **🎯 Main Layout Components**

#### **1. Header Section**
```css
.erp-header {
  /* Glassmorphism Header */
  background: linear-gradient(135deg, 
    rgba(30, 64, 175, 0.9) 0%, 
    rgba(59, 130, 246, 0.9) 50%, 
    rgba(124, 58, 237, 0.9) 100%);
  backdrop-filter: var(--backdrop-blur);
  border-bottom: 1px solid var(--glass-border);
  
  /* Layout */
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: var(--space-6);
  align-items: center;
  padding: var(--space-6) var(--space-8);
  min-height: 80px;
  
  /* Modern Effects */
  box-shadow: var(--shadow-lg);
  position: relative;
  overflow: hidden;
}

.erp-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--glass-primary);
  backdrop-filter: blur(10px);
  z-index: -1;
}
```

#### **2. Sidebar Controls**
```css
.erp-sidebar {
  /* Glassmorphism Sidebar */
  background: var(--glass-primary);
  backdrop-filter: var(--backdrop-blur);
  border-right: 1px solid var(--glass-border);
  
  /* Layout */
  width: 320px;
  height: 100vh;
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  
  /* Modern Effects */
  box-shadow: var(--shadow-xl);
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
  
  /* Smooth Transitions */
  transform: translateX(-100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.erp-sidebar.open {
  transform: translateX(0);
}

/* Mobile Responsive */
@media (min-width: 1024px) {
  .erp-sidebar {
    position: relative;
    transform: translateX(0);
  }
}
```

#### **3. Main Chat Area**
```css
.erp-chat-main {
  /* Modern Layout */
  display: grid;
  grid-template-rows: auto 1fr auto;
  height: calc(100vh - 80px);
  background: linear-gradient(135deg, 
    var(--gray-50) 0%, 
    var(--gray-100) 100%);
  
  /* Responsive */
  margin-left: 0;
  transition: margin-left 0.3s ease;
}

@media (min-width: 1024px) {
  .erp-chat-main {
    margin-left: 320px;
  }
}
```

#### **4. Messages Container**
```css
.erp-messages-container {
  /* Scrollable Area */
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--space-8);
  background: var(--gray-50);
  
  /* Custom Scrollbar */
  scrollbar-width: thin;
  scrollbar-color: var(--gray-300) transparent;
}

.erp-messages-container::-webkit-scrollbar {
  width: 8px;
}

.erp-messages-container::-webkit-scrollbar-track {
  background: transparent;
}

.erp-messages-container::-webkit-scrollbar-thumb {
  background: var(--gray-300);
  border-radius: var(--radius-full);
  transition: background 0.2s ease;
}

.erp-messages-container::-webkit-scrollbar-thumb:hover {
  background: var(--gray-400);
}
```

#### **5. Input Section**
```css
.erp-input-section {
  /* Glassmorphism Bottom Bar */
  background: var(--glass-primary);
  backdrop-filter: var(--backdrop-blur);
  border-top: 1px solid var(--glass-border);
  
  /* Layout */
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  
  /* Modern Effects */
  box-shadow: var(--shadow-xl);
}
```

---

## 🧩 **UI COMPONENTS SYSTEM**

### **🗨️ Message Bubbles**

#### **User Message Bubble**
```css
.user-message-bubble {
  /* Gradient Background */
  background: linear-gradient(135deg, 
    var(--primary-blue) 0%, 
    var(--primary-light) 50%, 
    var(--secondary-purple) 100%);
  
  /* Layout */
  max-width: 70%;
  margin-left: auto;
  margin-bottom: var(--space-6);
  padding: var(--space-5) var(--space-6);
  border-radius: var(--radius-2xl) var(--radius-2xl) var(--radius-lg) var(--radius-2xl);
  
  /* Typography */
  color: white;
  font-weight: var(--font-medium);
  line-height: var(--leading-relaxed);
  
  /* Modern Effects */
  box-shadow: var(--shadow-lg);
  position: relative;
  backdrop-filter: blur(10px);
  
  /* Animations */
  animation: slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: bottom right;
}

.user-message-bubble::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--glass-secondary);
  border-radius: inherit;
  backdrop-filter: blur(5px);
  z-index: -1;
}

/* Hover Effects */
.user-message-bubble:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-xl);
  transition: all 0.2s ease;
}
```

#### **AI Message Bubble**
```css
.ai-message-bubble {
  /* Clean White Background */
  background: white;
  border: 1px solid var(--gray-200);
  
  /* Layout */
  max-width: 80%;
  margin-right: auto;
  margin-bottom: var(--space-6);
  padding: var(--space-6);
  border-radius: var(--radius-2xl) var(--radius-2xl) var(--radius-2xl) var(--radius-lg);
  
  /* Typography */
  color: var(--gray-800);
  line-height: var(--leading-relaxed);
  
  /* Modern Effects */
  box-shadow: var(--shadow-md);
  position: relative;
  
  /* Animations */
  animation: slideInLeft 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: bottom left;
}

/* Hover Effects */
.ai-message-bubble:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary-blue);
  transition: all 0.2s ease;
}
```

### **🔘 Interactive Buttons**

#### **Primary Action Button**
```css
.btn-primary {
  /* Gradient Background */
  background: linear-gradient(135deg, 
    var(--primary-blue) 0%, 
    var(--primary-light) 100%);
  
  /* Layout */
  padding: var(--space-3) var(--space-6);
  border: none;
  border-radius: var(--radius-xl);
  min-height: 44px; /* Touch-friendly */
  
  /* Typography */
  color: white;
  font-weight: var(--font-semibold);
  font-size: var(--text-sm);
  
  /* Effects */
  box-shadow: var(--shadow-md);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  
  /* Transitions */
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Hover State */
.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
  background: linear-gradient(135deg, 
    var(--primary-light) 0%, 
    var(--secondary-purple) 100%);
}

/* Active State */
.btn-primary:active {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

/* Ripple Effect */
.btn-primary::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.3s, height 0.3s;
}

.btn-primary:active::after {
  width: 200px;
  height: 200px;
}
```

#### **Secondary Button**
```css
.btn-secondary {
  /* Glass Background */
  background: var(--glass-primary);
  backdrop-filter: var(--backdrop-blur);
  border: 1px solid var(--glass-border);
  
  /* Layout */
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-xl);
  min-height: 44px;
  
  /* Typography */
  color: var(--gray-700);
  font-weight: var(--font-medium);
  font-size: var(--text-sm);
  
  /* Effects */
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: var(--glass-secondary);
  border-color: var(--primary-blue);
  color: var(--primary-blue);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}
```

### **📊 Status Indicators**

#### **Confidence Badge**
```css
.confidence-badge {
  /* Dynamic Background */
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  border: 1px solid;
  
  /* Smooth Transitions */
  transition: all 0.2s ease;
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
```

#### **Typing Indicator**
```css
.typing-indicator {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--gray-500);
  font-size: var(--text-sm);
}

.typing-dots {
  display: flex;
  gap: var(--space-1);
}

.typing-dot {
  width: 6px;
  height: 6px;
  background: var(--primary-blue);
  border-radius: 50%;
  animation: typingBounce 1.4s ease-in-out infinite both;
}

.typing-dot:nth-child(1) { animation-delay: -0.32s; }
.typing-dot:nth-child(2) { animation-delay: -0.16s; }
.typing-dot:nth-child(3) { animation-delay: 0s; }

@keyframes typingBounce {
  0%, 80%, 100% { 
    transform: scale(0);
    opacity: 0.5;
  }
  40% { 
    transform: scale(1);
    opacity: 1;
  }
}
```

---

## 🎬 **ANIMATIONS & MICRO-INTERACTIONS**

### **🌊 Smooth Entrance Animations**
```css
/* Slide In Animations */
@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Fade In Animation */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Scale In Animation */
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

### **💫 Interactive Micro-Animations**
```css
/* Hover Lift Effect */
.hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

/* Pulse Animation */
.pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* Spin Animation */
.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Bounce Animation */
.bounce {
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%, 20%, 53%, 80%, 100% {
    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    transform: translate3d(0, 0, 0);
  }
  40%, 43% {
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    transform: translate3d(0, -30px, 0);
  }
  70% {
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    transform: translate3d(0, -15px, 0);
  }
  90% {
    transform: translate3d(0, -4px, 0);
  }
}
```

---

## 🌓 **DARK/LIGHT MODE SYSTEM**

### **🌙 Dark Theme Variables**
```css
[data-theme="dark"] {
  /* Background Colors */
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-tertiary: #334155;
  
  /* Text Colors */
  --text-primary: #f1f5f9;
  --text-secondary: #cbd5e1;
  --text-tertiary: #94a3b8;
  
  /* Border Colors */
  --border-primary: #334155;
  --border-secondary: #475569;
  
  /* Glass Effects - Dark Mode */
  --glass-primary: rgba(15, 23, 42, 0.8);
  --glass-secondary: rgba(30, 41, 59, 0.6);
  --glass-border: rgba(148, 163, 184, 0.1);
  
  /* Shadow Adjustments */
  --shadow-dark: 0 20px 25px -5px rgba(0, 0, 0, 0.4);
}
```

### **☀️ Light Theme Variables**
```css
[data-theme="light"] {
  /* Background Colors */
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --bg-tertiary: #f1f5f9;
  
  /* Text Colors */
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --text-tertiary: #94a3b8;
  
  /* Border Colors */
  --border-primary: #e2e8f0;
  --border-secondary: #cbd5e1;
  
  /* Glass Effects - Light Mode */
  --glass-primary: rgba(255, 255, 255, 0.7);
  --glass-secondary: rgba(248, 250, 252, 0.8);
  --glass-border: rgba(226, 232, 240, 0.3);
}
```

### **🔄 Theme Toggle Animation**
```css
.theme-toggle {
  /* Button Styling */
  background: var(--glass-primary);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-full);
  padding: var(--space-2);
  cursor: pointer;
  
  /* Layout */
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  /* Transitions */
  transition: all 0.3s ease;
}

.theme-toggle:hover {
  background: var(--glass-secondary);
  transform: scale(1.05);
}

/* Theme Transition */
* {
  transition: background-color 0.3s ease, 
              border-color 0.3s ease, 
              color 0.3s ease;
}
```

---

## 📱 **RESPONSIVE DESIGN SYSTEM**

### **📐 Mobile-First Grid System**
```css
/* Base Grid */
.grid {
  display: grid;
  gap: var(--space-4);
}

/* Auto-fit Grid */
.grid-auto {
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

/* Responsive Columns */
.grid-1 { grid-template-columns: 1fr; }
.grid-2 { grid-template-columns: repeat(2, 1fr); }
.grid-3 { grid-template-columns: repeat(3, 1fr); }
.grid-4 { grid-template-columns: repeat(4, 1fr); }

/* Tablet Adjustments */
@media (min-width: 768px) {
  .md\:grid-2 { grid-template-columns: repeat(2, 1fr); }
  .md\:grid-3 { grid-template-columns: repeat(3, 1fr); }
  .md\:grid-4 { grid-template-columns: repeat(4, 1fr); }
}

/* Desktop Adjustments */
@media (min-width: 1024px) {
  .lg\:grid-3 { grid-template-columns: repeat(3, 1fr); }
  .lg\:grid-4 { grid-template-columns: repeat(4, 1fr); }
  .lg\:grid-6 { grid-template-columns: repeat(6, 1fr); }
}
```

### **📱 Mobile Optimizations**
```css
/* Mobile Chat Layout */
@media (max-width: 767px) {
  .erp-chat-main {
    margin-left: 0;
    height: 100vh;
  }
  
  .erp-sidebar {
    width: 100vw;
    transform: translateX(-100%);
  }
  
  .erp-sidebar.open {
    transform: translateX(0);
    backdrop-filter: blur(20px);
    background: rgba(0, 0, 0, 0.9);
  }
  
  .erp-messages-container {
    padding: var(--space-4);
  }
  
  .user-message-bubble,
  .ai-message-bubble {
    max-width: 90%;
  }
  
  .erp-input-section {
    padding: var(--space-4);
    border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
  }
}

/* Touch Optimizations */
@media (hover: none) and (pointer: coarse) {
  .btn-primary,
  .btn-secondary {
    min-height: 48px; /* Larger touch targets */
    font-size: var(--text-base);
  }
  
  .action-btn {
    min-width: 44px;
    min-height: 44px;
  }
}
```

---

## ♿ **ACCESSIBILITY FEATURES**

### **🎯 ARIA & Screen Reader Support**
```css
/* Screen Reader Only Content */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* High Contrast Mode Support */
@media (prefers-contrast: high) {
  :root {
    --primary-blue: #0000ff;
    --accent-green: #008000;
    --accent-red: #ff0000;
    --border-primary: #000000;
  }
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Focus Indicators */
.focus-visible {
  outline: 2px solid var(--primary-blue);
  outline-offset: 2px;
  border-radius: var(--radius-md);
}

button:focus-visible,
input:focus-visible,
textarea:focus-visible {
  outline: 2px solid var(--primary-blue);
  outline-offset: 2px;
}
```

### **⌨️ Keyboard Navigation**
```css
/* Skip Links */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--primary-blue);
  color: white;
  padding: 8px;
  text-decoration: none;
  border-radius: var(--radius-md);
  z-index: 1000;
}

.skip-link:focus {
  top: 6px;
}

/* Keyboard-only Navigation */
.keyboard-navigation {
  box-shadow: 0 0 0 2px var(--primary-blue);
  border-radius: var(--radius-md);
}
```

---

## 📊 **COMPONENT LIBRARY**

### **🎛️ Form Controls**

#### **Input Fields**
```css
.input-field {
  /* Base Styling */
  background: white;
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-xl);
  padding: var(--space-4) var(--space-5);
  font-size: var(--text-base);
  font-family: var(--font-primary);
  
  /* Layout */
  width: 100%;
  min-height: 48px;
  
  /* Transitions */
  transition: all 0.2s ease;
}

.input-field:focus {
  outline: none;
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.1);
  background: var(--gray-50);
}

.input-field:disabled {
  background: var(--gray-100);
  border-color: var(--gray-300);
  color: var(--gray-500);
  cursor: not-allowed;
}

.input-field.error {
  border-color: var(--accent-red);
  background: rgba(220, 38, 38, 0.05);
}

.input-field.success {
  border-color: var(--accent-green);
  background: rgba(5, 150, 105, 0.05);
}
```

#### **Textarea Advanced**
```css
.textarea-advanced {
  /* Inherits from input-field */
  min-height: 120px;
  resize: vertical;
  font-family: var(--font-primary);
  line-height: var(--leading-relaxed);
  
  /* Custom Scrollbar */
  scrollbar-width: thin;
  scrollbar-color: var(--gray-300) transparent;
}

.textarea-advanced::-webkit-scrollbar {
  width: 8px;
}

.textarea-advanced::-webkit-scrollbar-thumb {
  background: var(--gray-300);
  border-radius: var(--radius-full);
}
```

### **🏷️ Tags & Badges**

#### **Source Tags**
```css
.source-tag {
  /* Glassmorphism Tag */
  background: var(--glass-primary);
  backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-full);
  padding: var(--space-1) var(--space-3);
  
  /* Typography */
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  color: var(--gray-700);
  
  /* Layout */
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  
  /* Hover Effect */
  transition: all 0.2s ease;
}

.source-tag:hover {
  background: var(--glass-secondary);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}
```

#### **Status Badges**
```css
.status-badge {
  /* Base Styling */
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  text-transform: uppercase;
  letter-spacing: 0.025em;
  
  /* Variants */
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
}

.status-badge.online {
  background: rgba(5, 150, 105, 0.1);
  color: var(--accent-green);
}

.status-badge.offline {
  background: rgba(220, 38, 38, 0.1);
  color: var(--accent-red);
}

.status-badge.processing {
  background: rgba(234, 88, 12, 0.1);
  color: var(--accent-orange);
  animation: pulse 2s infinite;
}
```

### **🎨 Cards & Panels**

#### **Glassmorphism Cards**
```css
.glass-card {
  /* Glassmorphism Effect */
  background: var(--glass-primary);
  backdrop-filter: var(--backdrop-blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-2xl);
  
  /* Layout */
  padding: var(--space-6);
  margin-bottom: var(--space-6);
  
  /* Effects */
  box-shadow: var(--shadow-glass);
  position: relative;
  overflow: hidden;
  
  /* Animations */
  transition: all 0.3s ease;
}

.glass-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-2xl);
  border-color: rgba(255, 255, 255, 0.3);
}

.glass-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(255, 255, 255, 0.4) 50%, 
    transparent 100%);
}
```

#### **Feature Cards**
```css
.feature-card {
  /* Modern Card Design */
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-2xl);
  padding: var(--space-8);
  
  /* Layout */
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  
  /* Effects */
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
  border-color: var(--primary-blue);
}

.feature-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(135deg, 
    var(--primary-blue) 0%, 
    var(--secondary-purple) 100%);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}

.feature-card:hover::after {
  transform: scaleX(1);
}
```

---

## 🎭 **LOADING STATES & FEEDBACK**

### **💫 Loading Animations**
```css
/* Skeleton Loading */
.skeleton {
  background: linear-gradient(90deg, 
    var(--gray-200) 25%, 
    var(--gray-100) 50%, 
    var(--gray-200) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-md);
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Message Skeleton */
.message-skeleton {
  display: flex;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.message-skeleton .avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.message-skeleton .content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.message-skeleton .line {
  height: 16px;
  border-radius: var(--radius-sm);
}

.message-skeleton .line:nth-child(1) { width: 60%; }
.message-skeleton .line:nth-child(2) { width: 80%; }
.message-skeleton .line:nth-child(3) { width: 40%; }

/* Spinner Loading */
.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--gray-200);
  border-top: 3px solid var(--primary-blue);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-sm {
  width: 16px;
  height: 16px;
  border-width: 2px;
}

.spinner-lg {
  width: 48px;
  height: 48px;
  border-width: 4px;
}
```

### **✅ Success & Error States**
```css
/* Success Animation */
.success-checkmark {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--accent-green);
  position: relative;
  display: inline-block;
}

.success-checkmark::after {
  content: '';
  position: absolute;
  top: 6px;
  left: 9px;
  width: 6px;
  height: 12px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
  animation: checkmark 0.5s ease;
}

@keyframes checkmark {
  0% {
    opacity: 0;
    transform: rotate(45deg) scale(0);
  }
  100% {
    opacity: 1;
    transform: rotate(45deg) scale(1);
  }
}

/* Error Animation */
.error-cross {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--accent-red);
  position: relative;
  display: inline-block;
}

.error-cross::before,
.error-cross::after {
  content: '';
  position: absolute;
  top: 11px;
  left: 6px;
  width: 12px;
  height: 2px;
  background: white;
  border-radius: var(--radius-sm);
}

.error-cross::before {
  transform: rotate(45deg);
}

.error-cross::after {
  transform: rotate(-45deg);
}
```

---

## 🎬 **PERFORMANCE OPTIMIZATIONS**

### **⚡ CSS Performance**
```css
/* GPU Acceleration */
.gpu-accelerated {
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}

/* Efficient Animations */
.smooth-animation {
  will-change: transform, opacity;
}

.smooth-animation.complete {
  will-change: auto;
}

/* Container Queries */
@container (min-width: 400px) {
  .responsive-component {
    grid-template-columns: 1fr 1fr;
  }
}

@container (min-width: 600px) {
  .responsive-component {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### **🎨 Critical CSS Inlining**
```css
/* Above-the-fold Critical Styles */
.critical {
  /* Base layout */
  body { margin: 0; font-family: var(--font-primary); }
  .erp-header { display: grid; min-height: 80px; }
  .erp-chat-main { display: grid; height: calc(100vh - 80px); }
  
  /* Essential colors */
  :root {
    --primary-blue: #1e40af;
    --gray-100: #f1f5f9;
    --gray-800: #1e293b;
  }
}
```

---

## 📋 **DESIGN GUIDELINES**

### **✅ Do's:**
- **Consistent Spacing:** Używaj system spacing (4px base unit)
- **Accessible Colors:** Minimum 4.5:1 contrast ratio
- **Touch Targets:** Minimum 44px dla elementów dotykowych
- **Responsive Images:** Używaj appropriate density dla różnych urządzeń
- **Semantic HTML:** Struktura znaczeniowa przed wizualną
- **Progressive Enhancement:** Działaj bez JavaScript

### **❌ Don'ts:**
- **Fixed Layouts:** Unikaj sztywnych szerokości
- **Tiny Text:** Nie używaj fontów mniejszych niż 14px na mobile
- **Animation Overload:** Nie animuj wszystkiego jednocześnie
- **Color Only:** Nie polegaj tylko na kolorze do przekazywania informacji
- **Auto-playing Media:** Unikaj auto-play video/audio
- **Complex Gestures:** Nie wymagaj skomplikowanych gestów

### **🎯 Performance Targets:**
- **First Contentful Paint:** < 1.5s
- **Largest Contentful Paint:** < 2.5s
- **Cumulative Layout Shift:** < 0.1
- **First Input Delay:** < 100ms
- **Bundle Size:** < 300KB gzipped

---

## 🛠️ **IMPLEMENTATION CHECKLIST**

### **🎨 Design System:**
- [ ] CSS Custom Properties zdefiniowane
- [ ] Typography scale zaimplementowany
- [ ] Color palette skonfigurowana
- [ ] Spacing system w użyciu
- [ ] Component library utworzona

### **📱 Responsive Design:**
- [ ] Mobile-first approach
- [ ] Breakpoints zdefiniowane
- [ ] Touch-friendly interactions
- [ ] Cross-device testing
- [ ] Container queries gdzie odpowiednie

### **♿ Accessibility:**
- [ ] ARIA labels i roles
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] Color contrast sprawdzony
- [ ] Focus indicators widoczne

### **⚡ Performance:**
- [ ] Critical CSS inline
- [ ] Lazy loading images
- [ ] Animation optimization
- [ ] Bundle size monitoring
- [ ] Core Web Vitals tracking

---

**🎨 Modern UI/UX Design System zapewnia:**
- **Consistency:** Unified design language across całą aplikację
- **Accessibility:** WCAG AA compliance z screen reader support
- **Performance:** Optimized animations i efficient CSS
- **Maintainability:** Modular components z clear guidelines
- **User Experience:** Intuitive interactions z professional polish
- **Responsive:** Mobile-first approach z container queries

---

*Design System Documentation - v2.0*  
*Ostatnia aktualizacja: 07.06.2025, 22:25*
</content>
</write_to_file>
