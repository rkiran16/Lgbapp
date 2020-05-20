const { Expo } =  require('expo-server-sdk');
let expo = new Expo();
let validToken = [];
let tickets = [];
let messages = [];
let validTokens;
const inValidTokens = []

module.exports = {
    pushNotify: async (somePushTokens, bodyText, subtitle, title, actionData, data) => {
        for (let pushToken of somePushTokens) {
            if (!Expo.isExpoPushToken(pushToken.notificationtoken)) {
                inValidTokens.push('invalid')
                continue;
            }
            messages.push({
                to: pushToken.notificationtoken,
                title: title,
                subtitle: subtitle,
                icon: 'http://1611917f.ngrok.io/uploads/icon.png',
                sound: 'default',
                _displayInForeground: true,
                priority: 'high',
                body: bodyText,
                data: { action:'Chat', data:data, title:title,},
            });
        }

        let chunks = expo.chunkPushNotifications(messages);
        for (let chunk of chunks) {
            try {
                let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                console.log(ticketChunk)
                tickets.push(...ticketChunk);
            } catch (error) {
                console.error(error);
            }
        }
        console.log(tickets);
        return ({tickets: tickets, validTokens: inValidTokens.length});
    }
}
