import * as admin from "firebase-admin";
import {onDocumentWritten} from "firebase-functions/v2/firestore";
import app from "./app";
import FieldValue = admin.firestore.FieldValue;

export const maintainSessionWatched = onDocumentWritten(
  "events/{eventId}/requests/{requestId}",
  async ({data, params}) => {
    const eventId = params["eventId"];
    const newData = data?.after.exists ? data.after.data() : undefined;
    const oldData = data?.before.exists ? data.before.data() : undefined;
    const newSessionId = newData?.["sessionId"];
    const oldSessionId = oldData?.["sessionId"];
    if (newSessionId !== undefined && newSessionId === oldSessionId) {
      const oldRequestWatched: boolean = oldData?.["watched"] ?? false;
      const newRequestWatched: boolean = newData?.["watched"] ?? false;
      if (!oldRequestWatched && newRequestWatched) {
        // unwatched -> watched
        await updateSessionWatched(newSessionId, eventId, true);
      } else if (oldRequestWatched && !newRequestWatched) {
        // watched -> unwatched
        await updateSessionWatched(newSessionId, eventId, false);
      }
    } else {
      if (oldSessionId !== undefined) {
        const oldRequestWatched: boolean = oldData?.["watched"] ?? false;
        if (oldRequestWatched) {
          // watched -> unwatched
          await updateSessionWatched(oldSessionId, eventId, false);
        }
      }

      if (newSessionId !== undefined) {
        const newRequestWatched: boolean = newData?.["watched"] ?? false;
        if (newRequestWatched) {
          // unwatched -> watched
          await updateSessionWatched(newSessionId, eventId, true);
        }
      }
    }
  },
);

/**
 * Update session watched status
 * @param {string} sessionId session id
 * @param {string} eventId  event id
 * @param {boolean} watched watched status
 */
async function updateSessionWatched(
  sessionId: string,
  eventId: string,
  watched: boolean,
) {
  const db = app.firestore();
  const session = db.collection("sessions").doc(sessionId);
  await db.runTransaction(async (transaction) => {
    const sessionDocument = await transaction.get(session);
    if (sessionDocument.exists) {
      const data = sessionDocument.data();
      const watchedOn: Record<string, number> = data?.["watchedOn"] ?? {};
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
        watchedOn: refCount > 0 ? watchedOn : FieldValue.delete(),
      });
    }
  });
}
