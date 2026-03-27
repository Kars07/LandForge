# 🎨 LandForge Frontend

**LandForge Frontend** is a high-performance, responsive web application serving as the primary interface for the LandForge ecosystem. Built with **React 18**, **TypeScript**, and **Vite**, it provides a seamless bridge between traditional real estate operations and the **Sui Blockchain**.

The UI is meticulously crafted using **Shadcn UI** and **Tailwind CSS**, prioritizing security, transparency, and a premium user experience for both local and international investors.

---

## ✨ Core Features

### 🏡 Modern Landing Page
A conversion-optimized gateway featuring:
* **Property Discovery:** Advanced search filters for location, price, and verified status.
* **Trust Indicators:** Real-time stats on verified land titles and successful blockchain settlements.

### 🔐 Secure Authentication & Onboarding
* **Dual-Role Registration:** Separate onboarding flows for **Landlords** and **Investors/Buyers**.
* **KYC Integration:** Secure forms for NIN/BVN status checks.
* **Wallet Connection:** Native integration with **Sui Wallet** and **Stashed Wallet** via `@mysten/dapp-kit`.

### 📊 Specialized Dashboards
* **Investor Dashboard:**
    * View AI-verified property details and document hashes.
    * Access **NVIDIA AI Intelligence** reports (Flood risk, safety, and amenities).
    * Manage property portfolio and track on-chain ownership tokens.
* **Landlord Dashboard:**
    * Upload property titles for AI document vetting.
    * Monitor **Interswitch Escrow** balances and disbursement status.
    * Manage active listings and view buyer interest.

---

## 🛠️ Tech Stack

### Frontend Core
* **Framework:** [React 18](https://reactjs.org/)
* **Build Tool:** [Vite 5](https://vitejs.dev/)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **Routing:** [React Router Dom v6](https://reactrouter.com/)

### UI & UX
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Components:** [Shadcn UI](https://ui.shadcn.com/) (Radix UI Primitives)
* **Animations:** [Framer Motion](https://www.framer.com/motion/) & [Lucide React Icons](https://lucide.dev/)
* **Forms:** [React Hook Form](https://react-hook-form.com/) + [Zod Validation](https://zod.dev/)

### Data & Web3
* **State Management:** [TanStack Query v5](https://tanstack.com/query/latest)
* **Blockchain:** [@mysten/sui](https://sdk.mystenlabs.com/) & [@mysten/dapp-kit](https://sdk.mystenlabs.com/dapp-kit)
* **Charts/Analytics:** [Recharts](https://recharts.org/)

---

## 🚀 Getting Started

### Prerequisites
* Node.js (v18.0 or higher)
* npm or yarn

### Installation
1.  Navigate to the frontend directory:
    ```bash
    cd landforge_frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3. Run development server:
   ```bash
    npm run dev 
    ```
   

### Environment Setup
Create a `.env` file in the `landforge_frontend` root:
```env
VITE_API_URL=your_backend_api_url
VITE_NAT_URL=your_ai_agent_url
VITE_SUI_NETWORK=testnet

