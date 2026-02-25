import Notification from "@/Models/Notification";
import User from "@/Models/User";

/**
 * Sirf Push Notification bhejta hai (existing notification update ke liye)
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

        const ModelToUse = targetModel === "User" ? User : (await import("@/Models/Agent")).default;
        const recipients = await ModelToUse.find(query).select("pushTokens");
        const allTokens = recipients.flatMap(u => u.pushTokens || []);

        if (allTokens.length > 0) {
            const messages = allTokens.map(token => ({
                to: token,
                sound: 'default',
                title: title,
                body: message,
                data: metadata,
            }));

            await fetch('https://exp.host/--/api/v2/push/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(messages),
            });
            return true;
        }
        return false;
    } catch (error) {
        console.error("Pulse Send Error:", error);
        return false;
    }
}

/**
 * Ye function DB mein notification save karega aur Push Notification bhi bhejega
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
        const newNotif = await Notification.create({
            title,
            message,
            type,
            targetType,
            targetUsers,
            targetModel: targetType === "specific" ? targetModel : undefined,
            isActive: true
        });

        await sendPushToUsers({
            title,
            message,
            targetType,
            targetUsers,
            targetModel,
            metadata: { ...metadata, notificationId: newNotif._id }
        });

        return newNotif;
    } catch (error) {
        console.error("Notification Helper Error:", error);
    }
}