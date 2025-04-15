
/**
 * Project: 3D Map Generator
 * Description: A web app for creating and exporting 3D maps with customizable objects and a payment system.
 * Author: Najy Fannoun
 * Developed By: Najy Fannoun
 * Version: 1.0.0
 * Date: April 2025
 * Copyright: © 2025 Najy Fannoun. All rights reserved.
 */


const {
  onDocumentCreated,
} = require("firebase-functions/v2/firestore");
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");

// Initialize Firebase Admin SDK
initializeApp();
const db = getFirestore();

// 🧾 Deduct balance when a new order is added
exports.deductBalanceOnOrder = onDocumentCreated(
    "orders/{orderId}",
    async (event) => {
      const orderData = event.data.data();
      const userId = orderData.userId;
      const price = orderData.price;

      const userRef = db.collection("users").doc(userId);
      const userSnap = await userRef.get();

      if (!userSnap.exists) {
        console.error("User not found:", userId);
        return;
      }

      const currentBalance = userSnap.data().balance || 0;

      if (currentBalance < price) {
        console.warn(`User ${userId} has insufficient balance.`);
        return;
      }

      await userRef.update({
        balance: currentBalance - price,
      });

      console.log(
          `Deducted ${price} credits from ${userId}. New balance: ${
            currentBalance - price
          }`,
      );
    },
);

// 💳 Add balance when a balance request is created
exports.addBalanceOnRequest = onDocumentCreated(
    "balancerequest/{requestId}",
    async (event) => {
      const requestData = event.data.data();
      const userId = requestData.userId;
      const creditsToAdd = requestData.credits;

      const userRef = db.collection("users").doc(userId);
      const userSnap = await userRef.get();

      if (!userSnap.exists) {
        console.error("User not found:", userId);
        return;
      }

      const currentBalance = userSnap.data().balance || 0;

      await userRef.update({
        balance: currentBalance + creditsToAdd,
      });

      console.log(
          `Added ${creditsToAdd} credits to ${userId}. New balance: ${
            currentBalance + creditsToAdd
          }`,
      );
    },
);

