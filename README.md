# SvelteKit + Firebase + SSR with user data

This is an example/boilerplate/starter of the SvelteKit sample app with Firebase authentication and SSR that has user data.

## Setup

Create a `.env.development` file at the root of the folder with the following entries:

```
VITE_FIREBASE_PRIVATE_KEY="Your key, including all \n"
VITE_FIREBASE_CLIENT_EMAIL="client email"
VITE_FIREBASE_PROJECT_ID="project id"
VITE_FIREBASE_CONFIG='Your Firebase config json, stringified'
```

## Authenticating the user

`/src/routes/__layout.svelte` uses the `Auth` component which shows a button to sign in and out.
The `signInWith` and `signOut` functions are in `/src/lib/utils/firebase.ts`.
Notice how the Firebase app is initialized with `FIREBASE_CONFIG`.

The script section of `/src/routes/__layout.svelte` invokes `listenForAuthChanges()` (`/src/lib/utils/firebase.ts`) if the app is running in the browser.
It will update the session data with the logged in user and set a cookie with its token.
The `handle` function in `/src/hooks.ts` reads the cookie and decodes the token for `getSession` to include minimal information about the user in the session object.

## Reading data

Because reading on the server requires `firebase-admin` which uses a project's private key, DB operations are separated into the following:

- `/src/lib/server/firebaseAdmin.ts` for the server.
- `/src/lib/utils/firebase.ts` for the client.
- `/src/routes/data.ts` to get the components' initial data from both client and server.

## Todos component

The `load` function in `/src/routes/todos/index.svelte` fetches the list of todos from `/data`. `/src/routes/data.ts` always runs on the server and it will decode the user's token from a cookie and use `/src/lib/server/firebaseAdmin.ts` to retireve the documents using `getDocuments`. The result is passed to the component via `props`.

## Models

At risk of angering the FP gods I decided to go with classes for the document models.
`/src/lib/models/Document.ts` is the base class for Firebase documents. It has a `save()` and a `delete()` method. `__collection` is to be overridden with the path to the collection. `__dbFields` holds the fields that will make it to the database (not every field in the model needs to be stored).
`/src/lib/models/Todo.ts` holds the definition of the `Todo` item. The constructor adds the fields it wants to persist in the DB (text and done). It also overrides `__collection` with the name of the Firebase collection (`'todos'`).

## Firebase reactivity

The `Counter` component shows how one can subscribe to Firebase changes. It gets the data from the server, creates a `Document`, and uses the `.getStore()` function which creates a readable store that A) loads the object's data properties on Firebase's `onSnapshot`, and B) it updates the store via the `set` method.

You can open 2 browser windows and see how one changes with the other (as long as they're both logged in with the same user).

The `Counter` component doesn't display on the home page if the user isn't logged in.

## Protecting routes

There are two ways to protect a route, with `hooks.ts` and `__layout.svelte`.

In this example we have a `publicPages` constant with the list of pages which can be accessed without logging in. In `hooks.ts` handle we check for the token and if the user isn't logged in we send them to the home page.
The same check is performed at the layout level.
