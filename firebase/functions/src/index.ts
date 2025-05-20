import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

// HTTP Callable Function (for client-side calls like from admin-web or LIFF)
export const submitShiftRequest = functions.region("asia-northeast1") // Example: Tokyo region
  .https.onCall(async (data, context) => {
    // Check authentication (optional, but recommended)
    // if (!context.auth) {
    //   throw new functions.https.HttpsError(
    //     "unauthenticated", 
    //     "The function must be called while authenticated."
    //   );
    // }

    const userId = context.auth?.uid || data.userId || "anonymous"; // Get user ID
    const shiftData = data.shift; // Expect shift data in { date: string, startTime: string, endTime: string, type: 'preference' | 'fixed' ...}

    functions.logger.info(`Received shift submission from ${userId}:`, shiftData);

    if (!shiftData || !shiftData.date) {
      throw new functions.https.HttpsError(
        "invalid-argument", 
        "The function must be called with a 'shift' argument containing a 'date'."
      );
    }

    try {
      // Example: Save to Firestore
      // Make sure your Firestore path is structured according to your design in 実装.md
      const docRef = await admin.firestore()
        .collection("users")
        .doc(userId)
        .collection("shiftRequests")
        .add({
          ...shiftData,
          submittedAt: admin.firestore.FieldValue.serverTimestamp(),
          status: "pending", // Initial status
        });
      
      functions.logger.info(`Shift request for ${userId} stored with ID: ${docRef.id}`);
      return { success: true, message: "Shift request submitted successfully!", docId: docRef.id };
    } catch (error) {
      functions.logger.error("Error storing shift request:", error);
      throw new functions.https.HttpsError("internal", "Error storing shift request.", error);
    }
  });

// Firestore Trigger Function (example: when a new shift request is created)
export const onShiftRequestCreated = functions.region("asia-northeast1")
  .firestore.document("users/{userId}/shiftRequests/{requestId}")
  .onCreate(async (snap, context) => {
    const newValue = snap.data();
    const userId = context.params.userId;
    const requestId = context.params.requestId;

    functions.logger.log(
      `New shift request [${requestId}] created for user [${userId}]:`,
      newValue
    );

    // TODO: Implement further actions, e.g., send a notification to admin, data validation etc.
    // Example: Send a notification (pseudo-code)
    // await sendNotificationToAdmin(userId, newValue);

    return null;
  });

// Simple HTTP GET endpoint for testing
export const helloTokyo = functions.region("asia-northeast1")
  .https.onRequest((request, response) => {
    functions.logger.info("Hello Tokyo logs!", { structuredData: true });
    response.send("Hello from Firebase Functions in Tokyo!");
  });

