// src/lib/firebase.js
// Firebase Admin SDK - Server Side Only (Next.js backend)

import admin from 'firebase-admin';

/**
 * Firebase Admin SDK singleton
 * Environment variables se credentials lete hain (secure)
 */
function getFirebaseAdmin() {
    // Agar already initialized hai to return kar do
    if (admin.apps.length > 0) {
        return admin.app();
    }

    try {
        const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

        if (!process.env.FIREBASE_PROJECT_ID || !privateKey || !process.env.FIREBASE_CLIENT_EMAIL) {
            console.error('❌ Firebase Admin SDK credentials missing in .env');
            return null;
        }

        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                privateKey: privateKey,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            }),
        });

        console.log('✅ Firebase Admin SDK initialized');
        return admin.app();

    } catch (error) {
        console.error('❌ Firebase Admin SDK init error:', error.message);
        return null;
    }
}

export const firebaseAdmin = getFirebaseAdmin();
export const fcmMessaging = firebaseAdmin ? admin.messaging() : null;
