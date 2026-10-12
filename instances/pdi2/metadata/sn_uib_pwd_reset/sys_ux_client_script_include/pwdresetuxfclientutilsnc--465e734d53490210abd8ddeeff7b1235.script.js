function include({ imports }) {
    class PwdResetUxfClientUtilSNC {

        static uiConstants = {
            CRITICAL: "critical",
            CIRCLE_EXCLAMATION_OUTLINE_ICON: "circle-exclamation-outline",
            INFO_ICON: "exclamation-circle-outline",
            REFRESH_RATE: 2500, // Default refresh rate in milliseconds
            TIMEOUT: 90000, // Default refresh rate in milliseconds
            RETRIEVING_LOCK_STATE: "0",
            UNABLE_RETRIEVING_LOCK_STATE: "-1",
            USER_ACCOUNT_LOCKED: "1",
            USER_ACCOUNT_NOT_LOCKED: "2",
            WORKFLOW_CONTEXT_FAULTED_STATE: "faulted",
            WORKFLOW_CONTEXT_CANCELLED_STATE: "cancelled",
            WORKFLOW_CONTEXT_FINISHED_STATE: "finished",
            DEFAULT_URGENCY: 2,
            PROGRESS_BAR: {
                TYPE: {
                    ERROR: "error",
                    POSITIVE: "positive",
                    GREEN: "green",
                    ORANGE: "orange",
                },
                BOUNDS: {
                    MIN_VAL: 0,
                    MAX_VAL: 100
                },
                STRENGTH_LEVEL: {
                    LEVEL_1: {
                        THRESHOLD: 40,
                        STYLES: "* {color: rgb(var(--now-progress-bar_path--orange--background-color));}"
                    },
                    LEVEL_2: {
                        THRESHOLD: 60,
                        STYLES: "* {color: rgb(var(--now-progress-bar_path--green--background-color));}"
                    },
                    LEVEL_3: {
                        THRESHOLD: 80,
                        STYLES: "* {color: rgb(var(--now-progress-bar_path--positive--background-color));}"
                    },
                    BASE_LEVEL: {
                        STYLES: "* {color: rgb(var(--now-progress-bar_path--error--background-color));}"
                    },
                    DEFAULT: {
                        STYLES: "* {color: rgb(var(---now-color_text--secondary));}"
                    }
                }
            }
        };
        //If UI message need to change, please change the value associated to the UI message, It will be reflected over the UI.
        static uiMessages = {
            "No password reset process found for the user!":
                "No password reset process found for the user!",
            "Contact your system administrator to get a process assigned to this user.":
                "Contact your system administrator to get a process assigned to this user.",
            "No service-desk processes found for the selected user.":
                "No service-desk processes found for the selected user.",
            "Security Violation":
                "Security Violation",
            "Error!":
                "Error!",
            "You have {0} attempts remaining. Try again.":
                "You have {0} attempts remaining. Try again.",
            "Request expired.":
                "Request expired.",
            "User account unlocked!":
                "User account unlocked!",
            "The user can start using their system now.":
                "The user can start using their system now.",
            "Account unlock error!":
                "Account unlock error!",
            "Error while unlocking the account, please try again.":
                "Error while unlocking the account, please try again.",
            "The password reset request is no longer valid. Try again.":
                "The password reset request is no longer valid. Try again.",
            "Password reset successful!":
                "Password reset successful!",
            "New password has been sent to the user's registered email/mobile number.":
                "New password has been sent to the user's registered email/mobile number.",
            "Oops! Something went wrong.":
                "Oops! Something went wrong.",
            "Technical error has occured, try again!":
                "Technical error has occured, try again!",
            "Password reset instructions sent!":
                "Password reset instructions sent!",
            "Email/SMS with password reset instructions has been sent to the user's registered email/mobile number.":
                "Email/SMS with password reset instructions has been sent to the user's registered email/mobile number.",
            "Read the new password to the user before closing the tab.":
                "Read the new password to the user before closing the tab.",
            "An error occured in PwdWfManager UI Script : checkWFProgress()":
                "An error occured in PwdWfManager UI Script : checkWFProgress()",
            "The new password couldn't be accepted because it didn't meet the policy requirements. Review the password length, complexity, and history requirements and try again.":
                "The new password couldn't be accepted because it didn't meet the policy requirements. Review the password length, complexity, and history requirements and try again.",
            "Number of selected methods can't be more than {0}. Deselect excess method(s) to proceed.":
                "Number of selected methods can't be more than {0}. Deselect excess method(s) to proceed.",
            "Select {0} of {1} verification methods below to proceed.":
                "Select {0} of {1} verification methods below to proceed.",
            "Entered password doesn't meet the set password criteria.":
                "Entered password doesn't meet the set password criteria.",
            "The entered passwords don't match.":
                "The entered passwords don't match.",
            "There is a configuration error in your system. Contact your System Administrator to know more.":
                "There is a configuration error in your system. Contact your System Administrator to know more.",
           	"Verification code limit reached!": 
           		"Verification code limit reached!",
           	"Can't proceed with password reset!": 
           		"Can't proceed with password reset!",
           	"The user's account is locked and account unlocking isn’t supported with the {0} process.": 
           		"The user's account is locked and account unlocking isn’t supported with the {0} process.",
           	"User needs a password reset, but their account is locked and can't be unlocked using the current process.": 
           		"User needs a password reset, but their account is locked and can't be unlocked using the current process.",
           	"User needs a password reset, but has exceeded the daily email verification code limit.": 
           		"User needs a password reset, but has exceeded the daily email verification code limit.",
           	"User needs a password reset, but has exceeded the daily SMS verification code limit.":
           		"User needs a password reset, but has exceeded the daily SMS verification code limit.",
           	"User needs a password reset, but has exceeded the maximum verification attempt limit.":
           		"User needs a password reset, but has exceeded the maximum verification attempt limit.",
            "Unable to reset user's password because password policy is not enabled":
                "Unable to reset user's password because password policy is not enabled"
        };

        static async getLockStateDetail(state, helpers) {
            let result = {
                "isRetrieving": true,
                "message": "",
                "type": ""
            };

            switch (state) {
                case this.uiConstants.UNABLE_RETRIEVING_LOCK_STATE:
                    result.message = await helpers.translate("Unable to retrieve account lock status.");
                    result.isRetrieving = false;
                    result.type = "warning";
                    break;
                case this.uiConstants.USER_ACCOUNT_LOCKED:
                    result.message = await helpers.translate("User account is locked.");
                    result.isRetrieving = false;
                    result.type = "info";
                    break;
                case this.uiConstants.USER_ACCOUNT_NOT_LOCKED:
                    result.message = await helpers.translate("User account is not locked.");
                    result.isRetrieving = false;
                    result.type = "info";
                    break;
                default:
                    result.message = await helpers.translate("Retrieving the account lock state information...");
                    break;
            }
            return result;
        }

        static showAlert(api, messageHeader, messageInfo, messageType) {

            var headerHTML = messageHeader ? "<b>" + messageHeader + " </b>" : "";
            var payload = {
                "items": [{
                    "id": "pwdreset-alert-notification",
                    "action": {
                        "type": "dismiss"
                    },
                    "content": {
                        // setting message content type to html to render rich text content properly
                        "type": "html",
                        "value": "<div>" + headerHTML + messageInfo + "</div>"
                    },
                    "status": messageType,
                }]
            };
            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', payload);
        }

        static async getTranslation(helpers, messageKey, tokens) {
            if (!tokens || typeof tokens != "object") {
                tokens = [];
            }
            const messageValue = this.uiMessages[messageKey]
            if (!messageValue)
                return await helpers.translate(messageKey, ...tokens);

            return await helpers.translate(messageValue, ...tokens);
        }

        static isLastVerification(currVerificationIndex, totalVerification) {
            return currVerificationIndex === totalVerification - 1;
        }

        static async getVerifyTransistionButtonLabel(isLastVerification, helpers) {
            return isLastVerification ? await helpers.translate("Continue to reset") : await helpers.translate("Continue");
        }

        static async resetManualPWDFlowOnServerSideFailure(api, helpers, result) {
            // Resetting input password field
            api.setState("inputNewPassword", {
                "fieldMessage": {
                    "isInvalid": true,
                    "value": [{
                        "content": await this.getTranslation(
                            helpers,
                            "The new password couldn't be accepted because it didn't meet the policy requirements. Review the password length, complexity, and history requirements and try again."
                        ),
                        "icon": this.uiConstants.CIRCLE_EXCLAMATION_OUTLINE_ICON,
                        "status": this.uiConstants.CRITICAL
                    }]
                },
                "isValid": false,
                "value": ""
            });
            // Resetting password meter
            const initialPageDetails = api.data.get_pwd_reset_page_details.output;
            api.setState("passwordStrengthMeterState", {
                "isHidden": !initialPageDetails.passwordStrength.isPasswordStrengthEnabled,
                "level": {
                    "css": this.uiConstants.PROGRESS_BAR.STRENGTH_LEVEL.DEFAULT.STYLES,
                    "value": await helpers.translate("None")
                },
                "meter": {
                    "maxValue": this.uiConstants.PROGRESS_BAR.BOUNDS.MAX_VAL,
                    "type": this.uiConstants.PROGRESS_BAR.TYPE.ERROR,
                    "value": this.uiConstants.PROGRESS_BAR.BOUNDS.MIN_VAL
                }
            });
            // Resetting policy rules
            api.setState("passwordPolicyRules", initialPageDetails.passwordPolicy.passwordPolicyRuleHints);
            // Resetting input password confirmation field
            api.setState("inputNewPasswordConfirmation", {
                "fieldMessage": {
                    "isInvalid": false,
                    "value": [{
                        "content": "",
                        "icon": "",
                        "status": ""
                    }]
                },
                "isValid": false,
                "value": ""
            });
        }

        static async setPasswordMeterState(isNewPasswordNil, strengthScore, api, helpers) {
            const passwordStrengthMeterState = {
                ...api.state.passwordStrengthMeterState
            };
            let meterType = this.uiConstants.PROGRESS_BAR.TYPE.ERROR,
                meterLevel = {
                    value: await helpers.translate("None"),
                    css: this.uiConstants.PROGRESS_BAR.STRENGTH_LEVEL.DEFAULT.STYLES
                };
            if (!isNewPasswordNil) {
                if (strengthScore > this.uiConstants.PROGRESS_BAR.STRENGTH_LEVEL.LEVEL_3.THRESHOLD) {
                    meterType = this.uiConstants.PROGRESS_BAR.TYPE.POSITIVE;
                    meterLevel.value = await helpers.translate("Strong");
                    meterLevel.css = this.uiConstants.PROGRESS_BAR.STRENGTH_LEVEL.LEVEL_3.STYLES;;
                } else if (strengthScore > this.uiConstants.PROGRESS_BAR.STRENGTH_LEVEL.LEVEL_2.THRESHOLD) {
                    meterType = this.uiConstants.PROGRESS_BAR.TYPE.GREEN;
                    meterLevel.value = await helpers.translate("Good");
                    meterLevel.css = this.uiConstants.PROGRESS_BAR.STRENGTH_LEVEL.LEVEL_2.STYLES;
                } else if (strengthScore > this.uiConstants.PROGRESS_BAR.STRENGTH_LEVEL.LEVEL_1.THRESHOLD) {
                    meterType = this.uiConstants.PROGRESS_BAR.TYPE.ORANGE;
                    meterLevel.value = await helpers.translate("Weak");
                    meterLevel.css = this.uiConstants.PROGRESS_BAR.STRENGTH_LEVEL.LEVEL_1.STYLES;
                } else {
                    meterType = this.uiConstants.PROGRESS_BAR.TYPE.ERROR;
                    meterLevel.value = await helpers.translate("Very weak");
                    meterLevel.css = this.uiConstants.PROGRESS_BAR.STRENGTH_LEVEL.BASE_LEVEL.STYLES;
                }
            }
            passwordStrengthMeterState.meter = {
                type: meterType,
                value: strengthScore,
                maxValue: passwordStrengthMeterState.meter.maxValue
            };
            passwordStrengthMeterState.level = meterLevel;
            api.setState("passwordStrengthMeterState", passwordStrengthMeterState);
        }

        static async errorPageRedirection(result, helpers, api) {
            let heading = await this.getTranslation(helpers, "Oops! Something went wrong."),
                subheading = result.errorMessage,
                content = "",
                shortDescription = "",
                actions = {
                    "restart": {
                        "isHidden": false,
                        "variant": "primary"
                    }
                };
            if (result.errorMessage === "unlock_not_support_but_account_locked") {
                const processName = `<strong>${result.processName}</strong>`;
                heading = await this.getTranslation(helpers, "Can't proceed with password reset!");
                subheading = await this.getTranslation(helpers, "The user's account is locked and account unlocking isn’t supported with the {0} process.", [processName]);
                shortDescription = await this.getTranslation(helpers, "User needs a password reset, but their account is locked and can't be unlocked using the current process.");
                content = await this.getErrorContentForAccountLockedButNotSupported(helpers);
                actions.createRecord = {
                    "isHidden": false,
                    "variant": "secondary"
                }
                actions.restart.variant = "secondary";
            }
            api.emit("PWD_RESET_UIB#SHOW_ERROR_PAGE_FROM_RESET", {
                "errorPageObj": {
                    "actions": actions,
                    "content": content,
                    "heading": heading,
                    "icon": "error",
                    "subHeading": subheading,
                    "shortDescription": shortDescription
                }
            });
        }

        static async getErrorContentForAccountLockedButNotSupported(helpers) {
            const str1 = await this.getTranslation(helpers, "Try one of the following.");
            const str2 = await this.getTranslation(helpers, "Choose another process which supports account unlock.");
            const str3 = await this.getTranslation(helpers, "To use the same process, create an incident for your system administrator to first unlock the account and try again.");
            return "<p style='padding-left: var(--now-scalable-space--sm);'>" + str1 + "</p><div><ul><li>" + str2 + "</li><li>" + str3 + "</li></ul></div>";
        }

        static async getErrorContentForMaxVerCodeLimitReached(helpers) {
            const str1 = await this.getTranslation(helpers, "Try one of the following.");
            const str2 = await this.getTranslation(helpers, "Try again after 24 hours to use the same process.");
            const str3 = await this.getTranslation(helpers, "Create an incident for the system administrator.");
            return "<p style='padding-left: var(--now-scalable-space--sm);'>" + str1 + "</p><div><ul><li>" + str2 + "</li><li>" + str3 + "</li></ul></div>";
        }

        static async navigateToResetSuccess(api, helpers) {
            const { pageDetails } = api.state;
            const heading = "Password reset successful!";
            const subHeading = pageDetails.isSendEmail ? "New password has been sent to the user's registered email/mobile number." : "";
            const {
                isAcceptPassword,
                isAutoGeneratedPassword,
                isProcessSupportReset
            } = pageDetails;
            let isDisplayPassword, newPassword;
            if (isAcceptPassword && isProcessSupportReset && !isAutoGeneratedPassword) {
                isDisplayPassword = true;
                newPassword = api.state.inputNewPasswordConfirmation.value;
            } else {
                isDisplayPassword = pageDetails.isDisplayPassword;
            }
            const subText = isDisplayPassword ? "Read the new password to the user before closing the tab." : "";
            api.emit("PWD_RESET_UIB#HANDLE_NAVIGATION_FROM_RESET_PAGE", {
                route: "success-password-reset-snc",
                token: api.state.token,
                additionalInfo: {
                    heading: await this.getTranslation(helpers, heading),
                    subHeading: subHeading == "" ? "" : await this.getTranslation(helpers, subHeading),
                    subText: subText == "" ? "" : await this.getTranslation(helpers, subText),
                    isDisplayPassword: isDisplayPassword,
                    newPassword: newPassword
                }
            });
        }

        static getIncidentDefaultUrgency() {
            return this.uiConstants.DEFAULT_URGENCY;
        }    

        static isString(value) {
            return (typeof value === 'string');
        }

        static isBoolean(value) {
            return (typeof value === 'boolean');
        }

        static async getErrorPageDetailsTemplate(helpers) {
            return {
                "actions": {
                    "close": {
                        "isHidden": false,
                        "variant": "primary"
                    },
                    "createRecord": {
                        "isHidden": true,
                        "variant": "primary"
                    },
                    "restart": {
                        "isHidden": true,
                        "variant": "primary"
                    }
                },
                "content": "",
                "heading": await this.getTranslation(helpers, "Oops! Something went wrong."),
                "icon": "error",
                "shortDescription": "",
                "subHeading": await this.getTranslation(helpers, "Technical error has occured, try again!")
            };
        }
    }
 
    return PwdResetUxfClientUtilSNC;
}
