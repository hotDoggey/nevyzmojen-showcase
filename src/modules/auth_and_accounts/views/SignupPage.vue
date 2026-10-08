<template>
    <h1 class="pt-8">{{ $t("create_account") || "Create Account" }}</h1>
    <v-container>
        <v-row align="center" justify="center" class="mx-n5 mx-md-n2">
            <v-col cols="12" sm="8" md="6" lg="5" class="pt-8 pt-sm-12 v-col-custom">
                <v-form
                    action="submit"
                    ref="form_to_validate"
                    @submit.prevent="handleSubmit"
                    class="signup-form"
                >
                    <!-- First name -->
                    <v-text-field
                        ref="first_name"
                        v-model="first_name"
                        :rules="nameRules"
                        :label="$t('first_name') || 'First Name'"
                        required
                        variant="outlined"
                    />

                    <!-- Surname -->
                    <v-text-field
                        ref="surname"
                        v-model="surname"
                        :rules="nameRules"
                        :label="$t('surname') || 'Surname'"
                        required
                        variant="outlined"
                    />

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

                    <!-- Password -->
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

                    <div v-if="errorMessage" class="error-message py-2">
                        {{ errorMessage }}
                    </div>

                    <v-btn color="black" type="submit" size="large" class="login-btn" block>
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
import {
    validateRequiredField,
    validateEmail,
    validateName,
    validatePhoneNumberCountryCode,
    validatePhoneNumber,
} from "@/mainjsHelpers/form_validation_rules.js";
import { validatePassword } from "../auth_helper_functions/auth_field_rules.js";

export default {
    data() {
        return {
            errorMessage: "",
            email: "",
            first_name: "",
            surname: "",
            password: "",
            countryCode: "+359",
            phoneNumber: "",

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

        // Names: required + letters-only
        nameRules() {
            return [(v) => validateRequiredField(v, this.$t), (v) => validateName(v, this.$t)];
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
                (v) => {
                    if (!this.validatePhoneNumberFlag) return true;
                    return validateRequiredField(v, this.$t);
                },
                (v) => {
                    if (!this.validatePhoneNumberFlag) return true;
                    return validatePhoneNumber(v, this.$t);
                },
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

        async handleSubmit() {
            this.errorMessage = "";

            // Enable validation on submit
            this.validateEmailFlag = true;
            this.validatePhoneNumberCountryCodeFlag = true;
            this.validatePhoneNumberFlag = true;
            this.validatePasswordFlag = true;

            const { valid } = await this.$refs.form_to_validate?.validate();
            if (!valid) {
                this.errorMessage =
                    this.$t("correct_form_errors") || "Please correct form errors to proceed.";
                return;
            }

            await this.signUserUp();
        },

        async signUserUp() {
            // Add + to country code if needed
            const countryCodeProper = this.countryCode.startsWith("+")
                ? this.countryCode
                : `+${this.countryCode}`;

            const newUserCredentials = {
                email: this.email,
                password: this.password,
                first_name: this.first_name,
                country_code: countryCodeProper,
                number: this.phoneNumber,
                surname: this.surname,
                user_role: "customer",
                language: this.pageLang, // capture the language the user was browsing in at signup time
            };

            const result = await this.$store.dispatch("createAuthAndDetails", newUserCredentials);

            if (result === true) {
                this.$router.push("/store");
            } else {
                this.errorMessage = result;
            }
        },
    },
};
</script>

<style>
.signup-form {
    width: 100%;
    font-family: Arial, Helvetica, sans-serif;
}
</style>
