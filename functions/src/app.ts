import * as admin from 'firebase-admin';

const app = admin.initializeApp();
admin.firestore(app).settings({
  timestampsInSnapshots: true,
});

export default app;
