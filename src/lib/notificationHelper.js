// src/lib/notificationHelper.js
import Notification from "@/Models/Notification";
import User from "@/Models/User";

/**
 * FCM ke zariye notification bhejta hai (Firebase Cloud Messaging)
 * Ye direct FCM token pe kaam karta hai — real-time delivery
 */
async function sendViaFCM(tokens, title, body, data = {}) {
    try {
        // Dynamic import — server build mein missing module se bachao
        const admin = await import('firebase-admin');

        // Agar already initialized nahi to initialize karo
        if (admin.default.apps.length === 0) {
            const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
            if (!process.env.FIREBASE_PROJECT_ID || !privateKey || !process.env.FIREBASE_CLIENT_EMAIL) {
                console.warn('⚠️ Firebase env variables missing, skipping FCM');
                return false;
            }
            admin.default.initializeApp({
                credential: admin.default.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    privateKey,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                }),
            });
        }

        const messaging = admin.default.messaging();

        // FCM tokens (ExpoToken se alag hain — ye native Android/iOS tokens hain)
        const fcmTokens = tokens.filter(t => t && !t.startsWith('ExponentPushToken'));
        // Expo Tokens
        const expoTokens = tokens.filter(t => t && t.startsWith('ExponentPushToken'));

        let fcmSent = false;
        let expoSent = false;

        // 1. FCM ke zariye bhejo (Android native tokens)
        if (fcmTokens.length > 0) {
            const message = {
                notification: {
                    title: title,
                    body: body,
                },
                data: Object.fromEntries(
                    Object.entries(data).map(([k, v]) => [k, String(v)])
                ),
                android: {
                    priority: 'high',
                    notification: {
                        sound: 'default',
                        channelId: 'default',
                        priority: 'max',
                        visibility: 'public',
                    },
                },
                tokens: fcmTokens,
            };

            const response = await messaging.sendEachForMulticast(message);
            console.log(`✅ FCM sent: ${response.successCount}/${fcmTokens.length} tokens`);
            if (response.failureCount > 0) {
                response.responses.forEach((resp, i) => {
                    if (!resp.success) {
                        console.error(`❌ FCM token ${fcmTokens[i]} failed:`, resp.error?.message);
                    }
                });
            }
            fcmSent = response.successCount > 0;
        }

        // 2. Expo Push API ke zariye bhejo (ExponentPushToken wale)
        if (expoTokens.length > 0) {
            const messages = expoTokens.map(token => ({
                to: token,
                sound: 'default',
                title,
                body,
                data,
                priority: 'high',
                channelId: 'default',
            }));

            const res = await fetch('https://exp.host/--/api/v2/push/send', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Accept-Encoding': 'gzip, deflate',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(messages),
            });

            const result = await res.json();
            console.log(`✅ Expo Push sent to ${expoTokens.length} token(s)`);

            // Check for errors
            if (result.data) {
                result.data.forEach((item, i) => {
                    if (item.status === 'error') {
                        console.error(`❌ Expo token error for ${expoTokens[i]}:`, item.message);
                    }
                });
            }
            expoSent = true;
        }

        return fcmSent || expoSent;

    } catch (error) {
        console.error('❌ Push send error:', error.message);

        // FCM fail hua to Expo API fallback
        try {
            console.log('🔄 Fallback: Expo Push API try kar rahe hain...');
            const messages = tokens.map(token => ({
                to: token,
                sound: 'default',
                title,
                body,
                data,
                priority: 'high',
            }));

            await fetch('https://exp.host/--/api/v2/push/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(messages),
            });
            console.log('✅ Expo fallback success');
            return true;
        } catch (fallbackError) {
            console.error('❌ Expo fallback bhi fail:', fallbackError.message);
            return false;
        }
    }
}

/**
 * Users ko push notification bhejta hai
 * FCM + Expo Push dono support karta hai
 */
export async function sendPushToUsers({
    title,
    message,
    targetType,
    targetUsers,
    targetModel = "Agent",
    metadata = {}
}) {
    try {
        let query = {};
        if (targetType === "all" || targetType === "agent") {
            query = { isActive: true };
        } else {
            query = { _id: { $in: targetUsers } };
        }

        const ModelToUse = targetModel === "User"
            ? User
            : (await import("@/Models/Agent")).default;

        const recipients = await ModelToUse.find(query).select("pushTokens");
        const allTokens = recipients.flatMap(u => u.pushTokens || []);

        if (allTokens.length === 0) {
            console.log('⚠️ Koi push token nahi mila');
            return false;
        }

        console.log(`📤 Sending to ${allTokens.length} token(s) via FCM/Expo...`);
        return await sendViaFCM(allTokens, title, message, metadata);

    } catch (error) {
        console.error("❌ sendPushToUsers Error:", error);
        return false;
    }
}

/**
 * DB mein notification save karo aur push bhi bhejo
 */
export async function createAndSendNotification({
    title,
    message,
    type = "info",
    targetType = "specific",
    targetUsers = [],
    targetModel = "Agent",
    metadata = {},
}) {
    try {
        // DB mein save karo
        const newNotif = await Notification.create({
            title,
            message,
            type,
            targetType,
            targetUsers,
            targetModel: targetType === "specific" ? targetModel : undefined,
            isActive: true
        });

        // Push notification bhejo
        await sendPushToUsers({
            title,
            message,
            targetType,
            targetUsers,
            targetModel,
            metadata: { ...metadata, notificationId: String(newNotif._id) }
        });

        return newNotif;
    } catch (error) {
        console.error("❌ createAndSendNotification Error:", error);
    }
}