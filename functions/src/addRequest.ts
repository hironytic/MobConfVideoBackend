import * as admin from 'firebase-admin';
import { https } from 'firebase-functions';
import { CallableContext } from 'firebase-functions/lib/providers/https';
import app from './app';
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

export const addRequestFromSession = https.onCall(onAddRequestFromSessionCalled);

async function onAddRequestFromSessionCalled(data: IAddRequestFromSessionData, context: CallableContext): Promise<void> {
  if (!data.requestKey || !data.sessionId) {
    throw new https.HttpsError("invalid-argument", undefined, errorInvalidParameter);
  }

  const db = app.firestore();
  const eventId = await getEventIdForRequestKey(db, data.requestKey);

  const sessionRef = await db.collection("sessions").doc(data.sessionId).get();
  if (!sessionRef.exists) {
    console.log(`session not found: ${data.sessionId}`);
    throw new https.HttpsError("not-found", undefined, errorInvalidSession);
  }
  const session = sessionRef.data() as ISessionData;

  const conferenceRef = await db.collection("conferences").doc(session.conferenceId).get();
  if (!conferenceRef.exists) {
    console.log(`conference not found: ${session.conferenceId}`);
    throw new https.HttpsError("internal", undefined, errorInternalError);
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

  await db.collection("events").doc(eventId).collection("requests").add(requestData);
}

interface IAddRequestWithoutSessionData {
  requestKey: string;
  title: string;
  conference: string;
  minutes: number;
  video: string;
  slide?: string;
  memo?: string;
}

export const addRequestWithoutSession = https.onCall(onAddRequestWithoutSessionCalled);

async function onAddRequestWithoutSessionCalled(data: IAddRequestWithoutSessionData, context: CallableContext): Promise<void> {
  if (!data.requestKey || !data.title || !data.conference || !data.video) {
    throw new https.HttpsError("invalid-argument", undefined, errorInvalidParameter);
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

  await db.collection("events").doc(eventId).collection("requests").add(requestData);
}

async function getEventIdForRequestKey(db: FirebaseFirestore.Firestore, requestKey: string): Promise<string> {
  const privateRef = await db.collection("config").doc("private").get();
  if (!privateRef.exists) {
    console.log("config/private not found");
    throw new https.HttpsError("failed-precondition", undefined, errorInvalidRequestkey);
  }
  const requestKeys = privateRef.data()["requestKeys"] as { [key: string]: string };
  if (requestKeys === undefined) {
    console.log("requestKeys not found");
    throw new https.HttpsError("failed-precondition", undefined, errorInvalidRequestkey);
  }  
  const eventId = requestKeys[requestKey];
  if (eventId === undefined) {
    throw new https.HttpsError("failed-precondition", undefined, errorInvalidRequestkey);
  }

  return eventId;
}
