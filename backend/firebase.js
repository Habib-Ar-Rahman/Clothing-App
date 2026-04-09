const admin = require('firebase-admin');
const config = require('./config');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  const serviceAccount = {
    type: "service_account",
    project_id: config.FIREBASE_PROJECT_ID,
    private_key: config.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: config.FIREBASE_CLIENT_EMAIL,
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: config.FIREBASE_PROJECT_ID
  });
}

const db = admin.firestore();

module.exports = { admin, db };