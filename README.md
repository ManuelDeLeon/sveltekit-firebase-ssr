# SvelteKit + Firebase + SSR with user data

This is an example/boilerplate/starter of the SvelteKit sample app with Firebase authentication and SSR that has user data.

## Live example

https://sveltekit-firebase-ssr.vercel.app/

## Setup

Create a `.env` file at the root of the folder with the following entries:

```
PUBLIC_FIREBASE_CLIENT_CONFIG=Your **client** Firebase config json, stringified
FIREBASE_SERVER_CONFIG=Your **server** Firebase config json, stringified
```

### PUBLIC_FIREBASE\_**CLIENT**\_CONFIG

This value will be sent to the client in the user's session.

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

To obtain the client config, log in to the Firebase console, click the ⚙️ (settings icon), then select `Project Settings` and in the `General` tab the config json will be under `Your apps`.

### FIREBASE\_**SERVER**\_CONFIG

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

To obtain the admin server config, log in to the Firebase console, click the ⚙️ (settings icon), then select `Project Settings` and then the `Service accounts` tab. In the `Firebase Admin SDK` click `Generate new private key`.

These credentials contain a private key that should be kept secret (i.e. not shared or committed to Git)

## Authenticating the user

`/src/routes/+layout.svelte` uses the `Auth` component which shows a button to sign in and out.
The `signInWith` and `signOut` functions are in `/src/lib/utils/firebase.ts`.

The script section of `/src/routes/+layout.svelte` invokes `listenForAuthChanges()` (`/src/lib/utils/firebase.ts`) if the app is running in the browser.
It will update the session data with the logged in user and set a cookie with its token.
The `handle` function in `/src/hooks.server.ts` reads the cookie and decodes the token to include minimal information about the user in the session object.

## Reading data

Because reading on the server requires `firebase-admin` which uses a project's private key, DB operations are separated into the following:

- `/src/lib/server/firebase.ts` for the server.
- `/src/lib/utils/firebase.ts` for the client.
- `/src/routes/api/data.ts` to get the components' initial data from both client and server.

## Models

At risk of angering the FP gods I decided to go with classes for the document models.
`/src/lib/models/Document.ts` is the base class for Firebase documents. `_collection` is to be overridden with the path to the collection. `_dbFields` holds the fields that will make it to the database (not every field in the model needs to be stored).
`/src/lib/models/Counter.ts` holds the definition of the `Counter` item. The constructor adds the fields it wants to persist in the DB (in this case it's just `count`). It also overrides `_collection` with the name of the Firebase collection (`'counters'`).

## Firebase reactivity

The `Counter` component shows how one can subscribe to Firebase changes. It gets the data from the server, creates a `Document`, and uses the `.getStore()` function which creates a readable store that A) loads the object's data properties on Firebase's `onSnapshot`, and B) updates the store via the `set` method.

You can open 2 browser windows and see how one changes with the other (as long as they're both logged in with the same user).

The `Counter` component doesn't display on the home page if the user isn't logged in.

`Counter` uses the helper method `/src/lib/utils/firebase.ts -> getDocumentStore` to react to changes in a single document (there's one counters document in Firebase for each user).

## Loading user data.

There's a bit of a run around when loading and SSR'ing a component which depends on user data. The component should expose a method that returns the data it needs to render correctly. The parent calls this method as part of its load (before rendering) and then feeds the data back to the component as a prop.

For example, `Counter.svelte` has the method `getUserCountData` which returns the data for the logged in user. `+page.svelte` declares `export let data: PageData;` which is populated by the return of the `load` method in `+page.ts` (it calls `getUserCountData`). `+page.svelte` then checks if `data.userCountData` has something and passes the value to the component `<Counter userCountData={data.userCountData} />`.

## Update Firebase Cloud Firestore Rules

You will need to update your Firestore security rules to grant the necessary permissions for your SvelteKit app. You can do this in the Firebase console by following these steps:

1. Go to the Firebase Console.
2. Select your project.
3. In the left-hand menu, click on "Firestore Database."
4. Click on the "Rules" tab.

You'll now see the security rules for your Firestore database. You need to update these rules to allow read and/or write access for authenticated users, depending on your app requirements.

Here's an example of security rules that allow read and write access to all documents in the database for authenticated users:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

These rules grant read and write permissions to any authenticated user. You may need to refine these rules further based on your app's specific requirements, such as allowing access only to specific collections or documents, or based on user roles.

After updating your security rules, click "Publish" to apply the changes. 
