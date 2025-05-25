// pushNotifications.js
// Handles push notification subscription and registration

const PUBLIC_VAPID_KEY = 'BJ8ad1bIrJlmS-lNr83Faf0vTG0uLMTlveWEbMMwDjK687j4JCrS6gf0BzVEqv5J1JvrlP4yFaeRIIW-1xrTUWE'; 
export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    return await navigator.serviceWorker.register('/service-worker.js');
  }
  throw new Error('Service workers are not supported in this browser.');
}

export async function subscribeUserToPush() {
  const registration = await registerServiceWorker();
  if (!registration.pushManager) {
    throw new Error('Push manager unavailable.');
  }
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
  });
  // Send subscription to server
  await fetch('https://localhost:3000/reminders/subscribe', {
    method: 'POST',
    body: JSON.stringify(subscription),
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return subscription;
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
