const debug = false;
import { appConfig } from "@/store_modules/appConfig.js";

import { createStore } from "vuex";
import countriesList from "@/mainjsHelpers/countriesList.js";
import {
    firebaseApp,
    firebaseAuth,
    firestoreDB,
    doc,
    collection,
    addDoc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    signOut,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    serverTimestamp,
    reauthenticateWithCredential,
    EmailAuthProvider,
    updatePassword,
    sendPasswordResetEmail,
    query,
    where,
    orderBy,
    limit,
} from "@/mainjsHelpers/FirestoreSetup";
import i18n from "./assets/text_translations/i18n.js";

import products from "./store_modules/products";
import filters from "./store_modules/filters";
import systemVariables from "./store_modules/systemVariables";

let store = createStore({
    state: {
        // populated with an object with user details as properties such as lang, name, email etc..
        userDetails: {},
        isLoading: true,
        // productsArray: [],
        errorMessage: null,
        fallback_lang: "en",
        basket: [],
        countriesList: countriesList,
        snackbarState: {
            show: false,
            text: "",
            color: "success",
        },
        speedyOffices: [], // Stores the fetched Speedy offices
        // Last guest checkout info (used for guest -> account conversion)
        lastGuestSignupEmail: null,
        lastGuestOrderId: null,
        authReady: false, // becomes true once onAuthStateChanged fires at least once
        authType: "unknown", // "full_user" | "anon_user" | "null_user" | "unknown"

        siteVisits: [],
        siteVisitsLoading: false,

        // Pre-release gate — set to true once the correct password is entered
        prereleaseAccessUnlocked: true,
        prereleasePassword: "REMOVED_IN_SHOWCASE_COPY",

        // app configuration
        prodHasDiffSizes: appConfig.prodHasDiffSizes,
        globalContactEmail: appConfig.globalContactEmail,
        contactNumber: appConfig.contactNumber,
        globalCommunications_Email: appConfig.globalCommunications_Email,
        lowStockThreshold: appConfig.lowStockThreshold,
        sizeOrder: appConfig.sizeOrder,
    },
    getters: {
        userDetails: (state) => state.userDetails,
        loggedInState: (state) => Object.keys(state.userDetails).length !== 0,
        userLangPreference: (state) => state.userDetails.userLang || "bg", //default to bg lang, change to user set lang if user details available
        pageLang: (state) => i18n.global.locale,
        isLoading: (state) => state.isLoading,
        productsArray: (state) => state.products.productsArray,
        errorMessage: (state) => state.errorMessage,
        getBasket: (state) => state.basket,
        getCountriesList: (state) => state.countriesList,
        getEnrichedBasket(state, getters, rootState, rootGetters) {
            return state.basket.map((basketItem) => {
                const product = rootGetters.productsArray.find(
                    (matchedProduct) =>
                        matchedProduct.internalProductId === basketItem.internalProductId,
                );
                return {
                    ...basketItem,
                    ...product,
                };
            });
        },
        getBasketTotalEUR(state, getters) {
            const total = getters.getEnrichedBasket.reduce(
                (sum, item) => sum + Number(item.price_eur) * item.quantity,
                0,
            );
            return (Math.floor(total * 100) / 100).toFixed(2);
        },

        // First-order discount eligibility: logged-in full users with zero prior orders,
        // only when the feature is enabled via system_variables
        eligibleForFirstOrderDiscount(state, getters) {
            return (
                getters["systemVariables/firstOrderDiscountEnabled"] &&
                getters.full_user_authed &&
                (state.userDetails?.orders?.length ?? 0) === 0
            );
        },
        getDiscountAmountEUR(state, getters) {
            if (!getters.eligibleForFirstOrderDiscount) return "0.00";
            const percent = getters["systemVariables/firstOrderDiscountPercent"];
            const rawTotal = getters.getEnrichedBasket.reduce(
                (sum, item) => sum + Number(item.price_eur) * item.quantity,
                0,
            );
            return (Math.floor(rawTotal * (percent / 100) * 100) / 100).toFixed(2);
        },
        getDiscountedBasketTotalEUR(state, getters) {
            const subtotal = Number(getters.getBasketTotalEUR);
            const discount = Number(getters.getDiscountAmountEUR);
            return (subtotal - discount).toFixed(2);
        },

        getSpeedyOffices: (state) => state.speedyOffices,
        authReady: (state) => state.authReady,
        authType: (state) => state.authType,

        is_signed_in: (state) => state.authType === "full_user" || state.authType === "anon_user",
        full_user_authed: (state) => state.authType === "full_user",
        anon_user_authed: (state) => state.authType === "anon_user",
        null_user_authed: (state) => state.authType === "null_user",
        is_admin: (state) =>
            state.authType === "full_user" && state.userDetails?.user_role === "admin",
    },
    mutations: {
        // Set the user details fetched from firestore on login within the state
        setUserDetails: (state, userData) => (state.userDetails = userData),
        // storeProductsArray: (state, productsArray) => (state.productsArray = productsArray),
        setErrorMessage: (state, messageStr) => (state.errorMessage = messageStr),
        setIsLoading: (state, val) => (state.isLoading = val),
        SET_SITE_VISITS: (state, visits) => (state.siteVisits = visits),
        SET_SITE_VISITS_LOADING: (state, val) => (state.siteVisitsLoading = val),
        // Add product or increase quantity if it already exists
        addProductToBasket: (state, product) => {
            const existingProduct = state.basket.find(
                (item) =>
                    item.internalProductId === product.internalProductId &&
                    item.size === product.size,
            );
            if (existingProduct) {
                existingProduct.quantity += product.quantity;
            } else {
                state.basket.push({ ...product }); // this is the simple product version with id, quantity and size TODO: might need to add quantity:1 here?
            }
        },
        // Decrease product quantity or remove from basket if quantity reaches 0
        removeProductFromBasket: (state, { internalProductId, size }) => {
            const existingProductIndex = state.basket.findIndex(
                (item) => item.internalProductId === internalProductId && item.size === size,
            );

            if (existingProductIndex !== -1) {
                const product = state.basket[existingProductIndex];
                if (product.quantity > 1) {
                    product.quantity -= 1;
                } else {
                    state.basket.splice(existingProductIndex, 1); // Remove the product completely
                }
            }
        },
        // Completely delete a product from the basket
        deleteProductFromBasket: (state, { internalProductId, size }) => {
            state.basket = state.basket.filter(
                (item) => item.internalProductId !== internalProductId || item.size !== size,
            );
        },
        // Directly set the quantity of a specific basket item (used by checkout stock validation)
        setBasketItemQuantity(state, { internalProductId, size, quantity }) {
            const item = state.basket.find(
                (i) => i.internalProductId === internalProductId && i.size === size,
            );
            if (item) item.quantity = quantity;
        },
        // Set the entire basket (from local storage)
        setBasket: (state, basketValue) => (state.basket = basketValue),
        // Set the snackbar state
        showSnackbar(state, snackbarText) {
            state.snackbarState.show = true;
            state.snackbarState.text = snackbarText;
            // state.color = payload.color || "success";
        },
        hideSnackbar(state) {
            state.snackbarState.show = false;
            state.snackbarState.text = "";
        },
        saveOrdersInStore(state, orders) {
            state.orders = orders;
        },
        setLastGuestSignupEmail(state, email) {
            state.lastGuestSignupEmail = email;
        },
        setLastGuestOrderId(state, id) {
            state.lastGuestOrderId = id;
        },
        clearLastGuestSignup(state) {
            state.lastGuestSignupEmail = null;
            state.lastGuestOrderId = null;
        },
        SET_SPEEDY_OFFICES(state, offices) {
            state.speedyOffices = offices;
        },
        setAuthReady(state, value) {
            state.authReady = value === true;
        },

        setAuthType(state, value) {
            const allowed = ["full_user", "anon_user", "null_user", "unknown"];
            state.authType = allowed.includes(value) ? value : "unknown";
        },

        SET_PRERELEASE_UNLOCKED(state) {
            state.prereleaseAccessUnlocked = true;
        },
    },
    actions: {
        changeLang: async ({ dispatch, commit, state, getters }, newLang) => {
            // Always update the in-memory i18n locale immediately
            i18n.global.locale = newLang;

            // If the user is a logged-in full account, persist the preference to Firestore
            if (getters.full_user_authed && state.userDetails?.user?.uid) {
                try {
                    const uid = state.userDetails.user.uid;
                    await updateDoc(doc(firestoreDB, "users", uid), { language: newLang });
                    // Keep the local store in sync so userDetails.language reflects the change
                    commit("setUserDetails", { ...state.userDetails, language: newLang });
                } catch (error) {
                    console.error("Error persisting language preference to Firestore:", error);
                }
            }
        },
        // based on persistance and autosign in check in FirestoreSetup
        fetchUserData: async ({ dispatch, commit, state }, userObjectFromFirestore) => {
            // set loading state
            commit("setIsLoading", true);

            // Fetch user data from Firestore using the UID
            try {
                // define a document reference
                const userDocRef = doc(firestoreDB, "users", userObjectFromFirestore.uid);
                // fetch the actual data
                const userDoc = await getDoc(userDocRef);
                if (debug) console.log("userDoc: ", userDoc);

                if (userDoc.exists()) {
                    let userData = userDoc.data();
                    // add the userObject given by auth to the stored data obj
                    userData.user = userObjectFromFirestore;
                    if (debug) console.log("User data:", userData);
                    // set the xstore state item for userdetails to the return object
                    commit("setUserDetails", userData);

                    // after setting user details, populate their orders array
                    await dispatch("fetchUserOrders", userObjectFromFirestore.uid);

                    // update the locale for translations in i18n based on user selected language
                    i18n.global.locale = userData.language;
                    if (debug)
                        console.log(
                            "set the default locale of i18n to the one in firestore loggedin user preferences: ",
                            i18n.global.locale,
                        );
                } else {
                    console.error("No such user document!");
                    dispatch("signUserOut");
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }

            // change loading state
            commit("setIsLoading", false);
        },
        signUserInWithEmail: async (_context, userCredentials) => {
            // Note: deliberately no setIsLoading here. The global isLoading flag controls whether
            // the router-view is mounted in App.vue (v-else). Setting it would unmount the login
            // component mid-flight, destroying the local errorMessage state before it can be shown.
            let returnState;

            try {
                let user = await signInWithEmailAndPassword(
                    firebaseAuth,
                    userCredentials.email,
                    userCredentials.password,
                );

                if (debug) console.log(`signUserInWithEmail xstore succeeded: ${user}`);
                returnState = true;
            } catch (err) {
                if (debug) console.log(`There was an error: ${err}`);
                // Return the Firebase error code so the caller can map it to a user-facing message
                returnState = err.code || err.message;
            }

            return returnState;
        },
        signUserOut: async ({ commit, state }) => {
            signOut(firebaseAuth)
                .then(() => {
                    if (debug) console.log("User signed out");
                    // clear the user object in xstore
                    commit("setUserDetails", {});
                })
                .catch((error) => {
                    console.error("Error signing out:", error);
                });
        },

        // Send a password reset email to the given address via Firebase Auth.
        // Firebase always resolves successfully even if the email has no account (security by design),
        // so the caller should show a generic "check your inbox" message regardless of outcome.
        sendPasswordResetLink: async (_context, { email }) => {
            await sendPasswordResetEmail(firebaseAuth, email);
            if (debug) console.log("sendPasswordResetLink: reset email dispatched to", email);
        },

        // Reauthenticate the current user with their existing password, then update to the new one.
        // Throws the raw Firebase error so the caller can inspect error.code (e.g. auth/wrong-password).
        changeUserPassword: async (_context, { currentPassword, newPassword }) => {
            const user = firebaseAuth.currentUser;
            if (!user) throw new Error("No authenticated user found.");

            // Build a credential from the user's current email + supplied password
            const credential = EmailAuthProvider.credential(user.email, currentPassword);

            // Reauthenticate first — required before sensitive operations regardless of session age
            await reauthenticateWithCredential(user, credential);

            // Reauthentication passed — now update to the new password
            await updatePassword(user, newPassword);

            if (debug) console.log("changeUserPassword: password updated successfully");
        },

        // New clearer name: create auth user and then user details in Firestore
        createAuthAndDetails: async ({ dispatch, commit, state }, enteredSignupData) => {
            try {
                const userObjectFromFirestore = await createUserWithEmailAndPassword(
                    firebaseAuth,
                    enteredSignupData.email,
                    enteredSignupData.password,
                );

                if (debug) console.log("success signing up");

                // Delegate to createUserDetails to write the Firestore user document
                const result = await dispatch("createUserDetails", {
                    ...enteredSignupData,
                    uid: userObjectFromFirestore.user.uid,
                });

                return result === true ? true : result;
            } catch (error) {
                console.error("Error creating account:", error);
                return error.message;
            }
        },

        // Backwards-compatible wrapper kept for existing callers
        createUserInFirestore: async ({ dispatch, commit, state }, enteredSignupData) => {
            return await dispatch("createAuthAndDetails", enteredSignupData);
        },
        // Create only the Firestore user document (useful when auth user already exists/linked)
        createUserDetails: async ({ dispatch, commit, state }, enteredSignupData) => {
            try {
                const uid =
                    enteredSignupData.uid ||
                    (firebaseAuth.currentUser && firebaseAuth.currentUser.uid);
                if (!uid) throw new Error("No UID available to create user details.");

                // Build user data object
                let userData = {
                    first_name: enteredSignupData.first_name || "",
                    surname: enteredSignupData.surname || "",
                    email: enteredSignupData.email || "",
                    basket: [],
                    orders: [],
                    phone_number: {
                        country_code: enteredSignupData.country_code || "",
                        number: enteredSignupData.number || "",
                    },
                    user_role: enteredSignupData.user_role || "customer",
                    language: enteredSignupData.language || "bg",
                    createdAt: serverTimestamp(),
                };

                await setDoc(doc(firestoreDB, "users", uid), userData);

                // Populate xstore with the newly created user details
                userData.user = firebaseAuth.currentUser;
                commit("setUserDetails", userData);

                return true;
            } catch (error) {
                console.error("Error creating user details:", error);
                return error.message || String(error);
            }
        },
        createProductInFirestore: async ({ commit, state }, productData) => {
            if (debug) console.log("productData: ", productData);

            try {
                // Create an entry in the users table with the additional user data
                await addDoc(collection(firestoreDB, "products"), productData);

                // Return true to indicate success
                return true;
            } catch (error) {
                console.error("Error creating account:", error);
                // Return the error message
                return error.message;
            }
        },
        getBasketFromLocalStorage: ({ commit }) => {
            const basketFromLocalStorageBase64 = localStorage.getItem("basketDetails");
            if (basketFromLocalStorageBase64) {
                try {
                    const decodedBasket = JSON.parse(atob(basketFromLocalStorageBase64)).basket;
                    commit("setBasket", decodedBasket);
                } catch (e) {
                    console.error("Error decoding basket data:", e);
                }
            }
        },
        // Add a product to the basket
        addProductToBasket: ({ commit, dispatch, state }, productToAdd) => {
            commit("addProductToBasket", productToAdd);
            // Sync to local storage
            dispatch("syncBasketToLocalStorage");
        },
        // Remove a product or decrease quantity
        removeProductFromBasket: ({ commit, dispatch }, { internalProductId, size }) => {
            if (debug) console.log(size);

            commit("removeProductFromBasket", { internalProductId, size });

            // Sync to local storage
            dispatch("syncBasketToLocalStorage");
        },
        // Fully delete a product from the basket
        deleteProductFromBasket: ({ commit, dispatch }, { internalProductId, size }) => {
            commit("deleteProductFromBasket", { internalProductId, size });

            // Sync to local storage
            dispatch("syncBasketToLocalStorage");
        },
        // Directly set the quantity of a basket item (used by checkout stock validation)
        setBasketItemQuantity({ commit, dispatch }, payload) {
            commit("setBasketItemQuantity", payload);
            dispatch("syncBasketToLocalStorage");
        },
        clearBasket: ({ commit, dispatch }) => {
            commit("setBasket", []);
            // Sync to local storage
            dispatch("syncBasketToLocalStorage");
        },
        // Sync the current basket to local storage with Base64 encoding
        syncBasketToLocalStorage: ({ state }) => {
            const basketData = {
                basket: state.basket,
            };
            const encodedBasket = btoa(JSON.stringify(basketData));
            localStorage.setItem("basketDetails", encodedBasket);
        },
        createOrderInFirestore: async ({ commit, state }, orderDetails) => {
            try {
                // Create an entry in the orders table with the order details
                let firestoreResponse = await addDoc(
                    collection(firestoreDB, "orders"),
                    orderDetails,
                );
                // Return true to indicate success
                return { callResult: true, firestoreReturnedId: firestoreResponse.id };
            } catch (error) {
                console.error("Error creating order:", error);
                // Return the error message
                return error.message;
            }
        },

        // Records a single visit document to site_visits on each full page load.
        // Called from App.vue once authReady is true so auth_type is accurate.
        recordSiteVisit: async ({ state }) => {
            try {
                const ua = navigator.userAgent;

                const getBrowser = () => {
                    if (/Edg\//.test(ua))
                        return { name: "Edge", version: ua.match(/Edg\/([\d]+)/)?.[1] ?? "" };
                    if (/OPR\/|Opera\//.test(ua))
                        return {
                            name: "Opera",
                            version: ua.match(/(?:OPR|Opera)\/([\d]+)/)?.[1] ?? "",
                        };
                    if (/Chrome\//.test(ua))
                        return { name: "Chrome", version: ua.match(/Chrome\/([\d]+)/)?.[1] ?? "" };
                    if (/Firefox\//.test(ua))
                        return {
                            name: "Firefox",
                            version: ua.match(/Firefox\/([\d]+)/)?.[1] ?? "",
                        };
                    if (/Safari\//.test(ua))
                        return { name: "Safari", version: ua.match(/Version\/([\d]+)/)?.[1] ?? "" };
                    return { name: "Unknown", version: "" };
                };

                const getDevice = () => {
                    if (/iPad/.test(ua)) return { type: "tablet", name: "iPad" };
                    if (/iPhone/.test(ua)) return { type: "mobile", name: "iPhone" };
                    if (/Android/.test(ua)) {
                        const model =
                            ua.match(/Android[^;]*;\s*([^)]+)\)/)?.[1]?.trim() ?? "Android";
                        return { type: /Mobile/.test(ua) ? "mobile" : "tablet", name: model };
                    }
                    return { type: "desktop", name: "" };
                };

                const getOS = () => {
                    if (/Windows NT/.test(ua)) return "Windows";
                    if (/Mac OS X/.test(ua) && !/iPhone|iPad/.test(ua)) return "macOS";
                    if (/iPhone|iPad/.test(ua)) return "iOS";
                    if (/Android/.test(ua)) return "Android";
                    if (/Linux/.test(ua)) return "Linux";
                    return "Unknown";
                };

                const browser = getBrowser();
                const device = getDevice();
                const now = new Date();

                const visitData = {
                    timestamp_iso: now.toISOString(),
                    timestamp_offset: now.toString().match(/GMT[+-]\d{4}\s\([^)]+\)/)?.[0] ?? "",
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    locale: navigator.language,
                    browser: browser.name,
                    browser_version: browser.version,
                    os: getOS(),
                    device_type: device.type,
                    device_name: device.name,
                    viewport: `${window.innerWidth}x${window.innerHeight}`,
                    screen_resolution: `${screen.width}x${screen.height}`,
                    auth_type: state.authType,
                };

                await addDoc(collection(firestoreDB, "site_visits"), visitData);
            } catch (error) {
                // Analytics failure must never surface to the user
                console.error("Failed to record site visit:", error);
            }
        },

        // Fetches the 15 most recent site_visits documents for the admin orders page
        fetchSiteVisits: async ({ commit }) => {
            commit("SET_SITE_VISITS_LOADING", true);
            try {
                const q = query(
                    collection(firestoreDB, "site_visits"),
                    orderBy("timestamp_iso", "desc"),
                    limit(15),
                );
                const snapshot = await getDocs(q);
                const visits = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
                commit("SET_SITE_VISITS", visits);
            } catch (error) {
                console.error("Error fetching site visits:", error);
            } finally {
                commit("SET_SITE_VISITS_LOADING", false);
            }
        },

        sendTestEmail: async ({ commit }, testEmailAddress) => {
            const payload = {
                to: testEmailAddress,
                // bcc: [{ email: "admin@example.com", name: "Nevyzmojen Admin" }],
                bcc: "admin@example.com",
                subject: `Nevyzmojen - Test Email`,
                html: `<p>This is a test email from Nevyzmojen store.</p>`,
            };
            if (debug) console.log("payload for test email: ", payload);
            try {
                const token = firebaseAuth.currentUser
                    ? await firebaseAuth.currentUser.getIdToken()
                    : null;
                if (!token) {
                    console.warn("[Email] No authenticated user — cannot send test email.");
                    return;
                }
                const res = await fetch(
                    "https://api-fhjlccumqq-uc.a.run.app/send-confirmation", // firestore functions deployed Express route
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify(payload),
                    },
                );
                const json = await res.json();
                if (res.ok) {
                    if (debug) console.log("✅ Test email sent:", json);
                } else {
                    console.error("❌ Email API error:", json);
                }
            } catch (err) {
                console.error("❌ Failed to send test email:", err);
            }
        },
        // Send email confirmation using Brevo API through firebase Function
        sendEmailConfirmation: async ({ commit }, emailDetails) => {
            // 👇 Don't proceed if email is missing
            if (!emailDetails?.email) {
                console.warn("[Email] No recipient email provided.");
                return;
            }

            // determine delivery location text based on delivery method
            let deliveryLocation;
            let deliveryInfo = emailDetails.deliveryInfo;

            // for home delivery, show full address
            if (emailDetails.deliveryMethod == "home_delivery") {
                deliveryLocation = `
                ${deliveryInfo.address_line_1}
                ${deliveryInfo.address_line_2 ? "<br>" + deliveryInfo.address_line_2 : ""}
                <br> ${deliveryInfo.zip}
                <br> ${deliveryInfo.city}
                <br> ${deliveryInfo.country}
                `;
            }

            // for office pickup, show office name and address
            if (emailDetails.deliveryMethod == "office_pickup") {
                deliveryLocation = `
                ${emailDetails.deliveryInfo.selectedOfficeName}
                <br> ${deliveryInfo.selectedOfficeAddress}
                `;
            }

            const htmlContent = `
                <div style="font-family: sans-serif; line-height: 1.5;">
                    <p style="font-size: 0.9em; color: gray;">English version available below.</p>
                    
                    <h2>Благодарим Ви за поръчката!</h2>
                    <p>Здравейте ${emailDetails.name},</p>
                    <p>Вашият номер за потвърждение на поръчката е: <strong>${
                        emailDetails.shortRef
                    }</strong></p>
                    <p>Вие избрахте следната локация за доставка:</p>
                    <p><strong>${
                        emailDetails.deliveryMethod == "office_pickup" ? "Speedy офис: " : ""
                    }${deliveryLocation}</strong></p>

                    <p>Ако имате въпроси, можете да отговорите на този имейл или да се свържете с нас на <a href="mailto:${
                        appConfig.globalContactEmail
                    }">${appConfig.globalContactEmail}</a>.</p>
                    <p><a href="https://nevyzmojen.com/store">Посетете отново нашия магазин</a>, за да откриете още уникални продукти.</p>
                    <p>С уважение,<br>Екипът на НЕВЪЗМОЖЕН</p>
                </div>
                
                <br>
                <hr>
                <br>
                
                <div style="font-family: sans-serif; line-height: 1.5; color: gray;">
                    <h2>Thank you for your order!</h2>
                    <p>Dear ${emailDetails.name},</p>
                    <p>Your order confirmation number is: <strong>${
                        emailDetails.shortRef
                    }</strong></p>
                    <p>You have selected the following delivery location:</p>
                    <p><strong>${
                        emailDetails.deliveryMethod == "office_pickup" ? "Speedy office: " : ""
                    }${deliveryLocation}</strong></p>
                    
                    <p>If you have any questions, feel free to reply to this email or contact us at <a href="mailto:${
                        appConfig.globalContactEmail
                    }">${appConfig.globalContactEmail}</a>.</p>
                    <p><a href="https://nevyzmojen.com/store">Check out our store</a> again to discover more unique products.</p>
                    <p>Kind regards,<br>Team НЕВЪЗМОЖЕН</p>
                    <br>
                </div>
                `;
            const payload = {
                to: emailDetails.email,
                bcc: [{ email: "support@nevyzmojen.com", name: "Nevyzmojen Admin" }],
                subject: `Nevyzmojen - Order Confirmation [[${emailDetails.shortRef}]]`,
                html: htmlContent,
            };

            if (debug) console.log("payload for email: ", payload);

            try {
                const token = firebaseAuth.currentUser
                    ? await firebaseAuth.currentUser.getIdToken()
                    : null;
                if (!token) {
                    console.warn("[Email] No authenticated user — cannot send confirmation email.");
                    return;
                }
                const res = await fetch(
                    "https://api-fhjlccumqq-uc.a.run.app/send-confirmation", // firestore functions deployed Express route
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify(payload),
                    },
                );

                const json = await res.json();

                if (res.ok) {
                    if (debug) console.log("✅ Confirmation email sent:", json);
                } else {
                    console.error("❌ Email API error:", json);
                }
            } catch (err) {
                console.error("❌ Failed to send confirmation email:", err);
            }
        },

        triggerSnackbar({ commit }, payload) {
            commit("showSnackbar", payload.snackbarText);
            setTimeout(() => {
                commit("hideSnackbar");
            }, payload.duration || 3000);
        },
        fetchOrdersFromFirestore: async ({ commit }) => {
            try {
                const ordersSnapshot = await getDocs(collection(firestoreDB, "orders"));
                const orders = ordersSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(), // run built in function to get the data from the doc
                }));

                // Sort by server-generated unix timestamp (descending) so newest orders come first.
                // If the field is missing, treat its value as 0 so it appears last.
                orders.sort(
                    (a, b) =>
                        (b.server_generated_timestamp || 0) - (a.server_generated_timestamp || 0),
                );

                commit("saveOrdersInStore", orders);
            } catch (error) {
                console.error("Error fetching orders:", error);
            }
        },
        async updateOrderStatus({ commit }, order) {
            try {
                // Only update the status field
                await updateDoc(doc(firestoreDB, "orders", order.id), {
                    order_status: order.order_status,
                });

                return true;
            } catch (error) {
                console.error("Failed to update order status:", error);

                // Throw so the component can catch and show snackbar
                throw error;
            }
        },

        async fetchSpeedyOffices({ commit }, searchTerm) {
            if (searchTerm.length < 2) {
                commit("SET_SPEEDY_OFFICES", []);
                return;
            }

            const payload = { name: searchTerm };

            try {
                const res = await fetch("https://api-fhjlccumqq-uc.a.run.app/speedy/office", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                const json = await res.json();
                const offices = Array.isArray(json.offices) ? json.offices : [];
                commit("SET_SPEEDY_OFFICES", offices);
            } catch (err) {
                console.error("[Speedy] Fetch error:", err);
                commit("SET_SPEEDY_OFFICES", []);
            }
        },

        // Fetch all orders for the current user using a filtered query
        // Security enforced by Firestore rules: users can only query for their own orders
        fetchUserOrders: async ({ commit, state }, uid) => {
            try {
                const ordersQuery = query(
                    collection(firestoreDB, "orders"),
                    where("created_by_user_id", "==", uid),
                );
                const ordersSnapshot = await getDocs(ordersQuery);
                if (debug) console.log("ordersSnapshot: ", ordersSnapshot);

                const userOrders = ordersSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                if (debug) console.log("userOrders: ", userOrders);

                // Sort by order timestamp descending (newest first)
                userOrders.sort(
                    (a, b) =>
                        Number(b?.client_order_details?.order_timestamp_unix ?? 0) -
                        Number(a?.client_order_details?.order_timestamp_unix ?? 0),
                );

                // Update user details with fetched orders
                const updatedUserDetails = { ...state.userDetails, orders: userOrders };
                commit("setUserDetails", updatedUserDetails);
                return userOrders;
            } catch (error) {
                console.error("Error fetching user orders:", error);
            }
        },
    },
    // modularise the store into separate files for better organisation
    modules: {
        products,
        filters,
        systemVariables,
    },

    // always trigger these actions from firestore on vuex startup
    plugins: [
        (store) => {
            // store.dispatch("fetchProductsFromFirestore");
            // Get basket from local storage TODO: get it from the logged in user's data once logins are enabled
            store.dispatch("getBasketFromLocalStorage");
            // Get products from firestore
            store.dispatch("products/fetchProductsFromFirestore");
            store.dispatch("filters/fetchCategories");
            store.dispatch("filters/fetchTags");
            store.dispatch("systemVariables/fetchSystemVariables");
        },
    ],
});

export default store;
