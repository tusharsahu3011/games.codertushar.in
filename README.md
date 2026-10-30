# 🎮 Fun With Dost Yaar — Social & Party Game Hub

A modern, high-energy party game hub designed for friends, families, college gatherings, and remote game nights.

![Status](https://img.shields.io/badge/Status-Ready%20to%20Play-10b981?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-React%2019%20%7C%20Vite%20%7C%20WebRTC%20%7C%20WebSockets-06b6d4?style=for-the-badge)
![Hub](https://img.shields.io/badge/Brand-Fun%20With%20Dost%20Yaar-8b5cf6?style=for-the-badge)

---

## 🕹️ Featured Games

### 1. 🕵️‍♂️ Undercover (Social Deception & Word Deduction)
- **Civilians (Majority):** Receive the secret word (e.g., *"Coffee"*).
- **Undercover Agent(s):** Receive a closely related, slightly different word (e.g., *"Tea"*).
- **Mr. White (Optional):** Receives **no word at all** and must bluff completely based on others' clues!
- **Features:** Single-device Pass & Play, custom online rooms, WebRTC voice interrogation, and over 110+ word pairs.

### 2. 🧭 Spyfall (Location Interrogation)
- All players know the secret location except the **Spy**.
- Ask tactical questions to unmask the spy before they figure out where you are!
- **Features:** 24+ secret locations, interactive roles, live debate timers, and online rooms.

### 3. 🎴 Bhabhi (Traditional Indian Card Game / Get Away)
- All 52 cards are dealt out! Holder of the **Ace of Spades (A♠)** leads the opening trick.
- Follow suit or throw an off-suit **Thoko** to penalize the highest card holder!
- Shed your cards to get away safe — don't become the **Bhabhi**!
- **Features:** Solo vs AI Bots, online multiplayer with authoritative synchronization, real-time microphone voice chat, and procedural sound effects.

---

## 🚀 Game Modes

### 📱 Pass & Play (Local Single Device)
- Gather around a single smartphone, tablet, or laptop.
- Privacy shield with tactile hold-to-peek card protects secret roles.
- Works 100% offline without needing internet.

### 🌐 Online Multiplayer (Custom Rooms)
- Generate 6-character room codes or share 1-click invite links.
- Instant synchronization across all connected devices via WebSockets and LAN SSE relay.
- Live WebRTC microphone voice chat with real-time audio visualizer soundwaves.

---

## 🛠️ Development & Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Run Vite frontend dev server
npm run dev

# 3. Optional: Run Bhabhi Authoritative WebSocket Server (port 3001)
npm run server:bhabhi

# 4. Type check & Build
npm run typecheck
npm run build
```
