<template>
    <div class="checkout-container pt-8 pb-16">
        <div class="checkout-title">{{ $t("checkout") }}</div>
        <!-- line separator -->
        <div class="line-separator"></div>
        <!-- Auth state debug (testing only) -->
        <div class="auth-debug-display hidden">
            <small style="color: #999; font-size: 0.75rem">
                [DEBUG] {{ authStateDebug.state }} | UID: {{ authStateDebug.uid }}
                <span v-if="authStateDebug.email"> | {{ authStateDebug.email }}</span>
            </small>
        </div>

        <div v-if="error" class="error-message">{{ error }}</div>

        <div v-if="!orderSubmittedSuccessfully" class="checkout-contaier">
            <div v-if="!isDataLoaded" class="mt-8">
                <p>{{ $t("loading") }}</p>
            </div>

            <div v-else>
                <!-- If basket is empty -->
                <v-row v-if="!enrichedBasket.length" class="empty-basket mt-8">
                    <div>
                        {{
                            $t("checkout_session_empty") ||
                            "Oops, thats awkward! It seems like your checkout session is empty.."
                        }}
                    </div>
                </v-row>

                <!-- If basket has items -->
                <v-row v-else class="checkout-contents mt-8 px-6 px-sm-12" justify="center">
                    <!-- LEFT COLUMN: ORDER SUMMARY -->
                    <v-col xs="12" sm="12" md="5" lg="5" class="order-summary">
                        <h2 class="pb-4">{{ $t("order_summary") }}</h2>

                        <!-- List each item in the basket -->
                        <div
                            v-for="(item, index) in enrichedBasket"
                            :key="item.internalProductId"
                            class="cart-item mt-4"
                        >
                            <v-row>
                                <v-col class="item-thumbnail">
                                    <div class="image-container">
                                        <v-img
                                            class="item-image"
                                            :src="item.transparent_thumbnail"
                                            alt="Item Image"
                                            contain
                                        ></v-img>
                                        <div
                                            class="quantity-badge"
                                            :class="{ 'quantity-badge--wide': item.quantity > 9 }"
                                        >
                                            {{ item.quantity }}
                                        </div>
                                    </div>
                                </v-col>
                                <v-col class="item-details">
                                    <div class="item-name">
                                        {{ item.translations[pageLang].productName }}
                                    </div>
                                    <div
                                        v-if="prodHasDiffSizes.includes(item.category)"
                                        class="basket-item-variant"
                                    >
                                        {{ $t("size") }}: {{ item.size }}
                                    </div>

                                    <div class="basket-item-price">
                                        {{ itemTotalPrice2DP(item.price_eur, item.quantity) }} EUR
                                    </div>
                                </v-col>
                            </v-row>
                        </div>

                        <!-- Subtotal, Shipping, Taxes, Total -->
                        <v-row class="mt-6 summary-section">
                            <v-col cols="12" class="text-right">
                                <div class="summary-line">
                                    <span>{{ $t("subtotal") || "Subtotal" }}:</span>
                                    <span>{{ Number(basketTotalEUR).toFixed(2) }} EUR</span>
                                </div>
                                <div v-if="eligibleForFirstOrderDiscount" class="summary-line discount-line">
                                    <span>{{ firstOrderDiscountLabelText }}</span>
                                    <span>-{{ discountAmountEUR }} EUR</span>
                                </div>
                                <div v-if="eligibleForFirstOrderDiscount" class="summary-line">
                                    <span>{{ $t("total_after_discount") || "Total after discounts" }}:</span>
                                    <span>{{ discountedSubtotalEUR }} EUR</span>
                                </div>
                                <div class="summary-line">
                                    <span>{{ $t("shipping") || "Shipping" }}:</span>
                                    <span v-if="shippingEUR === 0">{{ $t("free_shipping") }}</span>
                                    <span v-else>{{ shippingEUR.toFixed(2) }} EUR</span>
                                </div>
                                <div
                                    v-if="freeDeliveryFeatureEnabled"
                                    class="summary-line shipping-notice"
                                    :class="{ 'shipping-free': shippingEUR === 0 }"
                                >
                                    <span v-if="shippingEUR === 0">{{ freeShippingAppliedText }}</span>
                                    <span v-else>{{ freeShippingThresholdNoticeText }}</span>
                                </div>
                                <div class="summary-line total-amount">
                                    <span>{{ $t("total") || "Total" }}:</span>
                                    <span>{{ orderTotalEUR }} EUR</span>
                                </div>
                            </v-col>
                        </v-row>
                    </v-col>

                    <!-- RIGHT COLUMN: DELIVERY DETAILS -->
                    <v-col xs="12" sm="12" md="5" lg="5">
                        <v-form>
                            <v-row class="checkout-delivery-details-form">
                                <!-- Right Column Section Heading -->
                                <v-col cols="12" class="py-0">
                                    <h2 class="pb-4">{{ $t("delivery_details") }}</h2>
                                </v-col>

                                <!-- Full Name input -->
                                <v-col cols="12" class="py-0">
                                    <v-text-field
                                        :label="$t('full_name')"
                                        variant="outlined"
                                        color="primary"
                                        v-model="name"
                                        required
                                        :rules="[requiredRule]"
                                    ></v-text-field>
                                </v-col>

                                <!-- Email input -->
                                <v-col cols="12" class="py-0">
                                    <v-text-field
                                        ref="emailInput"
                                        :label="$t('email')"
                                        variant="outlined"
                                        color="primary"
                                        v-model="email"
                                        required
                                        :rules="emailRules"
                                        @blur="validateEmailOnBlur"
                                    ></v-text-field>
                                </v-col>

                                <!-- Phone Number inputs -->
                                <v-col cols="12" class="py-0">
                                    <v-row no-gutters>
                                        <v-col cols="3" class="pr-1 pr-sm-2">
                                            <v-text-field
                                                ref="countryCode"
                                                v-model="countryCode"
                                                :rules="phoneNumberCountryCodeRules"
                                                @blur="validatePhoneNumberCountryCodeOnBlur"
                                                :label="$t('country_code')"
                                                required
                                                variant="outlined"
                                            ></v-text-field>
                                        </v-col>
                                        <v-col cols="9" class="pl-1 pl-sm-2">
                                            <v-text-field
                                                ref="phoneNumberInput"
                                                v-model="phoneNumber"
                                                :rules="phoneNumberRules"
                                                @blur="validatePhoneNumberOnBlur"
                                                :label="$t('phone_number')"
                                                required
                                                variant="outlined"
                                            ></v-text-field>
                                        </v-col>
                                    </v-row>
                                </v-col>

                                <!-- Choose delivery method -->
                                <v-col
                                    cols="12"
                                    class="py-0"
                                    :class="{ 'mb-4': deliverToOptions.length <= 1 }"
                                >
                                    <v-select
                                        :label="$t('deliver_to')"
                                        variant="outlined"
                                        color="primary"
                                        v-model="deliveryMethod"
                                        item-title="text"
                                        item-value="value"
                                        required
                                        :items="deliverToOptions"
                                        :rules="[requiredRule]"
                                        :disabled="deliverToOptions.length <= 1"
                                        :hint="deliverToOptions.length <= 1 ? $t('deliver_to_single_option_hint') : ''"
                                        :persistent-hint="deliverToOptions.length <= 1"
                                    ></v-select>
                                </v-col>

                                <!-- Address fields -->
                                <v-col
                                    cols="12"
                                    class="py-0"
                                    v-show="deliveryMethod === 'home_delivery'"
                                >
                                    <v-text-field
                                        :label="$t('address_line_1')"
                                        variant="outlined"
                                        color="primary"
                                        v-model="address_line_1"
                                        required
                                        :rules="[requiredRule]"
                                    ></v-text-field>
                                </v-col>

                                <v-col
                                    cols="12"
                                    class="py-0"
                                    v-show="deliveryMethod === 'home_delivery'"
                                >
                                    <v-text-field
                                        :label="$t('address_line_2')"
                                        variant="outlined"
                                        color="primary"
                                        v-model="address_line_2"
                                    ></v-text-field>
                                </v-col>

                                <v-col
                                    cols="12"
                                    class="py-0"
                                    v-show="deliveryMethod === 'home_delivery'"
                                >
                                    <v-row no-gutters>
                                        <v-col cols="6" class="pr-1 pr-sm-2">
                                            <v-text-field
                                                :label="$t('city')"
                                                variant="outlined"
                                                color="primary"
                                                v-model="city"
                                                required
                                                :rules="[requiredRule]"
                                            ></v-text-field>
                                        </v-col>
                                        <v-col cols="6" class="pl-1 pl-sm-2">
                                            <v-text-field
                                                :label="$t('zip')"
                                                variant="outlined"
                                                :rules="[requiredRule]"
                                                color="primary"
                                                v-model="zip"
                                                required
                                            ></v-text-field>
                                        </v-col>
                                    </v-row>
                                </v-col>

                                <v-col
                                    cols="12"
                                    class="py-0"
                                    v-if="deliveryMethod === 'home_delivery'"
                                >
                                    <v-select
                                        :label="$t('country') || 'Country'"
                                        variant="outlined"
                                        color="primary"
                                        :disabled="true"
                                        v-model="country"
                                        required
                                        :items="countriesList"
                                        :rules="[requiredRule]"
                                        :hint="$t('international_orders_hint')"
                                        persistent-hint
                                    ></v-select>
                                </v-col>

                                <!-- SPEEDY: Search + Dropdown -->
                                <v-col
                                    cols="12"
                                    class="py-0"
                                    v-if="deliveryMethod === 'office_pickup'"
                                >
                                    <!-- Search field (only when no office selected) -->
                                    <v-text-field
                                        class="mb-2"
                                        ref="searchField"
                                        v-if="!selectedOffice"
                                        v-model="searchTermX"
                                        :label="$t('search_speedy_office')"
                                        :rules="[requiredRule3CharMin]"
                                        variant="outlined"
                                        clearable
                                        @keyup.enter="onManualSearch"
                                        @click:append-inner="onManualSearch"
                                        @click:clear="onClear"
                                    >
                                        <template #append-inner>
                                            <v-progress-circular
                                                v-if="isSearching"
                                                indeterminate
                                                size="18"
                                                width="2"
                                                class="me-1"
                                            />
                                            <v-icon
                                                v-else
                                                icon="mdi-magnify"
                                                class="cursor-pointer"
                                                @click.stop="onManualSearch"
                                            />
                                        </template>
                                    </v-text-field>

                                    <!-- Dropdown of returned offices (only when no office selected) -->
                                    <SimpleAutocomplete
                                        v-if="!selectedOffice"
                                        v-model="selectedOfficeId"
                                        :items="speedyAutocompleteItems"
                                        :label="$t('select_speedy_office')"
                                        :show-label="false"
                                        :loading="loadingOffices"
                                        :disabled="loadingOffices"
                                        :menu-above="true"
                                        clearable
                                        :no-data-text="$t('no_offices_found')"
                                        title-key="name"
                                        subtitle-key="address.fullAddressString"
                                        value-key="id"
                                        :hint-text="
                                            hasMoreOfficesThanLimit
                                                ? `Showing ${officeLimit} results out of ${totalOfficesFound}. Please refine your search by adding the start of the office name.`
                                                : ''
                                        "
                                        @update:model-value="assignSelectedOffice"
                                    />

                                    <!-- Selected office card -->
                                    <v-card
                                        v-else
                                        class="selected-delivery-office my-2 pa-2"
                                        outlined
                                        style="border-radius: 0.75rem"
                                    >
                                        <v-card-text class="text-left">
                                            <div class="text-h6 font-weight-medium mb-3">
                                                {{ $t("selected_office") + ":" }}
                                            </div>

                                            <div class="text-body-1 font-weight-bold">
                                                {{ selectedOffice.name }}
                                            </div>

                                            <div class="text-body-2 mb-1">
                                                {{
                                                    selectedOffice.address?.fullAddressString ||
                                                    $t("no_address_available")
                                                }}
                                            </div>

                                            <div class="text-caption text-grey-darken-1 mb-4">
                                                {{
                                                    selectedOffice.workingTimeFrom &&
                                                    selectedOffice.workingTimeTo
                                                        ? `${$t("opening_hours")}: ${
                                                              selectedOffice.workingTimeFrom
                                                          } - ${selectedOffice.workingTimeTo}`
                                                        : $t("no_opening_hours_available")
                                                }}
                                            </div>

                                            <div
                                                class="text-body-2 text-primary link-like"
                                                @click="clearSelectedOffice"
                                                style="cursor: pointer"
                                            >
                                                {{ $t("change_location") || "Change location" }}
                                            </div>
                                        </v-card-text>
                                    </v-card>
                                </v-col>

                                <v-col
                                    class="invalid-form_values-error"
                                    v-if="invalidFormEntriesMessage"
                                >
                                    <span class="error-hint-message">
                                        {{
                                            $t("invalid_form_values") ||
                                            "Please complete all form fields before submitting."
                                        }}
                                    </span>
                                </v-col>

                                <v-col cols="12" class="py-0 pt-4">
                                    <v-btn
                                        :loading="loadingSubmit"
                                        :disabled="loadingSubmit"
                                        @click.prevent="handleSubmit"
                                        color="black"
                                        size="large"
                                        block
                                    >
                                        {{ $t("submit_order") || "Submit Order" }}
                                    </v-btn>
                                </v-col>
                            </v-row>
                        </v-form>
                    </v-col>
                </v-row>
            </div>
        </div>

        <div v-else class="successfull-checkout-container">
            <v-container class="d-flex justify-center align-center fill-height">
                <div class="pa-6 text-center" max-width="600" elevation="2" rounded="lg">
                    <v-icon size="48" color="success" class="mb-4">mdi-check-circle</v-icon>

                    <div class="text-h5 font-weight-medium mb-2">
                        {{ $t("thank_you") || "Thank you!" }}
                    </div>
                    <div class="text-h5 font-weight-medium mb-2">
                        {{ $t("thanks_for_order") || "Thanks for your order!" }}
                    </div>

                    <div class="text-body-1 mb-4">
                        {{
                            $t("order_confirmation_message") ||
                            "You will receive an email confirmation shortly. Your reference number is"
                        }}
                        <span class="font-weight-bold">{{
                            orderSubmittedSuccessfully_firestore_ref.slice(0, 8)
                        }}</span
                        >.
                    </div>

                    <div class="text-body-2 mb-4">
                        {{
                            $t("questions_contact_us") || "If you have any questions, contact us at"
                        }}
                        <a :href="`mailto:${globalContactEmail}`" class="text-primary">{{
                            globalContactEmail
                        }}</a
                        >.
                    </div>

                    <!-- Guest Signup CTA (moved to separate page) -->
                    <div v-if="isAnonymousUser">
                        <v-divider class="my-6"></v-divider>

                        <div class="mb-4">
                            <div class="text-body-2 mb-4">
                                {{
                                    $t("create_account_prompt") ||
                                    "Would you like to create an account to track your orders?"
                                }}
                            </div>
                            <v-btn
                                color="primary"
                                variant="outlined"
                                @click="$router.push({ name: 'guest_signup' })"
                                class="mb-4"
                            >
                                {{ $t("create_account") || "Create Account" }}
                            </v-btn>
                        </div>
                    </div>

                    <v-btn color="black" variant="flat" @click="$router.push('/about')">
                        {{ $t("back_to_home") || "Back to Home" }}
                    </v-btn>
                </div>
            </v-container>
        </div>
    </div>
</template>

<script>
import SimpleAutocomplete from "@/components/SimpleAutocomplete.vue";
import {
    signInAnonymously,
    updatePassword,
    linkWithCredential,
    EmailAuthProvider,
} from "firebase/auth";
import { firebaseAuth } from "@/mainjsHelpers/FirestoreSetup";

// shared form validation helpers (generic)
import {
    validateRequiredField,
    validateEmail,
    validatePhoneNumberCountryCode,
    validatePhoneNumber,
    validateName,
} from "@/mainjsHelpers/form_validation_rules.js";

let debug = false;

export default {
    name: "CheckoutForm",
    components: { SimpleAutocomplete },
    data() {
        return {
            error: "",

            // Delivery fields
            name: "",
            email: "",
            countryCode: "+359",
            phoneNumber: "",
            address_line_1: "",
            address_line_2: "",
            city: "",
            country: "Bulgaria",
            zip: "",

            validateEmailFlag: false,
            validatePhoneNumberCountryCodeFlag: false,
            validatePhoneNumberFlag: false,
            requiredRule: (v) => (v ? true : this.$t("required_field")),
            invalidFormEntriesMessage: false,

            orderSubmittedSuccessfully: false,
            orderSubmittedSuccessfully_firestore_ref: "",

            // Guest-to-account conversion (on success page)
            showCreateAccountForm: false,
            signupPassword: "",
            signupPasswordConfirm: "",
            loadingSignup: false,
            signupError: "",

            // Speedy search + selection
            searchTermX: "",
            selectedOfficeId: null,
            selectedOffice: null,
            loadingOffices: false,
            showSpeedyDropdown: false,
            // limit of 10 results
            officeLimit: 10,
            totalOfficesFound: 0,

            // Debounce + stale-search guards
            debounceTimer: null,
            suppressNext: false,
            MIN_CHARS: 3,
            DEBOUNCE_MS: 1000,
            searchSeq: 0,

            // Spinner for the search icon
            isSearching: false,

            // Submit
            loadingSubmit: false,

            // Delivery method
            deliveryMethod: "",
        };
    },

    watch: {
        // Auto-search after MIN_CHARS (debounced)
        searchTermX(val) {
            if (this.suppressNext) {
                this.suppressNext = false;
                return;
            }

            const trimmed = (val || "").trim();

            // Below min: stop everything, reset validation, and invalidate in-flight requests
            if (!trimmed || trimmed.length < this.MIN_CHARS) {
                clearTimeout(this.debounceTimer);

                this.searchSeq++; // invalidate in-flight
                this.isSearching = false;
                this.loadingOffices = false;

                this.$refs.searchField?.resetValidation();
                return;
            }

            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                const current = (this.searchTermX || "").trim();
                if (current.length < this.MIN_CHARS) return;

                // validate (this won’t show an error since >= MIN_CHARS, but keeps consistency)
                if (!this.$refs.searchField?.validate()) return;

                this.startLatestSearch(current);
            }, this.DEBOUNCE_MS);
        },

        // If user switches delivery method away from office pickup, clean speedy state
        deliveryMethod(newVal) {
            if (newVal !== "office_pickup") {
                this.clearSelectedOffice();
                this.onClear();
            }
        },

        // When address delivery is disabled, Speedy office is the only choice — default to it.
        // Immediate so it applies whether system_variables has already loaded or loads later,
        // and only fires while unset so it never overwrites a user's own selection.
        orderToAddressEnabled: {
            immediate: true,
            handler(enabled) {
                if (!enabled && !this.deliveryMethod) {
                    this.deliveryMethod = "office_pickup";
                }
            },
        },

        // Track totalOfficesFound whenever store results change
        speedyOffices: {
            immediate: true,
            handler(newList) {
                const arr = Array.isArray(newList) ? newList : [];
                this.totalOfficesFound = arr.length;
            },
        },
    },

    computed: {
        emailRules() {
            return [
                (v) => {
                    if (!this.validateEmailFlag) return true;
                    return validateEmail(v, this.$t);
                },
            ];
        },
        phoneNumberCountryCodeRules() {
            return [
                (v) => {
                    if (!this.validatePhoneNumberCountryCodeFlag) return true;
                    return validateRequiredField(v, this.$t);
                },
                (v) => {
                    if (!this.validatePhoneNumberCountryCodeFlag) return true;
                    return validatePhoneNumberCountryCode(v, this.$t);
                },
            ];
        },
        phoneNumberRules() {
            return [
                (v) => validateRequiredField(v, this.$t),
                (v) => validatePhoneNumber(v, this.$t),
            ];
        },
        isDataLoaded() {
            return (
                this.$store.getters.productsArray.length > 0 &&
                this.$store.getters["systemVariables/isLoaded"]
            );
        },
        enrichedBasket() {
            return this.$store.getters.getEnrichedBasket;
        },
        basketTotalEUR() {
            return this.$store.getters.getBasketTotalEUR;
        },
        eligibleForFirstOrderDiscount() {
            return this.$store.getters.eligibleForFirstOrderDiscount;
        },
        discountAmountEUR() {
            return this.$store.getters.getDiscountAmountEUR;
        },
        discountedSubtotalEUR() {
            return this.$store.getters.getDiscountedBasketTotalEUR;
        },
        firstOrderDiscountLabelText() {
            return this.$t("first_order_discount_label", {
                percent: this.$store.getters["systemVariables/firstOrderDiscountPercent"],
            });
        },
        freeDeliveryFeatureEnabled() {
            return this.$store.getters["systemVariables/freeDeliveryEnabled"];
        },
        shippingEUR() {
            const shippingCost = this.$store.getters["systemVariables/shippingCostEUR"];
            const threshold = this.$store.getters["systemVariables/freeDeliveryOverAmount"];
            if (!threshold || threshold <= 0) return shippingCost;
            const discountedSubtotal = Number(this.$store.getters.getDiscountedBasketTotalEUR);
            return discountedSubtotal >= threshold ? 0 : shippingCost;
        },
        freeShippingThresholdNoticeText() {
            return this.$t("free_shipping_threshold_notice", {
                amount: this.$store.getters["systemVariables/freeDeliveryOverAmount"],
            });
        },
        freeShippingAppliedText() {
            return this.$t("free_shipping_applied", {
                amount: this.$store.getters["systemVariables/freeDeliveryOverAmount"],
            });
        },
        orderTotalEUR() {
            const discountedSubtotal = Number(this.$store.getters.getDiscountedBasketTotalEUR);
            return (discountedSubtotal + this.shippingEUR).toFixed(2);
        },
        orderToAddressEnabled() {
            return this.$store.getters["systemVariables/orderToAddressEnabled"];
        },
        deliverToOptions() {
            const options = [{ text: this.$t("speedy_office"), value: "office_pickup" }];
            if (this.orderToAddressEnabled) {
                options.unshift({ text: this.$t("address"), value: "home_delivery" });
            }
            return options;
        },
        countriesList() {
            return this.$store.getters.getCountriesList;
        },
        speedyOffices() {
            // options come from the store action fetchSpeedyOffices(term)
            return this.$store.state.speedyOffices;
        },
        limitedSpeedyOffices() {
            const list = Array.isArray(this.speedyOffices) ? this.speedyOffices : [];
            return list.slice(0, this.officeLimit);
        },
        hasMoreOfficesThanLimit() {
            const list = Array.isArray(this.speedyOffices) ? this.speedyOffices : [];
            return list.length > this.officeLimit;
        },
        speedyAutocompleteItems() {
            // show the full list (parent controls pagination/limits if needed)
            const list = Array.isArray(this.speedyOffices) ? this.speedyOffices : [];
            return list.map((o) => ({
                id: o.id,
                name: o.raw?.name || o.name || "",
                address: {
                    fullAddressString:
                        o.raw?.address?.fullAddressString || o.address?.fullAddressString || "",
                },
                raw: o.raw || o,
            }));
        },
        isAnonymousUser() {
            return !!(
                typeof firebaseAuth !== "undefined" &&
                firebaseAuth.currentUser &&
                firebaseAuth.currentUser.isAnonymous === true
            );
        },
        authStateDebug() {
            const user = firebaseAuth?.currentUser;
            if (!user) {
                return { state: "Signed Out", uid: "none" };
            }
            if (user.isAnonymous) {
                return { state: "Anonymous Guest", uid: user.uid };
            }
            return { state: "Full Account", uid: user.uid, email: user.email };
        },
    },

    methods: {
        // ---- Rule ----
        requiredRule3CharMin(v) {
            return (
                (v && v.trim().length >= this.MIN_CHARS) ||
                `Enter at least ${this.MIN_CHARS} characters`
            );
        },

        // Manual search (Enter or icon)
        onManualSearch() {
            const field = this.$refs.searchField;
            const trimmed = (this.searchTermX || "").trim();

            if (!field?.validate()) return;

            this.startLatestSearch(trimmed);
        },

        // Single source of truth for fetching offices with stale-search protection
        async startLatestSearch(term) {
            const mySeq = ++this.searchSeq;

            this.isSearching = true;
            this.loadingOffices = true;

            try {
                await this.$store.dispatch("fetchSpeedyOffices", term);

                // If another search started since this one, ignore UI updates
                if (mySeq !== this.searchSeq) return;
                // Nothing else needed here: computed speedyOffices updates from store
            } catch (e) {
                if (mySeq !== this.searchSeq) return;
                this.error = e?.message || String(e);
            } finally {
                if (mySeq === this.searchSeq) {
                    this.isSearching = false;
                    this.loadingOffices = false;
                }
            }
        },

        onClear() {
            this.suppressNext = true;

            clearTimeout(this.debounceTimer);

            // Invalidate any in-flight request immediately
            this.searchSeq++;

            this.isSearching = false;
            this.loadingOffices = false;

            this.$refs.searchField?.resetValidation();
        },

        assignSelectedOffice(id) {
            // do nothing if id is empty - stop rerender loop and error
            if (id === null) return;

            this.selectedOffice = this.speedyOffices.find((office) => office.id === id) || null;
        },

        clearSelectedOffice() {
            this.selectedOfficeId = null;
            this.selectedOffice = null;
        },

        // Check if all required fields are filled
        checkRequiredFields() {
            if (this.deliveryMethod === "home_delivery") {
                const check =
                    this.name &&
                    this.email &&
                    this.countryCode &&
                    this.phoneNumber &&
                    this.address_line_1 &&
                    this.city &&
                    this.country &&
                    this.zip;
                if (debug) console.log("check: ", check);
                return check;
            }

            if (this.deliveryMethod === "office_pickup") {
                const check =
                    this.name &&
                    this.email &&
                    this.countryCode &&
                    this.phoneNumber &&
                    this.selectedOfficeId;
                if (debug) console.log("check: ", check);
                return check;
            }

            if (!this.deliveryMethod) return false;
        },

        async createAnonymousUser() {
            try {
                await signInAnonymously(firebaseAuth);
                return true; // Success
            } catch (error) {
                this.error =
                    this.$t("anonymous_user_creation_failed") ||
                    "Failed to create anonymous user session.";
                return false; // Failure
            }
        },
        async handleSubmit() {
            // Check form validity
            const validForm = this.checkRequiredFields();
            if (!validForm) {
                this.invalidFormEntriesMessage = true;
                return;
            } else this.invalidFormEntriesMessage = false;

            // Set loading state
            this.loadingSubmit = true;

            // If no user is logged in (full or anon), create anonymous user session, else skip step as we have some kind of uid in both cases
            if (!this.is_signed_in) {
                const success = await this.createAnonymousUser();
                if (!success) {
                    this.error =
                        this.$t("anonymous_user_creation_failed") ||
                        "Failed to create anonymous user session.";
                    this.loadingSubmit = false;
                    return; // Stop creation of order if anonymous user creation failed
                }
            }

            // Reset error message
            this.error = "";

            // ensure country code starts with '+'
            const countryCodeProper = this.countryCode.startsWith("+")
                ? this.countryCode
                : `+${this.countryCode}`;

            // By this point we have a user (either logged in or just created anonymous)
            // Guaranteed to have currentUser.uid
            const orderDetails = {
                products_in_order: this.enrichedBasket.map((item) => ({
                    product_id: item.id,
                    internal_product_id: item.internalProductId,
                    quantity: item.quantity,
                    size: item.size,
                })),
                client_order_details: {
                    order_date_readable: new Date().toDateString(), // Thu Jan 29 2026
                    order_timestamp_proper: new Date().toISOString(), // proper with timezone 2026-01-29T20:35:40.466Z
                    order_timestamp_unix: Date.now(), // unix ms 1769718940466
                    order_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Europe/London
                    order_subtotal_eur: this.basketTotalEUR,
                    discount_percent_applied: this.eligibleForFirstOrderDiscount
                        ? this.$store.getters["systemVariables/firstOrderDiscountPercent"]
                        : 0,
                    discount_amount_eur: this.discountAmountEUR,
                    shipping_eur: this.shippingEUR,
                    order_total_eur: this.orderTotalEUR,
                },
                customer_details: {
                    full_name: this.name,
                    email: this.email,
                    phone_number: {
                        country_code: countryCodeProper,
                        number: this.phoneNumber,
                    },
                    address_line_1: this.address_line_1,
                    address_line_2: this.address_line_2,
                    city: this.city,
                    country: this.country,
                    zip: this.zip,
                },
                delivery_method: this.deliveryMethod,
                selected_office_id:
                    this.deliveryMethod === "office_pickup" ? this.selectedOfficeId || null : null,
                selected_office_details: {
                    office_address:
                        this.deliveryMethod === "office_pickup"
                            ? this.selectedOffice?.address || null
                            : null,
                    office_name:
                        this.deliveryMethod === "office_pickup"
                            ? this.selectedOffice?.name || null
                            : null,
                    office_nameEn:
                        this.deliveryMethod === "office_pickup"
                            ? this.selectedOffice?.nameEn || null
                            : null,
                    working_time_from:
                        this.deliveryMethod === "office_pickup"
                            ? this.selectedOffice?.workingTimeFrom || null
                            : null,
                    working_time_to:
                        this.deliveryMethod === "office_pickup"
                            ? this.selectedOffice?.workingTimeTo || null
                            : null,
                },
                order_status: "Pending",
                // Add created_by_user_id (works for logged-in or anonymous users)
                created_by_user_id: firebaseAuth.currentUser.uid,
            };

            const firestoreResult = await this.$store.dispatch(
                "createOrderInFirestore",
                orderDetails,
            );

            if (firestoreResult.callResult === true) {
                this.$store.dispatch("clearBasket");
                this.orderSubmittedSuccessfully = true;
                this.orderSubmittedSuccessfully_firestore_ref = firestoreResult.firestoreReturnedId;

                // Refresh the user's order history so a first-order discount can't be reused
                // if they place a second order in the same session before revisiting /account
                if (this.full_user_authed && this.userDetails?.user?.uid) {
                    this.$store.dispatch("fetchUserOrders", this.userDetails.user.uid);
                }

                // Store guest email and order ID if user is anonymous (for account conversion flow)
                if (firebaseAuth.currentUser?.isAnonymous === true) {
                    this.$store.commit("setLastGuestSignupEmail", this.email);
                    this.$store.commit("setLastGuestOrderId", firestoreResult.firestoreReturnedId);
                }

                if (this.globalCommunications_Email) {
                    this.sendEmailConfirmationOut({
                        shortRef: this.orderSubmittedSuccessfully_firestore_ref.slice(0, 8),
                        name: this.name,
                        email: this.email,
                        deliveryMethod: this.deliveryMethod,
                        deliveryInfo: {
                            address_line_1: this.address_line_1,
                            address_line_2: this.address_line_2,
                            zip: this.zip,
                            city: this.city,
                            country: this.country,

                            selectedOfficeName: this.selectedOffice?.name || null,
                            selectedOfficeAddress:
                                this.selectedOffice?.address?.fullAddressString || null,
                        },
                    });
                }
            } else {
                this.error = firestoreResult;
            }

            this.loadingSubmit = false;
        },

        async sendEmailConfirmationOut(emailDetails) {
            this.$store.dispatch("sendEmailConfirmation", emailDetails);
        },

        itemTotalPrice2DP(price, quantity) {
            const formatted = (Math.floor(price * quantity * 100) / 100).toFixed(2);
            return Number(formatted) % 1 === 0 ? String(Math.floor(price * quantity)) : formatted;
        },

        validatePhoneNumberCountryCodeOnBlur() {
            this.validatePhoneNumberCountryCodeFlag = true;
            this.$refs.countryCode?.validate();
        },

        validatePhoneNumberOnBlur() {
            this.validatePhoneNumberFlag = true;
            this.$refs.phoneNumberInput?.validate();
        },

        validateEmailOnBlur() {
            this.validateEmailFlag = true;
            this.$refs.emailInput?.validate();
        },
    },
};
</script>

<style scoped>
.cursor-pointer {
    cursor: pointer;
}
.checkout-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
}
.checkout-title {
    font-size: 2rem;
    font-weight: 600;
    margin-bottom: 2rem;
}
.line-separator {
    border-top: 1px solid #ccc;
    width: 80%;
    margin-top: 1rem;
}
/* .order-summary {
    padding-right: 2rem;
} */
.cart-item {
    border-bottom: 1px solid #eee;
    padding-bottom: 1rem;
    margin-bottom: 1rem;
}

/* Image container to enforce a square shape with an outline */
.image-container {
    position: relative;
    width: 100%;
    aspect-ratio: 1 / 1; /* Keeps it square */
    max-width: 115px; /* Optional, max size on large screens */
    background-color: #e8e8e8;
    border: 1px solid #847a7a;
    border-radius: 4px;
    /* overflow: hidden; */
}

/* Ensure the image fills the container */
.item-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

/* Quantity badge positioned in the top right over the image outline */
.quantity-badge {
    position: absolute;
    top: -0.5rem;
    right: -0.5rem;
    background: #847a7a;
    color: #fff;
    padding: 2px 6px;
    font-size: 0.8rem;
    font-weight: 900;
    border-radius: 50%;
    text-align: center;
    line-height: 15px;
}

/* Style for 2+ digit quantities */
.quantity-badge--wide {
    border-radius: 45px;
    padding: 2px 6px;
    min-width: auto;
}

/* Product details */
.item-name {
    font-weight: 500;
    text-transform: uppercase;
}
.summary-line {
    display: flex;
    justify-content: space-between;
    margin: 0.3rem 0;
}
.total-amount {
    font-weight: bold;
    margin-top: 0.5rem;
}
.shipping-notice {
    font-size: 0.8rem;
    opacity: 0.6;
    justify-content: flex-end;
}
.shipping-notice.shipping-free {
    opacity: 0.75;
    color: #2e7d32;
}

.checkout-delivery-details-form > .v-col .v-text-field {
    margin: 0;
    padding: 0px;
}

/* General Styles for All Screens */
.order-summary .v-row {
    display: flex; /* Ensure the row is a flex container */
    flex-direction: row; /* Align items horizontally */
    align-items: center; /* Vertically align items */
    justify-content: flex-start; /* Align items to the start */
    flex-wrap: nowrap; /* Prevent wrapping of items */
}

.order-summary .item-thumbnail {
    flex: 0 0 25%; /* Image takes up 25% of the row */
    max-width: 25%; /* Ensure the image container doesn't exceed 25% */
    margin-right: 1rem; /* Add spacing between image and text */
}

.order-summary .item-details {
    flex: 0 0 75%; /* Text takes up 75% of the row */
    max-width: 75%; /* Ensure the text container doesn't exceed 75% */
    padding-left: 0; /* Remove extra padding */
    text-align: left; /* Align text to the left */
    display: flex; /* Use flexbox for alignment */
    flex-direction: column; /* Stack text elements vertically */
    justify-content: center; /* Vertically center the text */
}
.error-message {
    color: red;
    font-size: 1.2rem;
    margin-top: 1rem;
}
.error-hint-message {
    color: red;
}

.selected-delivery-office {
    background-color: #e8e8e8;
    border: 1px solid #847a7a;
}
.link-like {
    color: blue;
    cursor: pointer;
    text-decoration: none;
}

.link-like:hover {
    text-decoration: underline;
}

.speedy-limit-hint {
    pointer-events: none; /* makes it unclickable */
    opacity: 0.75;
}

.auth-debug-display {
    text-align: center;
    margin-top: 0.5rem;
    margin-bottom: 1rem;
}

/* Mobile Styles */
@media screen and (max-width: 600px) {
    .checkout-contents {
        flex-direction: column !important; /* Force stacking of columns */
        /* padding: 0 1rem; */ /* Add padding to prevent content from touching the edges */
    }

    .checkout-contents > .v-col {
        width: 100% !important; /* Ensure columns take up the full width */
        max-width: 100%; /* Prevent any max-width constraints */
        margin-bottom: 1rem; /* Add spacing between stacked columns */
    }

    .order-summary {
        width: 100%; /* Ensure both columns take up the full width */
        /* padding: 0 1rem; */ /* Add padding for better spacing */
    }

    .order-summary .v-row {
        display: flex !important; /* Ensure the row is a flex container */
        flex-direction: row !important; /* Force horizontal alignment */
        align-items: center; /* Vertically align items */
        justify-content: flex-start; /* Align items to the start */
        flex-wrap: nowrap; /* Prevent wrapping of items */
    }

    .order-summary .item-thumbnail {
        flex: 0 0 25%; /* Image takes up 25% of the row */
        max-width: 25%; /* Ensure the image container doesn't exceed 25% */
        margin-right: 1rem; /* Add spacing between image and text */
    }

    .order-summary .item-details {
        flex: 0 0 75%; /* Text takes up 75% of the row */
        max-width: 75%; /* Ensure the text container doesn't exceed 75% */
        padding-left: 0; /* Remove extra padding */
        text-align: left; /* Align text to the left */
        display: flex; /* Use flexbox for alignment */
        flex-direction: column; /* Stack text elements vertically */
        justify-content: center; /* Vertically center the text */
    }

    .order-summary .item-image {
        width: 100%; /* Ensure the image fills its container */
        height: auto; /* Maintain aspect ratio */
        object-fit: cover; /* Ensure the image fits nicely */
    }
}
</style>
