const debug = false;

// ---------------- NEW v2 IMPORTS ----------------
const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
// Firestore v2 trigger
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");

// Initialize admin SDK if not already initialized
if (!admin.apps || !admin.apps.length) {
    admin.initializeApp();
}

// Verifies the Firebase ID token in the Authorization header.
// Works for both full accounts and anonymous sessions.
async function requireFirebaseAuth(req, res, next) {
    const token = req.headers.authorization?.split("Bearer ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    try {
        await admin.auth().verifyIdToken(token);
        next();
    } catch {
        res.status(401).json({ error: "Invalid token" });
    }
}

const express = require("express");
const cors = require("cors");

// ✅ Brevo v2 SDK
const { TransactionalEmailsApi, SendSmtpEmail } = require("@getbrevo/brevo");

// ✅ Secrets
const brevoKey = defineSecret("BREVO_KEY");
const speedyUser = defineSecret("SPEEDY_USER");
const speedyPass = defineSecret("SPEEDY_PASS");

const app = express();

// ✅ Enable CORS + JSON
app.use(cors({ origin: true }));
app.use(express.json());
// If you don’t need static, you can remove this:
app.use(express.static("public"));

// -----------------------------------------------------------------------------
// Speedy Proxy
// -----------------------------------------------------------------------------
app.post("/speedy/office", async (req, res) => {
    try {
        const { name } = req.body;
        if (debug) console.log("[SpeedyProxy] Search term:", name);

        const speedyRes = await fetch("https://api.speedy.bg/v1/location/office", {
            method: "POST",
            headers: { "Content-Type": "application/json; charset=utf-8" },
            body: JSON.stringify({
                userName: speedyUser.value(),
                password: speedyPass.value(),
                countryId: 100,
                name,
                limit: 15,
            }),
        });

        if (!speedyRes.ok) {
            throw new Error(`Speedy API error: ${speedyRes.status}`);
        }

        const data = await speedyRes.json();
        if (debug) console.log("[SpeedyProxy] Response OK");
        res.status(200).json(data);
    } catch (err) {
        console.error("[SpeedyProxy] Error:", err);
        res.status(500).json({ error: "Failed to fetch from Speedy" });
    }
});

// -----------------------------------------------------------------------------
// Brevo Email Integration
// -----------------------------------------------------------------------------
app.post("/send-confirmation", requireFirebaseAuth, async (req, res) => {
    if (debug) console.log("[Brevo] Incoming:", req.body);

    const { to, cc, bcc, subject, html } = req.body;

    if (!to || !subject || !html) {
        return res.status(400).json({ error: "Missing to, subject, or html" });
    }

    try {
        const key = brevoKey.value(); // ✅ get secret
        if (!key) throw new Error("Brevo API key not found");

        const emailAPI = new TransactionalEmailsApi();
        emailAPI.authentications.apiKey.apiKey = key;

        // ✅ Helper to normalize email inputs
        const normalizeEmails = (value) => {
            if (!value) return [];

            // Already in Brevo object format
            if (Array.isArray(value) && typeof value[0] === "object") return value;

            // Array of strings
            if (Array.isArray(value)) {
                return value.map((e) => ({ email: e }));
            }

            // Single string
            if (typeof value === "string") return [{ email: value }];

            return [];
        };

        // ✅ Build the message
        const message = new SendSmtpEmail();
        message.sender = { name: "НЕВЪЗМОЖЕН", email: "support@nevyzmojen.com" };
        message.to = normalizeEmails(to);
        const ccList = normalizeEmails(cc);
        if (ccList.length) message.cc = ccList;
        const bccList = normalizeEmails(bcc);
        if (bccList.length) message.bcc = bccList;
        message.subject = subject;
        message.htmlContent = html;

        if (debug) console.log("[Brevo] Sending email:", JSON.stringify(message, null, 2));

        const response = await emailAPI.sendTransacEmail(message);
        if (debug) console.log("[Brevo] Success:", response);

        res.status(200).json({
            success: true,
            messageId: response.messageId || null,
        });
    } catch (error) {
        console.error("[Brevo] Error:", error);
        res.status(500).json({
            error: "Email send failed",
            details: error.message,
        });
    }
});

// -----------------------------------------------------------------------------
// Export Express app as v2 function
// -----------------------------------------------------------------------------
exports.api = onRequest(
    { secrets: [brevoKey, speedyUser, speedyPass] },
    app,
);
// to deploy functions added above run this in terminal: firebase deploy --only functions
// ensure secrets are set with: firebase functions:secrets:set BREVO_KEY="your_brevo_key"
// -----------------------------------------------------------------------------

// Firestore trigger: fires when a new order document is created.
// Does two things in one invocation:
//   1. Writes server-generated timestamps back to the order document.
//   2. Appends the order ID to the owning user's /users/{uid}/orders array
//      (skipped for anonymous orders where no /users doc exists).
//      This runs via the Admin SDK so it bypasses Firestore security rules —
//      the client is intentionally blocked from writing the orders array directly.
exports.setOrderTimestamps = onDocumentCreated("orders/{orderId}", async (event) => {
    const orderId = event?.params?.orderId;
    const docPath = event.data?.ref?.path || `orders/${orderId}`;

    // ── 1. Write server timestamps to the order ──────────────────────────────
    try {
        const orderRef = admin.firestore().doc(docPath);
        const nowMs = Date.now();
        await orderRef.update({
            server_generated_timestamp: nowMs,
            server_generated_datetime: new Date(nowMs).toISOString(),
        });
        if (debug) console.log(`setOrderTimestamps: timestamps written to ${docPath}`);
    } catch (err) {
        console.error("setOrderTimestamps: error writing timestamps:", err);
    }

    // ── 2. Append order ID to the user's orders array ────────────────────────
    try {
        const orderData = event.data?.data();
        const userId = orderData?.created_by_user_id;

        if (!userId) {
            if (debug) console.log("setOrderTimestamps: no created_by_user_id, skipping user orders update");
            return;
        }

        const userRef = admin.firestore().doc(`users/${userId}`);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            // Anonymous users place orders but have no /users doc — this is expected
            if (debug) console.log(`setOrderTimestamps: no user doc for ${userId} (anonymous order), skipping`);
            return;
        }

        await userRef.update({
            orders: admin.firestore.FieldValue.arrayUnion(orderId),
        });
        if (debug) console.log(`setOrderTimestamps: appended ${orderId} to user ${userId} orders array`);
    } catch (err) {
        console.error("setOrderTimestamps: error updating user orders array:", err);
    }
});
// ---------------- END NEW v2 IMPORTS ----------------
