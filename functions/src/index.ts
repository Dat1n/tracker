import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

export const getUserByEmail = functions.https.onRequest(async (req, res) => {
  const email = req.query.email as string;

  if (!email) {
    res.status(400).json({ error: "Email is required" });
    return; // stop further execution
  }

  try {
    const user = await admin.auth().getUserByEmail(email);
    res.json({ uid: user.uid, displayName: user.displayName || "" });
  } catch (err) {
    console.error(err);
    res.status(404).json({ error: "User not found" });
  }
});
