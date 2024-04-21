# Database

In this document:

- collections are written in `[name]`
- documents are written in `<name>`
- fields are written in `key: value`

## Whole structure

```
├── [conferences]
│     ├── <DroidKaigi2018>
│     │     ├── name: "DroidKaigi 2018"
│     │     ├── starts: 2018-02-08T10:00:00+09:00
│     ├── <iOSDC2018>
│     │     ├── name: "iOSDC Japan 2018"
│     │     ├── starts: 2018-08-30T18:00:00+09:00
│     ├── ...
├── [config]
│     ├── <config>
│     │     ├── inMaintenance: false
│     ├── <private>
│     │     ├── [admins]
│     │     │     ├── <UID1abcABC123defDEF456ghiGHI>
│     │     │     ├── <UID2JKL789jklMNO012mnoPQR345>
│     │     │     ├── ...
│     │     ├── requestKeys: {
│     │     │     "foo": "mobconfvideo-2", 
│     │     │     "bar": "mobconfvideo-3", 
│     │     │   }
├── [events]
│     ├── <mobconfvideo-0>
│     │     ├── [requests]
│     │     │     ├── <REQ1abAB12cdCD34efEF56ghGH78>
│     │     │     │     ├── conference: "iOSDC Japan 2018"
│     │     │     │     ├── memo: ""
│     │     │     │     ├── minutes: 5
│     │     │     │     ├── requestedAt: 2018-09-24T15:29:38+09:00
│     │     │     │     ├── sessionID: "iOSDC2018_229db830-848e-4496-b863-46f8ba690c5d"
│     │     │     │     ├── slide: "https://speakerdeck.com/hironytic/iosdc-2018-lt"
│     │     │     │     ├── title: "全部iOSにしゃべらせちゃえ！"
│     │     │     │     ├── video: "https://www.youtube.com/watch?v=bbKroWHw3dY&t=75"
│     │     │     │     ├── watched: true
│     │     │     ├── <REQ2IJ90ijKL12klMN34mnOP56op>
│     │     │     │     ├── ...
│     │     │     ├── ...
│     │     ├── hidden: false
│     │     ├── name: "第0回"
│     │     ├── starts: 2018-09-24T10:00:00+09:00
│     ├── <mobconfvideo-1>
│     │     ├── ...
│     ├── ...
├── [sessions]
│     ├── <iOSDC2018_229db830-848e-4496-b863-46f8ba690c5d>
│     │     ├── conferenceId: "iOSDC2018"
│     │     ├── description: "いっけなーい💦トークトーク..."
│     │     ├── minutes: 5
│     │     ├── slide: "https://speakerdeck.com/hironytic/iosdc-2018-lt"
│     │     ├── speakers: [
│     │     │     {
│     │     │       "icon": "https://...",
│     │     │       "name": "ひろん",
│     │     │       "twitter": "hironytic",
│     │     │     }
│     │     │   ]
│     │     ├── starts: 2018-09-02T16:05:00+09:00
│     │     ├── title: "全部iOSにしゃべらせちゃえ！"
│     │     ├── video: "https://www.youtube.com/watch?v=bbKroWHw3dY&t=75"
│     │     ├── watched: true
│     │     ├── watchedOn: [
│     │     │     "mobconfvideo-0",
│     │     │     "mobconfvideo-1",
│     │     │   ]
│     ├── <DroidKaigi2022_365055>
│     │     ├── ...
│     ├── ...
```

## Each collections and documents

### `conferences`

```
├── [conferences]
│     ├── <DroidKaigi2018>
│     │     ├── name: "DroidKaigi 2018"
│     │     ├── starts: 2018-02-08T10:00:00+09:00
```

This collection contains informations about each conference.

### `conferences/{conferenceId}`

A conference is represented as a document with the following fields:

| key      | value |
|----------|-------|
| `name`   | Name of the conference |
| `starts` | Start date and time of the conference |

### `config`

```
├── [config]
│     ├── <config>
│     ├── <private>
```

This collection contains configurations of the app.
There are two documents in this collection: `config` and `private`.

### `config/config`

```
├── [config]
│     ├── <config>
│     │     ├── inMaintenance: false
```

This document contains public configurations.
It has the following fields:

| key             | value |
|-----------------|-------|
| `inMaintenance` | Whether the app is in maintenance mode |

### `config/private`

```
├── [config]
│     ├── <private>
│     │     ├── [admins]
│     │     ├── requestKeys: {
│     │     │     "foo": "mobconfvideo-2", 
│     │     │     "bar": "mobconfvideo-3", 
│     │     │   }
```

This document contains private configurations.
It has the following fields:

| key           | value |
|---------------|-------|
| `requestKeys` | Map of request keys to events |

It also contains a subcollection `admins`.

### `config/private/admins`

```
├── [config]
│     ├── <private>
│     │     ├── [admins]
│     │     │     ├── <UID1abcABC123defDEF456ghiGHI>
│     │     │     ├── <UID2JKL789jklMNO012mnoPQR345>
```
This collection contains UIDs of administrators.

### `config/private/admins/{UID}`

This document has no fields.
The existence of this document means the user with the UID, of Firebase Authentication, is an administrator.

### `events`

```
├── [events]
│     ├── <mobconfvideo-0>
│     │     ├── [requests]
│     │     ├── hidden: false
│     │     ├── name: "第0回"
│     │     ├── starts: 2018-09-24T10:00:00+09:00
```

This collection contains informations about each event.

### `events/{eventId}`

Each MobConfVideo event is represented as a document with the following fields:

| key      | value |
|----------|-------|
| `hidden` | Whether the event is hidden in event list |
| `name`   | Name of the event |
| `starts` | Start date and time of the event |

It also contains a subcollection `requests`.

### `events/{eventId}/requests`

```
├── [events]
│     ├── <mobconfvideo-0>
│     │     ├── [requests]
│     │     │     ├── <REQ1abAB12cdCD34efEF56ghGH78>
│     │     │     │     ├── conference: "iOSDC Japan 2018"
│     │     │     │     ├── memo: ""
│     │     │     │     ├── minutes: 5
│     │     │     │     ├── requestedAt: 2018-09-24T15:29:38+09:00
│     │     │     │     ├── sessionID: "iOSDC2018_229db830-848e-4496-b863-46f8ba690c5d"
│     │     │     │     ├── slide: "https://speakerdeck.com/hironytic/iosdc-2018-lt"
│     │     │     │     ├── title: "全部iOSにしゃべらせちゃえ！"
│     │     │     │     ├── video: "https://www.youtube.com/watch?v=bbKroWHw3dY&t=75"
│     │     │     │     ├── watched: true
```

This collection contains requested sessions for each event.

### `events/{eventId}/requests/{requestId}`

Each request has the following fields:

| key           | value |
|---------------|-------|
| `conference`  | Name of the conference which contains the session |
| `memo`        | Memo of the request (Never used in app) |
| `minutes`     | Time length of the session in minutes |
| `requestedAt` | Date and time when the request was made |
| `sessionID`   | ID of the session, which is the `sessionID` of `sessions/{sessionID}` (Optional) |
| `slide`       | URL of the slide (Optional) |
| `title`       | Title of the session |
| `video`       | URL of the video (Optional) |
| `watched`     | Whether the video is watched |

### `sessions`

```
├── [sessions]
│     ├── <iOSDC2018_229db830-848e-4496-b863-46f8ba690c5d>
│     │     ├── conferenceId: "iOSDC2018"
│     │     ├── description: "いっけなーい💦トークトーク..."
│     │     ├── minutes: 5
│     │     ├── slide: "https://speakerdeck.com/hironytic/iosdc-2018-lt"
│     │     ├── speakers: [
│     │     │     {
│     │     │       "icon": "https://...",
│     │     │       "name": "ひろん",
│     │     │       "twitter": "hironytic",
│     │     │     }
│     │     │   ]
│     │     ├── starts: 2018-09-02T16:05:00+09:00
│     │     ├── title: "全部iOSにしゃべらせちゃえ！"
│     │     ├── video: "https://www.youtube.com/watch?v=bbKroWHw3dY&t=75"
│     │     ├── watched: true
│     │     ├── watchedOn: [
│     │     │     "mobconfvideo-0",
│     │     │     "mobconfvideo-1",
│     │     │   ]
```

This collection contains informations about each session.

### `sessions/{sessionId}`

Each session is represented as a document with the following fields:

| key            | value |
|----------------|-------|
| `conferenceId` | ID of the conference which contains the session, which is the `conferenceId` of `conferences/{conferenceId}` |
| `description`  | Description of the session |
| `minutes`      | Time length of the session in minutes |
| `slide`        | URL of the slide (Optional) |
| `speakers`     | Array of speakers, each speaker has the following fields: `icon`, `name`, `twitter` |
| `starts`       | Start date and time of the session |
| `title`        | Title of the session |
| `video`        | URL of the video (Optional) |
| `watched`      | Whether the video is watched in any events |
| `watchedOn`    | Array of event IDs which the video is watched in `eventID` of `events/{eventId}` |

