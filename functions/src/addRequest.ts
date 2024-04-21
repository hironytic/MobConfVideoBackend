import * as admin from "firebase-admin";
import {onCall, HttpsError, CallableRequest} from "firebase-functions/v2/https";
import {logger} from "firebase-functions/v2";
import app from "./app";
import Timestamp = admin.firestore.Timestamp;

interface IRequestData {
  requestedAt: Timestamp;
  sessionId?: string;
  title: string;
  conference: string;
  minutes: number;
  video: string;
  slide?: string;
  memo?: string;
  watched: boolean;
}

interface ISessionData {
  conferenceId: string;
  title: string;
  description: string;
  starts: Timestamp;
  minutes: number;
  slide?: string;
  video: string;
}

interface IConferenceData {
  name: string;
}

const errorInvalidParameter = "invalid_parameter";
const errorInvalidRequestkey = "invalid_request_key";
const errorInvalidSession = "invalid_session";
const errorInternalError = "internal_error";

interface IAddRequestFromSessionData {
  requestKey: string;
  sessionId: string;
  memo?: string;
}

export const addRequestFromSession = onCall(async (
  {data}: CallableRequest<IAddRequestFromSessionData>,
): Promise<void> => {
  if (!data.requestKey || !data.sessionId) {
    throw new HttpsError(
      "invalid-argument",
      "Either a request key or session id must be specified.",
      errorInvalidParameter
    );
  }

  const db = app.firestore();
  const eventId = await getEventIdForRequestKey(db, data.requestKey);

  const sessionRef = await db.collection("sessions").doc(data.sessionId).get();
  if (!sessionRef.exists) {
    logger.info(`session not found: ${data.sessionId}`);
    throw new HttpsError(
      "not-found",
      "Session not found.",
      errorInvalidSession);
  }
  const session = sessionRef.data() as ISessionData;

  const conferenceRef = await db
    .collection("conferences")
    .doc(session.conferenceId)
    .get();
  if (!conferenceRef.exists) {
    logger.error(`conference not found: ${session.conferenceId}`);
    throw new HttpsError(
      "internal",
      "Conference not found.",
      errorInternalError
    );
  }
  const conference = conferenceRef.data() as IConferenceData;

  const requestData: IRequestData = {
    requestedAt: Timestamp.now(),
    sessionId: data.sessionId,
    title: session.title,
    conference: conference.name,
    minutes: session.minutes,
    video: session.video,
    memo: data.memo || "",
    watched: false,
  };
  if (session.slide) {
    requestData.slide = session.slide;
  }

  await db
    .collection("events")
    .doc(eventId)
    .collection("requests")
    .add(requestData);
});

interface IAddRequestWithoutSessionData {
  requestKey: string;
  title: string;
  conference: string;
  minutes: number;
  video: string;
  slide?: string;
  memo?: string;
}

export const addRequestWithoutSession = onCall(async (
  {data}: CallableRequest<IAddRequestWithoutSessionData>,
): Promise<void> => {
  if (!data.requestKey || !data.title || !data.conference || !data.video) {
    throw new HttpsError(
      "invalid-argument",
      "Either a request key, title, conference, or video must be specified.",
      errorInvalidParameter);
  }

  const db = app.firestore();
  const eventId = await getEventIdForRequestKey(db, data.requestKey);

  const requestData: IRequestData = {
    requestedAt: Timestamp.now(),
    title: data.title,
    conference: data.conference,
    minutes: data.minutes,
    video: data.video,
    memo: data.memo || "",
    watched: false,
  };
  if (data.slide) {
    requestData.slide = data.slide;
  }

  await db
    .collection("events")
    .doc(eventId)
    .collection("requests")
    .add(requestData);
});

/**
 * Retrieve the event ID for the given request key.
 * @param {FirebaseFirestore.Firestore} db database
 * @param {string} requestKey request key
 * @return {Promise<string>} event ID
 */
async function getEventIdForRequestKey(
  db: FirebaseFirestore.Firestore,
  requestKey: string,
): Promise<string> {
  const privateRef = await db.collection("config").doc("private").get();
  if (!privateRef.exists) {
    logger.error("config/private not found");
    throw new HttpsError(
      "failed-precondition",
      "Configuration (config/private) not found in database.",
      errorInvalidRequestkey
    );
  }
  const requestKeys = privateRef.data()
    ?.["requestKeys"] as { [key: string]: string } | undefined;
  if (requestKeys === undefined) {
    logger.error("requestKeys not found");
    throw new HttpsError(
      "failed-precondition",
      "Configuration (config/private/requestKeys) not found in database.",
      errorInvalidRequestkey
    );
  }
  const eventId = requestKeys[requestKey];
  if (eventId === undefined) {
    logger.info("invalid request key");
    throw new HttpsError(
      "permission-denied",
      "Invalid request key.",
      errorInvalidRequestkey
    );
  }

  return eventId;
}
