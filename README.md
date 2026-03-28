# LandForge 🏡

**LandForge** is a next-generation real estate and property registry platform tailored for the Nigerian market. It is a secure marketplace where landlords list full properties (land or apartments) with verified titles, and investors search, verify risks via AI, and complete purchases or rentals instantly.Every title is tokenized on the Sui blockchain for permanent ownership records. AI instantly flags real-world risks(like floods or low-light electricity resource) and gives clear recommendations.


---

## 🔗 Live Application : [https://land-forge.vercel.app]

## PRD Document: https://docs.google.com/document/d/1dAG8Elm0nejEA64KeG_UPN6LzvAwWvt2hYreltWmqfE/edit?usp=drivesdk

---

## 📌 The Problem
Real estate in Nigeria is currently a high-risk venture, with **land fraud costing over ₦300 billion annually**. Local buyers and Diaspora investors (UK, US, Canada) face a massive trust gap because they cannot safely purchase or rent properties without:

* **Costly Physical Verification:** Needing to fly home just to verify the physical existence of a property.
* **Document Forgery:** Relying on agents who may provide forged Certificates of Occupancy (C of O) or survey plans.
* **Hidden Environmental Risks:** Facing post-purchase surprises like severe flooding or unreliable local power infrastructure ("no light").
* **Lack of Secure Escrow:** High risk of losing capital to "ghost" landlords with no way to recover funds.

## 💡 The LandForge Solution
LandForge digitizes the entire lifecycle of a property transaction to solve these hurdles:
* **AI-Driven Vetting:** Uses **NVIDIA Agentic AI** to instantly parse and verify the authenticity of Nigerian land documents from anywhere in the world.
* **Immutable Registry:** All verified document hashes are stored on the **Sui Blockchain**, creating a "digital twin" that prevents double-selling.
* **Integrated Escrow:** Seamlessly handles fiat-to-blockchain transactions via **Interswitch**, ensuring funds are only released when digital ownership is transferred.
* **Environmental Intelligence:** Provides instant data on flood risks, amenity proximity, and area safety via specialized AI agents.

## 🚀 Why LandForge is Better
Unlike existing property listing sites—which act as simple digital classified ads—LandForge is a **validation and settlement engine**.


| Feature | Traditional Apps | LandForge |
| :--- | :--- | :--- |
| **Verification** | Manual / None | **Automated AI Document Parsing** |
| **Security** | Centralized Database | **Decentralized Sui Smart Contracts** |
| **Double Selling** | Possible | **Impossible (On-chain ownership)** |
| **Payments** | External/Manual | **Deep Interswitch Integration** |
| **Data** | Static Images | **AI-Powered Area Intelligence** |

---

## 💳 Interswitch API Integration
We leverage Interswitch’s robust infrastructure to ensure secure and familiar financial flows:
* **WebCheckout:** Allows buyers to securely pay for property listings or rent using their cards or bank transfers.
* **Virtual Accounts (Card 360):** Provides landlords with dedicated accounts to receive payments seamlessly.
* **Transfers API:** Automates the disbursement of funds from the secure escrow system to the landlord's verified bank account upon successful transaction completion.

---

## 👥 The Team & Roles
* **Adetola Fathiat**: Project Manager — Spearheaded strategy, coordination, and project delivery timelines.
* **Eniaiyejuni Raphael**: AI & Blockchain Developer — Built the NVIDIA AI agents and developed the Sui Move smart contracts.
* **Abibi Daniella**: Backend Developer — Engineered the API integrations, Interswitch payment flows, and the Escrow management system.
* **Oloyede Micheal**: Frontend Developer — Designed the user interface and managed the repository documentation.

---

## 🧪 Testing Credentials (For Judges)

### Web Application Access
-Landlord Dashboard 
* **Email:** kemisolaolamide68@gmail.com
* **Password:** Zephany12

-Buyer Dashboard 
* **Email:** officialswiftfund@gmail.com 
* **Password:** Olamkesh34

### Wallet & Blockchain Testing
LandForge operates on the **Sui Network**. To test the blockchain interactions:
1.  Download the **Sui Wallet** or **Stashed Wallet** extension.
2.  **Test Wallet Credentials:** [INSERT MNEMONIC OR PRIVATE KEY HERE]
3.  Ensure your wallet is set to the **Sui Testnet**.

---

## 🏗️ Architecture Stack

LandForge operates on a robust microservice-inspired architecture:

1. **Frontend (`landforge_frontend/`)**
   - **Tech:** React, TypeScript, Vite, Tailwind CSS, Shadcn UI
   - **Role:** The user-facing App. Provides dashboard views for Buyers to search and purchase properties, and Landlords to register verified listings and manage their escrow earnings.

2. **Backend Engine (`landforge_backend/`)**
   - **Tech:** Node.js, Express, MongoDB, Mongoose
   - **Role:** Handles traditional Auth (JWT), User Profiles (NIN/BVN statuses), persists Listing Data outside of the blockchain to make searching fast, records offline Escrow/Transaction histories, and exposes REST endpoints.

3. **AI Verification Agents (NVIDIA NAT)**
   - **Tech:** Python 3.11, NVIDIA Agentic Toolkit (NAT), Llama-3.1-8B (NIM)
   - **Role:** Exposes an AI pipeline server (port 8000) housing 3 specialized agents:
     - `landforge_verify_document`: Parses Nigerian Land Titles, Survey Plans, and C of Os, checking strictness parameters.
     - `landforge_hash_document`: Cryptographically hashes valid documents for exact on-chain matching.
     - `landforge_area_intelligence`: Fetches and evaluates area safety, flood risks, and amenities.

4. **Smart Contracts (`landforge_smartcontract/`)**
   - **Tech:** Sui Blockchain (Move Language)
   - **Role:** The ultimate source of truth. Contains immutable functions like `register_listing` (storing the AI-generated document hashes on-chain) and `purchase_listing` (trustlessly transferring digital ownership of the property token to the buyer).

5. **Fiat Payment Gateway (Interswitch)**
   - **Role:** 
     - *Virtual Accounts (Card 360)*: For Landlords.
     - *WebCheckout*: For Buyers paying rent/buying property securely via card.
     - *Transfers API*: Automated disbursements from the Escrow back to the Landlord's actual bank account.

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js (v18+)
- Python (v3.11)
- `uv` (Fast Python package manager)
- MongoDB running locally or a MongoDB Atlas URI
- Sui CLI (for Move contract publishing)

### 1. Start the Node.js Backend
```bash
cd landforge_backend
npm install
```
Create a `.env` in `landforge_backend/`:
```env
PORT=3001
MONGO_URI=mongodb://127.0.0.1:27017/landforge
JWT_SECRET=your_super_secret_jwt_key
```
Run it:
```bash
node server.js
```

### 2. Start the AI Agent (NAT)
From the root of the project, install the NAT dependencies via `uv`:
```bash
uv pip install nvidia-nat[langchain]~=1.5
uv pip install -e ./landforge_area_intelligence
uv pip install -e ./landforge_hash_document
uv pip install -e ./landforge_verify_document
```
Ensure you have set the API variable to hit the NVIDIA NIM endpoints:
```bash
export NVIDIA_API_KEY="nvapi-your-key-here"
```
Run the NAT Server:
```bash
nat serve --config_file config.yml --host 0.0.0.0 --port 8000
```

### 3. Start the React Frontend
```bash
cd landforge_frontend
npm install
```
Create a `.env` in `landforge_frontend/`:
```env
VITE_API_URL=http://localhost:3001/api
VITE_NAT_URL=http://localhost:8000
```
Run it:
```bash
npm run dev
```

---

## 🌍 Production Deployment

If you are looking to take the project live globally, we have configured everything for a fully free-tier compatible stack on **Vercel** and **Render**.

### Vercel (Frontend)
1. Import `landforge_frontend` into Vercel.
2. Before pushing live, ensure you add the Environment Variables:
   - `VITE_API_URL` -> (URL of your deployed backend)
   - `VITE_NAT_URL` -> (URL of your deployed NAT instance)

### Render (Node.js Backend)
1. Create a **Web Service** on Render.
2. Root Directory: `landforge_backend`
3. Environment: `Node`
4. Build Command: `npm install`
5. Start Command: `node server.js`
6. *Requirement*: Whitelist `0.0.0.0/0` in MongoDB Atlas Network Access so Render's dynamic IP can connect. Set `MONGO_URI` in Render Environment Variables.

### Render (AI Agent / Python NAT)
1. Create another **Web Service** on Render using the root directory of the repo.
2. Environment: `Python` (Render will read `.python-version` and `requirements.txt` automatically)
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `nat serve --config_file config.yml --host 0.0.0.0 --port $PORT`
5. Remember to add `NVIDIA_API_KEY` to your Render Environment Variables.

(*Alternatively, you can deploy the AI Agent using the included `Dockerfile.ai`!*)

---

## 📜 On-Chain Interactions
The Sui Move smart contract (`landforge_smartcontract.move`) tracks digital land registry events. When a user creates a new listing, the AI verifies the document and generates a `document_hash` and `fields_hash`. These hashes are permanently stored in the `PropertyListing` object on the Sui Testnet, meaning nobody can ever silently alter the structural reality of the title deed. 

When a buyer checks out through Interswitch, `purchase_listing` is called automatically upon payment realization, officially binding the property's digital twin to the Buyer's Sui Wallet Address.

## 🤝 Contributing
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---
*Built to bring safety, AI intelligence, and immutable accountability to African Real Estate.*
