import * as admin from 'firebase-admin';
import { Change, EventContext, firestore } from 'firebase-functions';
import { DocumentSnapshot } from 'firebase-functions/lib/providers/firestore';
import app from './app';
import FieldValue = admin.firestore.FieldValue;

export const maintainSessionWatched = firestore
  .document("events/{eventId}/requests/{requestId}")
  .onWrite(onRequestWrite);

async function onRequestWrite(change: Change<DocumentSnapshot>, context: EventContext) {
  const eventId = context.params["eventId"];
  const newData = change.after.exists ? change.after.data() : undefined;
  const oldData = change.before.exists ? change.before.data() : undefined;
  const newSessionId = newData !== undefined ? newData["sessionId"] : undefined;
  const oldSessionId = oldData !== undefined ? oldData["sessionId"] : undefined;
  if (newSessionId !== undefined && newSessionId === oldSessionId) {
    const oldRequestWatched: boolean = oldData["watched"];
    const newRequestWatched: boolean = newData["watched"];
    if (!oldRequestWatched && newRequestWatched) {  // unwatched -> watched
      await updateSessionWatched(newSessionId, eventId, true);
    } else if (oldRequestWatched && !newRequestWatched) { // watched -> unwatched
      await updateSessionWatched(newSessionId, eventId, false);
    }
  } else {
    if (oldSessionId !== undefined) {
      const oldRequestWatched: boolean = oldData["watched"];
      if (oldRequestWatched) {  // watched -> unwatched
        await updateSessionWatched(oldSessionId, eventId, false);
      }
    }

    if (newSessionId !== undefined) {
      const newRequestWatched: boolean = newData["watched"];
      if (newRequestWatched) {  // unwatched -> watched
        await updateSessionWatched(newSessionId, eventId, true);
      }
    }
  }
}

async function updateSessionWatched(sessionId: string, eventId: string, watched: boolean) {
  const db = app.firestore();
  const session = db.collection("sessions").doc(sessionId);
  await db.runTransaction(async (transaction) => {
    const sessionDocument = await transaction.get(session);
    if (sessionDocument.exists) {
      const data = sessionDocument.data();
      const watchedOn: {[key: string]: number} = data["watchedOn"] || {}
      const prevNum = watchedOn[eventId] || 0;
      if (watched) {
        watchedOn[eventId] = prevNum + 1;
      } else {
        const newNum = prevNum - 1;
        if (newNum > 0) {
          watchedOn[eventId] = newNum;
        } else {
          delete watchedOn[eventId];
        }
      }
      const refCount = Object.keys(watchedOn).length;

      transaction.update(session, {
        watched: refCount > 0,
        watchedOn: refCount > 0 ? watchedOn : FieldValue.delete()
      });
    }
  })
}
