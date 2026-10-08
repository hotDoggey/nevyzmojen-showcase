<template>
    <div>
        <h1 class="pt-4 page-title text-center">{{ $t("account") }}</h1>

        <LoadingSpinner v-if="isLoading" />

        <v-container v-else fluid>
            <v-row class="account-panels px-2 px-sm-8 py-6" align="start">
                <!-- Left: 3/12 on md+, full width on sm- -->
                <v-col cols="12" md="3">
                    <div>
                        <h2 class="section-heading">
                            {{ $t("account_details") || "Account Details" }}
                        </h2>

                        <div class="detail-block mt-4">
                            <div class="detail-label">{{ $t("full_name") }}</div>
                            <div class="detail-value">{{ fullName }}</div>
                        </div>

                        <div class="detail-block mt-3">
                            <div class="detail-label">{{ $t("email") }}</div>
                            <div class="detail-value" style="text-decoration: underline;">{{ userEmail }}</div>
                        </div>

                        <button
                            type="button"
                            class="internal-link account-action-btn change-password-btn mt-4"
                            @click="openChangePasswordDialog"
                        >
                            <font-awesome-icon icon="key" class="btn-icon" />
                            {{ $t("change_password") }}
                        </button>

                        <button
                            type="button"
                            class="internal-link account-action-btn signout-btn mt-2"
                            @click="signUserOut"
                        >
                            <font-awesome-icon icon="arrow-right-from-bracket" class="btn-icon" />
                            {{ $t("sign_out") }}
                        </button>
                    </div>
                </v-col>

                <!-- Right: 9/12 on md+, full width on sm- -->
                <v-col cols="12" md="9">
                    <h2 class="section-heading">
                        {{ $t("previous_orders") || "Previous Orders" }}
                    </h2>
                    <AccountOrdersPanel />
                </v-col>
            </v-row>
        </v-container>

        <!-- Change Password Dialog -->
        <v-dialog v-model="changePasswordDialog" :max-width="dialogMaxWidth" persistent>
            <!-- C: rounded corners; E: light grey background -->
            <v-card rounded="lg" color="#f7f7f7">
                <!-- A: thin black accent bar across the top -->
                <div class="dialog-accent-bar"></div>

                <!-- B: centred icon + title; close button top-right -->
                <div class="dialog-header pt-6 pb-3">
                    <font-awesome-icon icon="key" class="dialog-header-icon" />
                    <div class="dialog-header-title">{{ $t("change_password") }}</div>
                </div>
                <v-btn
                    icon
                    variant="text"
                    class="dialog-close-btn"
                    @click="closeChangePasswordDialog"
                >
                    <v-icon>mdi-close</v-icon>
                </v-btn>

                <!-- D: divider separating header from form body -->
                <v-divider class="mx-6" />

                <v-card-text class="px-6 pb-2 pt-4">
                    <!-- Success state: replace form with confirmation message -->
                    <div v-if="changePasswordSuccess" class="success-message py-4 text-center">
                        {{ $t("password_changed_success") }}
                    </div>

                    <v-form v-else ref="changePasswordForm" @submit.prevent="submitChangePassword">
                        <v-text-field
                            ref="currentPasswordInput"
                            v-model="formCurrentPassword"
                            :label="$t('current_password')"
                            type="password"
                            :rules="currentPasswordRules"
                            :error-messages="currentPasswordServerError"
                            variant="outlined"
                            hide-details="auto"
                            class="mt-2 mb-5"
                            @blur="onCurrentPasswordBlur"
                            @input="currentPasswordServerError = null"
                        />
                        <v-text-field
                            ref="newPasswordInput"
                            v-model="formNewPassword"
                            :label="$t('new_password')"
                            type="password"
                            :rules="newPasswordRules"
                            variant="outlined"
                            hide-details="auto"
                            class="mb-5"
                            @blur="onNewPasswordBlur"
                        />
                        <v-text-field
                            ref="confirmPasswordInput"
                            v-model="formConfirmPassword"
                            :label="$t('confirm_password')"
                            type="password"
                            :rules="confirmPasswordRules"
                            variant="outlined"
                            hide-details="auto"
                            class="mb-2"
                            @blur="onConfirmPasswordBlur"
                        />

                        <!-- General error (non-auth errors) -->
                        <div v-if="changePasswordGeneralError" class="general-error mt-2 mb-2">
                            {{ $t("something_went_wrong_try_again") }}
                        </div>

                        <div class="pt-4 pb-2">
                            <v-btn
                                type="submit"
                                variant="flat"
                                color="black"
                                size="large"
                                class="dialog-submit-btn"
                                :loading="changePasswordLoading"
                            >
                                {{ $t("continue") }}
                            </v-btn>
                        </div>
                    </v-form>
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
import AccountOrdersPanel from "../components/AccountOrdersPanel.vue";
import {
    validatePassword,
    validateRequiredField,
} from "../auth_helper_functions/auth_field_rules.js";

export default {
    components: { AccountOrdersPanel },

    data() {
        return {
            // Change password dialog state
            changePasswordDialog: false,
            changePasswordLoading: false,
            changePasswordSuccess: false,
            currentPasswordServerError: null, // field-level error for wrong current password
            changePasswordGeneralError: false, // banner for unexpected errors

            // Form field models
            formCurrentPassword: "",
            formNewPassword: "",
            formConfirmPassword: "",

            // Blur-validation flags — validation only activates once the user has left each field
            validateCurrentPasswordFlag: false,
            validateNewPasswordFlag: false,
            validateConfirmPasswordFlag: false,
        };
    },

    computed: {
        isLoading() {
            return this.$store.getters.isLoading ?? false;
        },
        userDetails() {
            return this.$store.getters.userDetails ?? {};
        },
        fullName() {
            const first = this.userDetails?.first_name ?? "";
            const last = this.userDetails?.surname ?? "";
            return `${first} ${last}`.trim() || "—";
        },
        userEmail() {
            const email = this.userDetails?.email ?? "";
            return `${email}`.trim() || "—";
        },

        // Responsive dialog width: wider on small screens, narrower on desktop
        dialogMaxWidth() {
            const bp = this.$vuetify.display.name;
            if (bp === "xs") return "85vw";
            if (bp === "sm") return "55vw";
            if (bp === "md") return "40vw";
            return "30vw"; // lg, xl
        },

        // Validation rules — only active once the user has blurred the field (flag-gated)
        currentPasswordRules() {
            return [
                (v) => {
                    if (!this.validateCurrentPasswordFlag) return true;
                    return validateRequiredField(v, this.$t);
                },
            ];
        },
        newPasswordRules() {
            return [
                (v) => {
                    if (!this.validateNewPasswordFlag) return true;
                    return validatePassword(v, this.$t);
                },
            ];
        },
        confirmPasswordRules() {
            return [
                (v) => {
                    if (!this.validateConfirmPasswordFlag) return true;
                    return validateRequiredField(v, this.$t);
                },
                (v) => {
                    if (!this.validateConfirmPasswordFlag) return true;
                    return v === this.formNewPassword || this.$t("passwords_do_not_match");
                },
            ];
        },
    },

    methods: {
        signUserOut() {
            this.$store.dispatch("signUserOut");
            this.$router.push({ name: "store" });
        },

        openChangePasswordDialog() {
            this.changePasswordDialog = true;
        },

        // Reset all dialog state and close — called by the X button and on click-outside
        closeChangePasswordDialog() {
            this.changePasswordDialog = false;
            this.changePasswordLoading = false;
            this.changePasswordSuccess = false;
            this.currentPasswordServerError = null;
            this.changePasswordGeneralError = false;
            this.formCurrentPassword = "";
            this.formNewPassword = "";
            this.formConfirmPassword = "";
            // Reset blur-validation flags so the next open starts clean
            this.validateCurrentPasswordFlag = false;
            this.validateNewPasswordFlag = false;
            this.validateConfirmPasswordFlag = false;
            // Reset Vuetify form validation state
            this.$nextTick(() => {
                this.$refs.changePasswordForm?.reset();
            });
        },

        // Blur handlers — activate validation for that field once the user leaves it
        onCurrentPasswordBlur() {
            this.validateCurrentPasswordFlag = true;
            this.$refs.currentPasswordInput?.validate();
        },
        onNewPasswordBlur() {
            this.validateNewPasswordFlag = true;
            this.$refs.newPasswordInput?.validate();
        },
        onConfirmPasswordBlur() {
            this.validateConfirmPasswordFlag = true;
            this.$refs.confirmPasswordInput?.validate();
        },

        async submitChangePassword() {
            // Force all flags on submit so any untouched fields also validate
            this.validateCurrentPasswordFlag = true;
            this.validateNewPasswordFlag = true;
            this.validateConfirmPasswordFlag = true;

            // Clear any previous server-side errors before re-validating
            this.currentPasswordServerError = null;
            this.changePasswordGeneralError = false;

            const { valid } = await this.$refs.changePasswordForm.validate();
            if (!valid) return;

            this.changePasswordLoading = true;

            try {
                await this.$store.dispatch("changeUserPassword", {
                    currentPassword: this.formCurrentPassword,
                    newPassword: this.formNewPassword,
                });
                this.changePasswordSuccess = true;
            } catch (error) {
                // auth/wrong-password or auth/invalid-credential both mean the current password was wrong
                const wrongPasswordCodes = ["auth/wrong-password", "auth/invalid-credential"];
                if (wrongPasswordCodes.includes(error.code)) {
                    this.currentPasswordServerError = this.$t("incorrect_current_password");
                } else {
                    this.changePasswordGeneralError = true;
                    console.error("changeUserPassword unexpected error:", error);
                }
            } finally {
                this.changePasswordLoading = false;
            }
        },
    },
};
</script>

<style scoped>
.account-panels {
    text-align: left;
}

.section-heading {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 12px;
}

.detail-label {
    margin-bottom: 3px;
}

.detail-value {
    font-size: 0.9rem;
}

/* Shared base for both account action buttons */
.account-action-btn {
    display: block;
    font: inherit;
    font-size: 0.9rem;
}

.btn-icon {
    margin-right: 6px;
}

/* Sign out: slightly muted, no underline (matches original) */
.signout-btn {
    opacity: 0.6;
}

/* Change password: full black, underlined to signal it's a distinct action */
.change-password-btn {
    color: #000;
    text-decoration: underline;
    opacity: 1;
}

/* A: thin black accent strip — top-radius matches v-card rounded="lg" (~12px) */
.dialog-accent-bar {
    height: 4px;
    background-color: #000;
    border-radius: 12px 12px 0 0;
}

/* B: centred icon + title block */
.dialog-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding-right: 40px; /* keep content clear of the close button */
    padding-left: 40px;
}

.dialog-header-icon {
    font-size: 1.8rem;
    color: #000;
    margin-bottom: 10px;
}

.dialog-header-title {
    font-size: 1.15rem;
    font-weight: 600;
}

/* Close button — positioned in top-right corner of the card */
.dialog-close-btn {
    position: absolute;
    top: 12px;
    right: 12px;
}

.success-message {
    font-size: 0.95rem;
}

.general-error {
    font-size: 0.85rem;
    color: rgb(var(--v-theme-error));
}

.dialog-submit-btn {
    width: 100%;
}

/* Backdrop blur on the dialog scrim — sm and above only, not on mobile */
@media (min-width: 600px) {
    :deep(.v-overlay__scrim) {
        backdrop-filter: blur(6px);
    }
}
</style>
