const webPush = require('web-push');

// VAPID keys should be generated only once and kept secure
const vapidKeys = webPush.generateVAPIDKeys();

webPush.setVapidDetails(
  'mailto:your-email@example.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

const subscriptions = []; // This should be replaced with a database or persistent storage

/**
 * Add a new subscription
 * @param {Object} subscription - The subscription object from the client
 */
function addSubscription(subscription) {
  subscriptions.push(subscription);
}

/**
 * Send a notification to all subscribers
 * @param {string} message - The message to send
 */
function sendNotification(message) {
  subscriptions.forEach((subscription) => {
    webPush.sendNotification(subscription, message).catch((error) => {
      console.error('Error sending notification:', error);
    });
  });
}

module.exports = {
  addSubscription,
  sendNotification,
  vapidKeys,
};
