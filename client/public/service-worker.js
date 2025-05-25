// service-worker.js
// This file enables push notifications and handles notification events



self.addEventListener('push', function(event) {
  console.log('Push event received:', event);
  let data = {};
  if (event.data) {
    data = event.data.json();
  }
  // Always show the content as the notification body, but use a generic title
  const title = 'MemoryMate Reminder';
  const actions = [];
  if (data.type === 'dueDate') {
    actions.push(
      {action: 'complete', title: 'Mark as Complete'},
      {action: 'postpone', title: 'Postpone'}
    );
  } else if (data.type === 'reminder') {
    actions.push(
      {action: 'view', title: 'View on Dashboard'}
    );
  }
  const options = {
    body: data.content || data.body || 'You have a new reminder or task due!',
    icon: '/logo192.png',
    badge: '/logo192.png',
    data: data,
    actions: actions
  };
  console.log('Notification options:', options);
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const data = event.notification.data;
  if (event.action === 'complete') {
    // Use full backend URL
    event.waitUntil(
      fetch('https://localhost:3000/entries/' + (data.id || data.entryId), {method: 'DELETE'})
    );
  } else if (event.action === 'postpone') {
    event.waitUntil(clients.openWindow('/dashboard?postpone=' + (data.id || data.entryId)));
  } else if (event.action === 'view') {
    event.waitUntil(clients.openWindow('/dashboard?entry=' + (data.id || data.entryId)));
  } else {
    event.waitUntil(clients.openWindow('/dashboard'));
  }
});
