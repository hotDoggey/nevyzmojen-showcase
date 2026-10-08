const debug = false;

// Module to initiate the firebaseApp using my project config,
// and to import any firebase components i need ready for global declarement in main.js

import { initializeApp } from "firebase/app";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithCustomToken,
    setPersistence,
    browserLocalPersistence,
    onAuthStateChanged,
    signOut,
    reauthenticateWithCredential,
    EmailAuthProvider,
    updatePassword,
    sendPasswordResetEmail,
} from "firebase/auth";
import {
    getFirestore,
    collection,
    doc, // for creating refs to parts of firestore DB
    getDoc, // using a ref and an authentication, get a record
    addDoc, // add a doc to a collection
    getDocs, // using a ref and an authentication, get a set of records
    onSnapshot,
    deleteDoc,
    updateDoc,
    setDoc,
    serverTimestamp,
    query,
    where,
    orderBy,
    limit,
} from "firebase/firestore";
import store from "@/store.js"; // Import the Vuex store
import router from "@/router"; // Import the router for redirecting logged in users

// Import Firebase Functions
import { getFunctions } from "firebase/functions";
import { getApp } from "firebase/app";

/* IMPORT ALL FIREBASE FUNCTIONS */
// import firebase from "firebase/app";
// import "firebase/auth";
// import "firebase/firestore";

// create firebase config - copied directly from firebase project
const firebaseConfig = {
    apiKey: "AIzaSyAEgFV0n-sjPZirmbODNFLX46gxVbjaoz8",
    authDomain: "nevysmojen.firebaseapp.com",
    projectId: "nevysmojen",
    storageBucket: "nevysmojen.appspot.com",
    messagingSenderId: "814254605980",
    appId: "1:814254605980:web:6058812c531ec005638f59",
    measurementId: "G-8TLDBVPJES",
};

// Initialize Firebase
let firebaseApp = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
let firebaseAuth = getAuth();

// Initialize Firestore Database - FYI - the db doesnt need a specific parameter passed such as the firebaseApp, it will pick that up itself as its a global variable
let firestoreDB = getFirestore();

// Initialize Firebase Functions
const functions = getFunctions(getApp());

// Set persistance for the login functionality: "local", "session", "none"
setPersistence(firebaseAuth, browserLocalPersistence);

// Listen for auth state changes, this runs always on startup and tries to pick up a user session from persistance
onAuthStateChanged(firebaseAuth, async (user) => {
    // Set authReady to true once this fires
    store.commit("setAuthReady", true);

    if (user && !user.isAnonymous) {
        // Full account — fetch user doc from Firestore (fetchUserData clears isLoading when done)
        store.commit("setAuthType", "full_user");
        if (debug)
            console.log(
                `user was auto-signed in by firebaseAuth persistance, their ID is ${user.uid} and returned user object:`,
                user,
            );
        await store.dispatch("fetchUserData", user);

        if (router.currentRoute.value.name === "login") {
            router.push("/account");
        }
    } else {
        // Anonymous session or not signed in — no Firestore doc to fetch, clear loading immediately
        store.commit("setAuthType", user?.isAnonymous ? "anon_user" : "null_user");
        store.commit("setIsLoading", false);

        if (!user) {
            if (debug) console.log("No user is signed in, setting blank user details object in Store.");
            store.commit("setUserDetails", {});
            if (router.currentRoute.value.name === "account") {
                router.push("/login");
            }
        }
    }
});

/*  For future me: A ref points to a collection, we use the colletion method to create 
    a ref. We pass in the firestoreDB and the name of the collection and can store it to a var
    then we can use getDocs function with a ref to retrieve the data in that collection,
    this returns a promise with a snapshot. We can use the snapshot.docs to get each 
    entry, and then can use .data() on each entry to get all the values stored for that 
    entry, and can get the id using entry.id. In the below example "entry" is the "tab". 

    The following code has moved to the store, but i have left it here commented out for future reference.

    // Collection reference
    let colRef = collection(firestoreDB, "tabs");
    // initialise tabs var
    let tabs = [];
    // Get collection data
    getDocs(colRef)
    .then((snapshot) => {
        snapshot.docs.forEach((tab) => {
            let id = tab.id;
            tabs.push({ ...tab.data(), id });
        });
    })
    .catch((error) => {
        console.error("Error getting tabs: ", error);
    });
    */

export {
    firebaseApp,
    firebaseAuth,
    firestoreDB,
    doc,
    collection,
    addDoc,
    getDoc,
    getDocs,
    setDoc, // replace the whole doucment with a new object
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    serverTimestamp,
    updateDoc, // update a part of the document give you back the docRef created
    reauthenticateWithCredential,
    EmailAuthProvider,
    updatePassword,
    sendPasswordResetEmail,
    // tabsColRef,
    // onSnapshot,
    // deleteDoc,
    // signInWithCustomToken,
    query,
    where,
    orderBy,
    limit,
};
