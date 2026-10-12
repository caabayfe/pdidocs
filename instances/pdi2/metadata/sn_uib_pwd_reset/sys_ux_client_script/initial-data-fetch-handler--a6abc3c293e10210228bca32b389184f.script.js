/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const pwdResetUtil = imports["sn_uib_pwd_reset.PwdResetUxfClientUtil"]();
    const initialData = api.data.get_initial_sms_verification_data.output;
    if (!initialData) return;
    if (!initialData.tokenValidationResult.isValid) {
        api.emit("PWD_RESET_UIB#SHOW_ERROR_PAGE_FROM_SMS_VERIFICATION", {
            "errorPageObj": {
                "actions": {
                    "restart": {
                        "isHidden": false,
                        "variant": "primary"
                    }
                },
                "content": "",
                "heading": await pwdResetUtil.getTranslation(helpers, "Oops! Something went wrong."),
                "icon": "error",
                "subHeading": initialData.tokenValidationResult.errorMessage
            }
        });
    }
    const isAutoEnrolmentEnabled = (initialData.mode === "mobile");
    const isUsingNotify = initialData.isUsingNotify;

    const selectServiceProviderState = { ...api.state.selectServiceProviderState
    };
    selectServiceProviderState.isHidden = !(isAutoEnrolmentEnabled && !isUsingNotify);
    if (!selectServiceProviderState.isHidden)
        api.setState("infoMessage", {
            isHidden: false,
            value: await helpers.translate("Select service provider to proceed")
        });
    api.setState("selectServiceProviderState", selectServiceProviderState);

    const sendSMSCodeButtonState = { ...api.state.sendSMSCodeButtonState
    };
    sendSMSCodeButtonState.disable = !selectServiceProviderState.isHidden;
    api.setState("sendSMSCodeButtonState", sendSMSCodeButtonState);

    if (isAutoEnrolmentEnabled && isUsingNotify) {
        const isPhoneNumberE164Compliant = initialData.isPhoneNumberE164Compliant;
        const selectCountryCodeState = { ...api.state.selectCountryCodeState
        };
        selectCountryCodeState.isHidden = isPhoneNumberE164Compliant;
        if (!selectCountryCodeState.isHidden) {
            selectCountryCodeState.selectedItem = initialData.countryList[0];
            api.setState("infoMessage", {
                isHidden: false,
                value: await helpers.translate(
                    "Country code is defaulted to {0}, change it if it is not correct",
                    selectCountryCodeState.selectedItem.value.countryCode
                )
            });
        }
        api.setState("selectCountryCodeState", selectCountryCodeState);
    }
}
