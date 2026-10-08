<template>
    <h1 class="pt-8">{{ $t("create_account") || "Create Account" }}</h1>
    <v-container>
        <v-row align="center" justify="center" class="mx-n5 mx-md-n2">
            <v-col cols="12" sm="8" md="6" lg="5" class="pt-8 pt-sm-12 v-col-custom">
                <v-form
                    action="submit"
                    ref="form_to_validate"
                    @submit.prevent="handleConvert"
                    class="signup-form"
                >
                    <!-- Email -->
                    <v-text-field
                        ref="emailInput"
                        v-model="email"
                        :rules="emailRules"
                        @blur="validateEmailOnBlur"
                        :label="$t('email') || 'Email'"
                        required
                        variant="outlined"
                    />

                    <!-- Name fields -->
                    <v-row no-gutters class="my-0">
                        <v-col cols="6" class="pr-1 pr-sm-2">
                            <v-text-field
                                ref="first_name"
                                v-model="first_name"
                                :label="$t('first_name') || 'First name'"
                                :rules="nameRules"
                                required
                                variant="outlined"
                            />
                        </v-col>
                        <v-col cols="6" class="pl-1 pl-sm-2">
                            <v-text-field
                                ref="surname"
                                v-model="surname"
                                :label="$t('surname') || 'Surname'"
                                :rules="nameRules"
                                required
                                variant="outlined"
                            />
                        </v-col>
                    </v-row>

                    <!-- Phone number -->
                    <v-row no-gutters class="my-0">
                        <v-col cols="3" class="pr-1 pr-sm-2">
                            <v-text-field
                                ref="countryCode"
                                v-model="countryCode"
                                :rules="phoneNumberCountryCodeRules"
                                @blur="validatePhoneNumberCountryCodeOnBlur"
                                :label="$t('country_code') || 'Country Code'"
                                required
                                variant="outlined"
                            />
                        </v-col>
                        <v-col cols="9" class="pl-1 pl-sm-2">
                            <v-text-field
                                ref="phoneNumberInput"
                                v-model="phoneNumber"
                                :rules="phoneNumberRules"
                                @blur="validatePhoneNumberOnBlur"
                                :label="$t('phone_number') || 'Phone Number'"
                                required
                                variant="outlined"
                            />
                        </v-col>
                    </v-row>

                    <v-text-field
                        ref="passwordInput"
                        v-model="password"
                        type="password"
                        :rules="passwordRules"
                        @blur="validatePasswordOnBlur"
                        :label="$t('password') || 'Password'"
                        required
                        variant="outlined"
                    />

                    <v-text-field
                        v-model="passwordConfirm"
                        :label="$t('confirm_password') || 'Confirm Password'"
                        type="password"
                        variant="outlined"
                        required
                        :rules="confirmPasswordRules"
                    />

                    <div v-if="error" class="error-message my-2">
                        {{ error }}
                    </div>

                    <v-btn color="black" type="submit" size="large" :loading="loading" block>
                        {{ $t("create_account") || "Create Account" }}
                    </v-btn>
                </v-form>
            </v-col>
        </v-row>
    </v-container>

    <div class="pt-4">
        {{ $t("signup_page_hint_1_already_have_acc") || "Already have an account with us?" }}
        <br />
        <router-link style="text-decoration: underline" to="/login">
            {{ $t("login_v2") || "here" }}
        </router-link>
    </div>
</template>

<script>
import { EmailAuthProvider, linkWithCredential } from "firebase/auth";
import { firebaseAuth } from "@/mainjsHelpers/FirestoreSetup";
import {
    validateRequiredField,
    validateName,
    validateEmail,
    validatePhoneNumberCountryCode,
    validatePhoneNumber,
} from "@/mainjsHelpers/form_validation_rules.js";
import { validatePassword } from "@/modules/auth_and_accounts/auth_helper_functions/auth_field_rules.js";

export default {
    name: "GuestSignUpPage",
    data() {
        return {
            email: this.$store.state.lastGuestSignupEmail || "",
            first_name: "",
            surname: "",
            countryCode: "+359",
            phoneNumber: "",
            password: "",
            passwordConfirm: "",
            loading: false,
            error: "",

            // Blur-validation flags (have to click away from field to trigger validation)
            validateEmailFlag: false,
            validatePhoneNumberCountryCodeFlag: false,
            validatePhoneNumberFlag: false,
            validatePasswordFlag: false,
        };
    },
    computed: {
        // Generic required rule
        requiredRule() {
            return [(v) => validateRequiredField(v, this.$t)];
        },

        // Email: required + format
        emailRules() {
            return [
                (v) => {
                    if (!this.validateEmailFlag) return true;
                    return validateEmail(v, this.$t);
                },
            ];
        },
        // Names: required + letters-only
        nameRules() {
            return [(v) => validateRequiredField(v, this.$t), (v) => validateName(v, this.$t)];
        },

        // Country Code: Required + country code format
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

        // Phone Number: Required + phone number format
        phoneNumberRules() {
            return [
                (v) => validateRequiredField(v, this.$t),
                (v) => validatePhoneNumber(v, this.$t),
            ];
        },
        // Password: required + complexity
        passwordRules() {
            return [
                (v) => {
                    if (!this.validatePasswordFlag) return true;
                    return validateRequiredField(v, this.$t);
                },
                (v) => {
                    if (!this.validatePasswordFlag) return true;
                    return validatePassword(v, this.$t);
                },
            ];
        },

        // Confirm Password: required + same as password
        confirmPasswordRules() {
            return [
                (v) => validateRequiredField(v, this.$t),
                (v) =>
                    v === this.password
                        ? true
                        : this.$t("passwords_do_not_match") || "Passwords do not match",
            ];
        },
    },
    methods: {
        validateEmailOnBlur() {
            this.validateEmailFlag = true;
            this.$refs.emailInput?.validate();
        },
        validatePhoneNumberCountryCodeOnBlur() {
            this.validatePhoneNumberCountryCodeFlag = true;
            this.$refs.countryCode?.validate();
        },
        validatePhoneNumberOnBlur() {
            this.validatePhoneNumberFlag = true;
            this.$refs.phoneNumberInput?.validate();
        },
        validatePasswordOnBlur() {
            this.validatePasswordFlag = true;
            this.$refs.passwordInput?.validate();
        },

        async handleConvert() {
            this.error = "";
            this.loading = true;

            // Enable validation on submit
            this.validateEmailFlag = true;
            this.validatePhoneNumberCountryCodeFlag = true;
            this.validatePhoneNumberFlag = true;
            this.validatePasswordFlag = true;

            // Final validation check
            const { valid } = await this.$refs.form_to_validate?.validate();
            if (!valid) {
                this.loading = false;
                this.errorMessage =
                    this.$t("correct_form_errors") || "Please correct form errors to proceed.";
                return;
            }

            try {
                const user = firebaseAuth.currentUser;
                if (!user || !user.isAnonymous) {
                    this.error = this.$t("no_anonymous_session") || "No anonymous session found.";
                    this.loading = false;
                    return;
                }

                const credential = EmailAuthProvider.credential(this.email, this.password);
                await linkWithCredential(user, credential);

                // Add + to country code if needed
                const countryCodeProper = this.countryCode.startsWith("+")
                    ? this.countryCode
                    : `+${this.countryCode}`;

                // Create user profile in Firestore via store action
                const res = await this.$store.dispatch("createUserDetails", {
                    email: this.email,
                    password: this.password,
                    first_name: this.first_name,
                    surname: this.surname,
                    country_code: countryCodeProper,
                    number: this.phoneNumber,
                    user_role: "customer",
                    language: this.pageLang, // capture the language the user was browsing in at signup time
                });

                if (res === true) {
                    // Clear guest tracking and navigate to account page
                    this.$store.commit("clearLastGuestSignup");
                    // Redirect user to account page which should be populated with their order now
                    // this.$router.push({ name: "about" });
                    // Refresh page
                    window.location.reload();
                } else {
                    this.error =
                        res || this.$t("failed_create_account") || "Failed to create account.";
                }
            } catch (err) {
                if (err?.code === "auth/email-already-in-use") {
                    this.error =
                        this.$t("email_already_in_use") || "This email is already registered.";
                } else {
                    this.error = err.message || String(err);
                }
            } finally {
                this.loading = false;
            }
        },
    },
    mounted() {
        if (!this.email) {
            // If no email known, try to use order info
            const last = this.$store.state.lastGuestOrderId;
            // nothing more to do here for now
        }
    },
};
</script>

<style scoped>
.signup-form {
    width: 100%;
    font-family: Arial, Helvetica, sans-serif;
}
</style>
