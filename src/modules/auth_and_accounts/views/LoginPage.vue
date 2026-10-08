<template>
    <h1 class="pt-16">{{ $t("login_v1") || "Login" }}</h1>
    <v-container>
        <v-row align="center" justify="center">
            <v-col cols="12" sm="8" md="6" lg="4" class="pt-12 v-col-custom">

                <!-- ── LOGIN VIEW ──────────────────────────────── -->
                <v-form
                    v-if="!showForgotPassword"
                    ref="form_to_validate"
                    @submit.prevent="attemptLogin"
                    class="login-form"
                >
                    <v-text-field
                        ref="emailInput"
                        v-model="email"
                        :rules="emailRules"
                        @blur="validateEmailOnBlur"
                        :label="$t('email') || 'Email'"
                        variant="outlined"
                    />

                    <v-text-field
                        ref="passwordInput"
                        v-model="password"
                        type="password"
                        :rules="requiredRule"
                        :label="$t('password') || 'Password'"
                        variant="outlined"
                    />

                    <div v-if="errorMessage" class="login-error-message mb-3">
                        {{ errorMessage }}
                    </div>

                    <v-btn color="black" size="large" type="submit" class="mt-0 login-btn">
                        {{ $t("login_v1") || "Login" }}
                    </v-btn>

                    <div class="forgot-password-link mt-4">
                        <button type="button" class="internal-link" @click="showForgotPasswordView">
                            {{ $t("forgot_password") }}
                        </button>
                    </div>
                </v-form>

                <!-- ── FORGOT PASSWORD VIEW ────────────────────── -->
                <v-form
                    v-else
                    ref="forgot_form"
                    @submit.prevent="submitForgotPassword"
                    class="login-form"
                >
                    <!-- Success state: replace form fields with confirmation message -->
                    <div v-if="forgotPasswordSuccess" class="reset-success-message">
                        {{ $t("password_reset_email_sent") }}
                    </div>

                    <template v-else>
                        <v-text-field
                            ref="forgotEmailInput"
                            v-model="forgotPasswordEmail"
                            :rules="forgotEmailRules"
                            @blur="validateForgotEmailOnBlur"
                            :label="$t('email') || 'Email'"
                            variant="outlined"
                        />

                        <div v-if="forgotPasswordError" class="login-error-message mb-3">
                            {{ $t("something_went_wrong_try_again") }}
                        </div>

                        <v-btn
                            color="black"
                            size="large"
                            type="submit"
                            class="login-btn"
                            :loading="forgotPasswordLoading"
                        >
                            {{ $t("send_reset_link") }}
                        </v-btn>
                    </template>

                    <!-- Cancel link — always visible so user can return at any point -->
                    <div class="back-to-login-link mt-4">
                        <button type="button" class="internal-link" @click="backToLogin">
                            {{ $t("back_to_login") }}
                        </button>
                    </div>
                </v-form>

            </v-col>
        </v-row>
    </v-container>
    <div class="pt-6">
        {{ $t("signupText1") || "Don't have an account with us yet?" }}
        <br />
        <router-link style="text-decoration: underline" to="/signup">{{
            $t("signupText2") || "Sign up"
        }}</router-link>
    </div>
</template>

<script>
import { validateEmail, validateRequiredField } from "@/mainjsHelpers/form_validation_rules.js";

export default {
    data() {
        return {
            // Login form
            email: "",
            password: "",
            validateEmailFlag: false,
            errorMessage: "",

            // Forgot password view
            showForgotPassword: false,
            forgotPasswordEmail: "",
            validateForgotEmailFlag: false,
            forgotPasswordLoading: false,
            forgotPasswordSuccess: false,
            forgotPasswordError: false,
        };
    },

    computed: {
        // Login email — only validates after the user has blurred the field
        emailRules() {
            return [
                (v) => {
                    if (!this.validateEmailFlag) return true;
                    return validateEmail(v, this.$t);
                },
            ];
        },

        requiredRule() {
            return [(v) => validateRequiredField(v, this.$t)];
        },

        // Forgot password email — same blur-gated pattern
        forgotEmailRules() {
            return [
                (v) => {
                    if (!this.validateForgotEmailFlag) return true;
                    return validateEmail(v, this.$t);
                },
            ];
        },
    },

    methods: {
        // ── Login ────────────────────────────────────────────────

        validateEmailOnBlur() {
            this.validateEmailFlag = true;
            this.$refs.emailInput?.validate();
        },

        async attemptLogin() {
            this.errorMessage = "";
            this.validateEmailFlag = true;

            const { valid } = await this.$refs.form_to_validate?.validate();
            if (!valid) {
                this.errorMessage =
                    this.$t("correct_form_errors") || "Please correct form errors to proceed.";
                return;
            }

            const result = await this.$store.dispatch("signUserInWithEmail", {
                email: this.email,
                password: this.password,
            });

            if (result === true) {
                this.$router.push("/account");
            } else {
                // Map known Firebase auth error codes to friendly messages.
                // auth/invalid-credential covers wrong password and unknown email in Firebase SDK v10+.
                const credentialErrors = [
                    "auth/invalid-credential",
                    "auth/wrong-password",
                    "auth/user-not-found",
                ];
                this.errorMessage = credentialErrors.includes(result)
                    ? this.$t("invalid_login_credentials")
                    : this.$t("something_went_wrong_try_again");
            }
        },

        // ── Forgot password ──────────────────────────────────────

        showForgotPasswordView() {
            // Pre-fill the reset email field with whatever the user already typed in the login form
            this.forgotPasswordEmail = this.email;
            this.showForgotPassword = true;
        },

        backToLogin() {
            this.showForgotPassword = false;
            this.forgotPasswordEmail = "";
            this.validateForgotEmailFlag = false;
            this.forgotPasswordSuccess = false;
            this.forgotPasswordError = false;
        },

        validateForgotEmailOnBlur() {
            this.validateForgotEmailFlag = true;
            this.$refs.forgotEmailInput?.validate();
        },

        async submitForgotPassword() {
            this.forgotPasswordError = false;
            this.validateForgotEmailFlag = true;

            const { valid } = await this.$refs.forgot_form?.validate();
            if (!valid) return;

            this.forgotPasswordLoading = true;

            try {
                await this.$store.dispatch("sendPasswordResetLink", {
                    email: this.forgotPasswordEmail,
                });
                this.forgotPasswordSuccess = true;
            } catch {
                this.forgotPasswordError = true;
            } finally {
                this.forgotPasswordLoading = false;
            }
        },
    },
};
</script>

<style>
.login-form {
    width: 100%;
    font-family: Arial, Helvetica, sans-serif;
}

.login-btn {
    width: 100%;
    margin: 0 auto;
}

.login-error-message {
    font-size: 0.875rem;
    color: #b00020;
}

.forgot-password-link {
    text-align: center;
    font-size: 0.875rem;
}

.back-to-login-link {
    text-align: center;
    font-size: 0.875rem;
}

.reset-success-message {
    font-size: 0.925rem;
    line-height: 1.5;
    margin-bottom: 1.25rem;
}
</style>
