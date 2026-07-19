import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { db } from "./src/lib/firebaseAdmin.ts";
import Razorpay from "razorpay";
import crypto from "crypto";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Alvon Browser Search API Route with Google Search Grounding
  app.post("/api/search", async (req, res) => {
    try {
      const { query } = req.body;
      if (!query) {
        return res.status(400).json({ error: "Query is required" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        // Return beautiful mock search results that look real, so the app is immediately fully usable even before the user puts in their API key!
        return res.json({
          text: `Here are the search results for **"${query}"** (Demo Mode):\n\n**Alvon Super App** provides premium 5G services, instant recharges, an in-app e-commerce catalog (Alvon Mart), and a secure social timeline (Alvon Social).\n\nIf you are looking for live web search results, please configure your \`GEMINI_API_KEY\` in **Settings > Secrets** to activate live Google Search grounding.`,
          groundingChunks: [
            { web: { title: "Alvon Super App Official Portal", uri: "https://alvon.net" } },
            { web: { title: "Alvon 5G Plans & Coverage Maps", uri: "https://alvon.net/plans" } },
            { web: { title: "Alvon Mart Shopping Catalog", uri: "https://alvon.net/mart" } },
            { web: { title: "Alvon Smart Hub App Store", uri: "https://alvon.net/smarthub" } }
          ],
          isDemo: true
        });
      }

      // Lazy initialize SDK client to prevent startup crashes when API key is missing
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Perform a search engine style query and summarize results for: ${query}. Return an informative summary.`,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text || "No results found.";
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

      res.json({
        text,
        groundingChunks: groundingChunks.map((chunk: any) => ({
          web: {
            title: chunk.web?.title || "Search Source",
            uri: chunk.web?.uri || ""
          }
        })),
        isDemo: false
      });
    } catch (error: any) {
      console.error("Search API Error:", error);
      res.status(500).json({ error: error.message || "An error occurred during search" });
    }
  });

  // Alvon AI Hub - Multi-AI Chat API Route
  app.post("/api/learning/chat", async (req, res) => {
    try {
      const { message, persona } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const selectedPersona = persona || "gemini";
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        // High fidelity demo simulation for offline development / missing key
        let demoResponseText = "";
        if (selectedPersona === "deepseek") {
          demoResponseText = `<think>
1. User prompt received: "${message}"
2. Running Alvon Deep Reasoning Core (Simulated DeepSeek R1 Mode)...
3. Identifying core concepts and structure.
4. Structuring a comprehensive educational response with India-centric references.
</think>
Namaste! This is **DeepSeek R1 (Deep Reasoning)** in demo mode. 

To help you understand your question about **"${message}"**, here is a structured breakdown:

- **Core concept**: A fundamental concept that explains this topic clearly.
- **Indian Relevance**: Under the Digital India initiative, understanding this empowers local innovation and education.
- **Key Takeaway**: Continuous learning and critical thinking are essential.

*Note: Configure your \`GEMINI_API_KEY\` in **Settings > Secrets** to enable live real-time answers powered by Gemini.*`;
        } else if (selectedPersona === "gpt") {
          demoResponseText = `Greetings! I am **Alvon GPT-4o (Specialist)**. 

Regarding your query **"${message}"**:
I am currently running in Alvon's local demo mode. To get high-fidelity specialist responses for code, technical analysis, and creative drafting, please link your \`GEMINI_API_KEY\` in **Settings > Secrets**.

Here is a quick structured summary:
1. **Definition**: The concept refers to an optimized method of solving queries.
2. **Implementation**: Best practiced using modular architectures.
3. **Optimizations**: Avoid blocking state, use proper asynchronous patterns.`;
        } else {
          demoResponseText = `Hello! I am **Alvon Gemini 3.5 (Standard)**, your direct learning partner. 

You asked about: **"${message}"**. 

Here is what you need to know:
- **Concept Guide**: This is a curated educational overview.
- **Next Steps**: You can read related e-books in the *Alvon E-Books Library* right here, or generate study cards to help prepare for exams.

*Tip: Add a \`GEMINI_API_KEY\` in the **Settings** menu of AI Studio to experience the full conversational power of Gemini 3.5 in real-time!*`;
        }

        return res.json({
          text: demoResponseText,
          isDemo: true,
          persona: selectedPersona
        });
      }

      // Real-time API Integration using @google/genai
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      let systemInstruction = "";
      if (selectedPersona === "deepseek") {
        systemInstruction = "You are DeepSeek R1 on the Alvon Super App. Your unique trait is that you MUST think deeply before answering. Start your response with a '<think>' tag, write down your detailed step-by-step reasoning process, close it with a '</think>' tag, and then write your final clear response. For example: '<think>Let's analyze this step-by-step...</think>\\nHere is my solution...'. Maintain this format strictly.";
      } else if (selectedPersona === "gpt") {
        systemInstruction = "You are Alvon GPT-4o, a highly professional coding, technical analysis, and creative writing assistant on the Alvon Super App. Provide precise, expert-level answers with code blocks or elegant prose where applicable.";
      } else {
        systemInstruction = "You are Alvon Gemini, an advanced digital assistant tailored for users in India. Answer the user query with clarity, structure, and helpfulness, adding educational insights suitable for students or professionals.";
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: message,
        config: {
          systemInstruction,
          temperature: selectedPersona === "gpt" ? 0.7 : 0.6,
        },
      });

      const text = response.text || "I was unable to formulate a response. Please try again.";

      res.json({
        text,
        isDemo: false,
        persona: selectedPersona
      });
    } catch (error: any) {
      console.error("Learning Chat API Error:", error);
      res.status(500).json({ error: error.message || "An error occurred during chat processing" });
    }
  });

  // Lazy initialize Razorpay
  let razorpayInstance: any = null;
  try {
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      razorpayInstance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
      });
    }
  } catch (err) {
    console.error("Razorpay initialization error:", err);
  }

  // 1. GET USER PROFILE (GET OR CREATE IN FIRESTORE)
  app.get("/api/user/get-or-create", async (req, res) => {
    try {
      const { userId } = req.query;
      const uid = (userId as string) || "jane-alvon";

      const userDoc = await db.collection("users").doc(uid).get();

      if (!userDoc.exists) {
        // Create default user in Firestore
        const defaultProfile = {
          uid,
          name: "Jane Alvon User",
          phone: "9876543210",
          walletBalance: 2500.00, // starting with ₹2,500
          alvonCoins: 12000,
          uplineId: "upline_1",
          activePlan: "Alvon True 5G Daily",
          dataUsed: 0.6,
          dataLimit: 2.0,
          daysRemaining: 24
        };
        await db.collection("users").doc(uid).set(defaultProfile);
        return res.json(defaultProfile);
      }

      res.json(userDoc.data());
    } catch (error: any) {
      console.error("Error fetching or creating user profile:", error);
      res.status(500).json({ error: error.message || "Failed to fetch user" });
    }
  });

  // 2. RAZORPAY: ADD WALLET MONEY (CREATE ORDER)
  app.post("/api/wallet/add-order", async (req, res) => {
    try {
      const { userId, amount } = req.body;
      if (!userId || !amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        return res.status(400).json({ error: "Invalid userId or amount" });
      }

      const amountINR = Number(amount);
      const receiptId = `receipt_${Date.now()}`;

      if (razorpayInstance) {
        // Real Razorpay order
        const order = await (razorpayInstance as any).orders.create({
          amount: Math.round(amountINR * 100), // Razorpay accepts in paise
          currency: "INR",
          receipt: receiptId
        });
        return res.json({
          success: true,
          isSimulated: false,
          keyId: process.env.RAZORPAY_KEY_ID,
          orderId: order.id,
          amount: amountINR,
          currency: "INR"
        });
      } else {
        // Simulated Order
        const orderId = `order_mock_${Math.random().toString(36).substring(2, 15)}`;
        return res.json({
          success: true,
          isSimulated: true,
          keyId: "rzp_test_mockkey12345678",
          orderId,
          amount: amountINR,
          currency: "INR"
        });
      }
    } catch (error: any) {
      console.error("Error creating Razorpay order:", error);
      res.status(500).json({ error: error.message || "Failed to create order" });
    }
  });

  // 3. RAZORPAY: VERIFY SIGNATURE AND CREDIT WALLET
  app.post("/api/wallet/verify-payment", async (req, res) => {
    try {
      const { userId, amount, orderId, paymentId, signature, isSimulated } = req.body;
      if (!userId || !amount) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const amountINR = Number(amount);

      let isVerified = false;
      if (isSimulated || !razorpayInstance) {
        // Demo verification - always verify
        isVerified = true;
      } else {
        // Real Razorpay verification
        const secret = process.env.RAZORPAY_KEY_SECRET || "";
        const body = orderId + "|" + paymentId;
        const expectedSignature = crypto
          .createHmac("sha256", secret)
          .update(body.toString())
          .digest("hex");
        isVerified = expectedSignature === signature;
      }

      if (!isVerified) {
        return res.status(400).json({ error: "Razorpay signature verification failed" });
      }

      // Credit wallet balance in Firestore
      const userRef = db.collection("users").doc(userId);
      await db.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists) {
          throw new Error("User does not exist");
        }
        const userData = userDoc.data()!;
        const currentBalance = Number(userData.walletBalance || 0);
        const newBalance = currentBalance + amountINR;

        transaction.update(userRef, { walletBalance: newBalance });

        // Add ledger record
        const txnId = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
        const txnRef = db.collection("transactions").doc(txnId);
        transaction.set(txnRef, {
          id: txnId,
          userId,
          title: "Wallet Top-up (Alvon Pay)",
          type: "credit",
          asset: "wallet",
          amount: amountINR,
          category: "wallet",
          timestamp: new Date().toISOString()
        });
      });

      const updatedDoc = await userRef.get();
      res.json({
        success: true,
        message: "Wallet topped up successfully!",
        user: updatedDoc.data()
      });
    } catch (error: any) {
      console.error("Error verifying payment and crediting wallet:", error);
      res.status(500).json({ error: error.message || "Failed to process wallet top-up" });
    }
  });

  // 4. BBPS RECHARGE & 1000-LEVEL ZERO-LOSS REVENUE SHARING ENGINE
  app.post("/api/recharge", async (req, res) => {
    try {
      const { userId, phone, operator, planName, amount } = req.body;
      if (!userId || !phone || !operator || !planName || !amount) {
        return res.status(400).json({ error: "All recharge parameters are required" });
      }

      const amountINR = Number(amount);
      const userRef = db.collection("users").doc(userId);
      let updatedUser: any = null;
      let rechargeResult: any = null;

      await db.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists) {
          throw new Error("User does not exist");
        }
        const userData = userDoc.data()!;
        const currentBalance = Number(userData.walletBalance || 0);

        if (currentBalance < amountINR) {
          throw new Error("Insufficient wallet balance in Alvon Pay.");
        }

        const newBalance = currentBalance - amountINR;

        // Calculate commission: 1 INR = 1000 Alvon Coins.
        // Let's assume commission is 5% of recharge amount.
        // Commission in Alvon Coins = amountINR * 0.05 * 1000 = amountINR * 50 coins.
        const totalCoins = Math.round(amountINR * 50);

        // Direct user gets a 50 coins cashback reward as well!
        const currentCoins = Number(userData.alvonCoins || 0);
        const newCoins = currentCoins + 50;

        transaction.update(userRef, {
          walletBalance: newBalance,
          alvonCoins: newCoins,
          activePlan: planName,
          dataUsed: 0,
          daysRemaining: 30
        });

        // Save recharge record without MLM 1000-level splitting logic
        const rechargeId = `BBPS-${Math.floor(100000 + Math.random() * 900000)}`;
        const rechargeRef = db.collection("recharges").doc(rechargeId);
        const rechargeData = {
          id: rechargeId,
          userId,
          phone,
          operator,
          planName,
          amount: amountINR,
          commissionCoins: totalCoins,
          status: "SUCCESS",
          timestamp: new Date().toISOString()
        };
        transaction.set(rechargeRef, rechargeData);

        // Add debit transaction log to ledger
        const txnId = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
        const txnRef = db.collection("transactions").doc(txnId);
        transaction.set(txnRef, {
          id: txnId,
          userId,
          title: `BBPS Recharge: ${planName} (${phone})`,
          type: "debit",
          asset: "wallet",
          amount: amountINR,
          category: "recharge",
          timestamp: new Date().toISOString()
        });

        rechargeResult = rechargeData;
      });

      const updatedDoc = await userRef.get();
      res.json({
        success: true,
        message: "Recharge successful! Premium 5G plan updated.",
        user: updatedDoc.data(),
        recharge: rechargeResult
      });
    } catch (error: any) {
      console.error("Error processing BBPS recharge:", error);
      res.status(500).json({ error: error.message || "Failed to process recharge" });
    }
  });

  // 5. GET RECENT BBPS RECHARGES WITH SPLIT LEDGER
  app.get("/api/recharges", async (req, res) => {
    try {
      const { userId } = req.query;
      const uid = (userId as string) || "jane-alvon";
      const snap = await db.collection("recharges").where("userId", "==", uid).get();
      const rechargesList = snap.docs.map((doc) => doc.data());
      res.json(rechargesList);
    } catch (error: any) {
      console.error("Error fetching BBPS recharges:", error);
      res.status(500).json({ error: error.message || "Failed to fetch recharges" });
    }
  });

  // 6. GET LEDGER TRANSACTIONS
  app.get("/api/transactions", async (req, res) => {
    try {
      const { userId } = req.query;
      const uid = (userId as string) || "jane-alvon";
      const snap = await db.collection("transactions").where("userId", "==", uid).get();
      const transactionsList = snap.docs.map((doc) => doc.data());
      // Sort by timestamp descending
      transactionsList.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      res.json(transactionsList);
    } catch (error: any) {
      console.error("Error fetching ledger transactions:", error);
      res.status(500).json({ error: error.message || "Failed to fetch ledger transactions" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
