# SvelteKit + Firebase + SSR with user data

This is an example/boilerplate/starter of the SvelteKit sample app with Firebase authentication and SSR that has user data.

## Live example

https://sveltekit-firebase-ssr.vercel.app/

(counter and todos data subject to random deletion. Don't plan your day with it.)

## Setup

Create a `.env.development` file at the root of the folder with the following entries:

```
VITE_FIREBASE_CLIENT_CONFIG="Your **client** Firebase config json, stringified"
VITE_FIREBASE_SERVER_CONFIG="Your **server** Firebase config json, stringified"
```

### VITE_FIREBASE\_**CLIENT**\_CONFIG

This value will be sent to the client in the user's session. See `src/hooks.ts`

The (non-stringified) json has this shape:

```
{
    "apiKey": "",
    "authDomain": "",
    "databaseURL": "",
    "projectId": "",
    "storageBucket": "",
    "messagingSenderId": "",
    "appId": "",
    "measurementId": ""
}
```

### VITE_FIREBASE\_**SERVER**\_CONFIG

This value is only used to retrieve data from Firebase on the server. See `src/lib/server/firebase.ts`

The (non-stringified) json has this shape:

```
{
    "type": "",
    "project_id": "",
    "private_key_id": "",
    "private_key": "",
    "client_email": "",
    "client_id": "",
    "auth_uri": "",
    "token_uri": "",
    "auth_provider_x509_cert_url": "",
    "client_x509_cert_url": ""
}
```

To obtain the necessary server credentials, log in to the Firebase console, click the ⚙️(settings icon), then select `Project Settings` and then the `Service accounts` tab. In the `Firebase Admin SDK` click `Generate new private key`.

These credentials contain a private key that should be kept secret (i.e. not shared or committed to Git)

## Authenticating the user

`/src/routes/__layout.svelte` uses the `Auth` component which shows a button to sign in and out.
The `signInWith` and `signOut` functions are in `/src/lib/utils/firebase.ts`.
Notice how the Firebase app is initialized with `FIREBASE_CONFIG`.

The script section of `/src/routes/__layout.svelte` invokes `listenForAuthChanges()` (`/src/lib/utils/firebase.ts`) if the app is running in the browser.
It will update the session data with the logged in user and set a cookie with its token.
The `handle` function in `/src/hooks.ts` reads the cookie and decodes the token for `getSession` to include minimal information about the user in the session object.

## Reading data

Because reading on the server requires `firebase-admin` which uses a project's private key, DB operations are separated into the following:

- `/src/lib/server/firebase.ts` for the server.
- `/src/lib/utils/firebase.ts` for the client.
- `/src/routes/api/data.ts` to get the components' initial data from both client and server.

## Todos component

The `load` function in `/src/routes/todos/index.svelte` fetches the list of todos from `/api/data`. `/src/routes/api/data.ts` always runs on the server and it will decode the user's token from a cookie and use `/src/lib/server/firebase.ts` to retireve the documents using `getDocuments`. The result is passed to the component via `props`.

## Models

At risk of angering the FP gods I decided to go with classes for the document models.
`/src/lib/models/Document.ts` is the base class for Firebase documents. `_collection` is to be overridden with the path to the collection. `_dbFields` holds the fields that will make it to the database (not every field in the model needs to be stored).
`/src/lib/models/Todo.ts` holds the definition of the `Todo` item. The constructor adds the fields it wants to persist in the DB (text and done). It also overrides `_collection` with the name of the Firebase collection (`'todos'`).

## Firebase reactivity

The `Counter` component shows how one can subscribe to Firebase changes. It gets the data from the server, creates a `Document`, and uses the `.getStore()` function which creates a readable store that A) loads the object's data properties on Firebase's `onSnapshot`, and B) it updates the store via the `set` method.

You can open 2 browser windows and see how one changes with the other (as long as they're both logged in with the same user).

The `Counter` component doesn't display on the home page if the user isn't logged in.

`Counter` uses the helper method `/src/lib/utils/firebase.ts -> getDocumentStore` to react to changes in a single document (there's one counters document in Firebase for each user).

`Todos` uses the helper method `/src/lib/utils/firebase.ts -> getCollectionStore` to react to changes in all todos documents for the given user.

## Protecting routes

There are two ways to protect a route, with `hooks.ts` and `__layout.svelte`.

In this example we have a `publicPages` constant with the list of pages which can be accessed without logging in. In `hooks.ts` `handle` we check for the token and if the user isn't logged in we send them to the home page.
The same check is performed at the layout level.
