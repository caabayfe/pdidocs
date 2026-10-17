function include({ imports }) {
    class PwdResetUxfVerificationClientUtilSNC {
        static CONSTANTS = {
            BUTTON_VARIANT: {
                SECONDARY: "secondary"
            },
            SEND_CODE_RESPONSE_STATUS_CODE: {
                VERIFICATION_CODE_SENT: 2003,
                PER_DAY_LIMIT_ERROR: 1006,
                PAUSE_WINDOW_ERROR: 1007,
                INVALID_REQUEST_ERROR: 1008,
                INVALID_PHONE_NUMBER_ERROR: 1009
            }
        }

        static async handleSendVerificationCodeResponse(sendCodeResponseObj, helpers) {
            const response = {
                sendCodeButtonState: {
                    label: null,
                    variant: null,
                    disable: null
                },
                timerState: {
                    isHidden: null,
                    start: null
                },
                inputCodeState: {
                    isHidden: null
                },
                sendCodeResponse: {
                    statusMessage: null,
                    rateLimitMessage: null
                }
            };
            switch (sendCodeResponseObj.statusCode) {
                case this.CONSTANTS.SEND_CODE_RESPONSE_STATUS_CODE.VERIFICATION_CODE_SENT:
                    response.sendCodeButtonState.label = await helpers.translate("Resend verification code");
                    response.sendCodeButtonState.variant = this.CONSTANTS.BUTTON_VARIANT.SECONDARY;
                    response.sendCodeButtonState.disable = true;
                    response.timerState.isHidden = false;
                    response.timerState.start = true;
                    response.inputCodeState.isHidden = false;
                    response.sendCodeResponse.statusMessage = sendCodeResponseObj.statusMessage;
                    break;
                case this.CONSTANTS.SEND_CODE_RESPONSE_STATUS_CODE.PER_DAY_LIMIT_ERROR:
                    response.sendCodeButtonState.disable = true;
                    response.sendCodeResponse.rateLimitMessage = sendCodeResponseObj.statusMessage;
                    break;
                case this.CONSTANTS.SEND_CODE_RESPONSE_STATUS_CODE.PAUSE_WINDOW_ERROR:
                    response.sendCodeResponse.statusMessage = sendCodeResponseObj.statusMessage;
                    break;
                case this.CONSTANTS.SEND_CODE_RESPONSE_STATUS_CODE.INVALID_REQUEST_ERROR:
                    response.sendCodeButtonState.disable = true;
                    response.sendCodeResponse.statusMessage = sendCodeResponseObj.statusMessage;
                    break;
                case this.CONSTANTS.SEND_CODE_RESPONSE_STATUS_CODE.INVALID_PHONE_NUMBER_ERROR:
                    response.sendCodeButtonState.disable = true;
                    response.sendCodeResponse.statusMessage = sendCodeResponseObj.statusMessage;
                    break;
                default:
                    // CODE_GENERATE_ERROR
                    response.sendCodeResponse.statusMessage = sendCodeResponseObj.statusMessage;
                    break;
            }
            return response;
        }
        static handleConditionalAssignment(src, dest) {
            return (src === null) ? dest : src;
        }
    }

    return PwdResetUxfVerificationClientUtilSNC;
}
