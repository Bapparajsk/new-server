import admin from 'firebase-admin';
import ServiceAccount from '../../firebaseServiceAccountKey.json';

admin.initializeApp({
  credential: admin.credential.cert(ServiceAccount as admin.ServiceAccount),
});

export const messaging = admin.messaging();
