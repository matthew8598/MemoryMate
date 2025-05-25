const webPush = require('web-push');



// VAPID keys storage logic
const fs = require('fs');
const path = require('path');
const vapidPath = path.join(__dirname, '../storage/vapid.json');

function loadVapidKeys() {
  let keys;

  // If vapid.json exists
  if (fs.existsSync(vapidPath)) {
    try {
      const file = fs.readFileSync(vapidPath, 'utf8');
      const json = JSON.parse(file);
      if (json.publicKey && json.privateKey) {
        return json;
      } else {
        console.warn('vapid.json is invalid or incomplete. Regenerating keys...');
      }
    } catch (e) {
      console.warn('Failed to read or parse vapid.json. Regenerating keys...');
    }
  }

  // If no valid keys found or error occurred, generate new ones
  keys = webPush.generateVAPIDKeys();
  fs.writeFileSync(vapidPath, JSON.stringify(keys, null, 2));
  console.log('Generated new VAPID keys and saved to storage/vapid.json');
  return keys;
}

const vapidKeys = loadVapidKeys();

webPush.setVapidDetails(
  'mailto:your-email@example.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);



// Persistent subscriptions storage
const subscriptionsPath = path.join(__dirname, '../storage/subscriptions.json');

function loadSubscriptions() {
  if (fs.existsSync(subscriptionsPath)) {
    try {
      const file = fs.readFileSync(subscriptionsPath, 'utf8');
      const json = JSON.parse(file);
      if (Array.isArray(json)) {
        return json;
      } else {
        throw new Error('subscriptions.json is not an array');
      }
    } catch (e) {
      throw new Error('Failed to read or parse subscriptions.json: ' + e.message);
    }
  } else {
    fs.writeFileSync(subscriptionsPath, '[]');
    return [];
  }
}

function saveSubscriptions(subscriptions) {
  fs.writeFileSync(subscriptionsPath, JSON.stringify(subscriptions, null, 2));
}

let subscriptions = loadSubscriptions();


/**
 * Add a new subscription
 * @param {Object} subscription - The subscription object from the client
 */
function addSubscription(subscription) {
  // Prevent duplicate subscriptions
  if (!subscriptions.find(sub => sub.endpoint === subscription.endpoint)) {
    subscriptions.push(subscription);
    saveSubscriptions(subscriptions);
    console.log('Added new subscription:', subscription.endpoint);
  } else {
    console.log('Subscription already exists:', subscription.endpoint);
  }
}


/**
 * Send a notification to all subscribers
 * @param {string} message - The message to send (should be a stringified JSON)
 */
function sendNotification(message) {
  // Reload subscriptions in case of external changes
  subscriptions = loadSubscriptions();
  let changed = false;
  subscriptions.forEach((subscription, idx) => {
    webPush.sendNotification(subscription, message).catch((error) => {
      if (error.statusCode === 410 || error.statusCode === 404) {
        // Remove expired subscription
        subscriptions.splice(idx, 1);
        changed = true;
      }
      console.error('Error sending notification:', error);
    });
  });
  if (changed) {
    saveSubscriptions(subscriptions);
  }
}

module.exports = {
  addSubscription,
  sendNotification,
  vapidKeys,
};
