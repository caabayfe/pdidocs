/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const result = api.data.get_personal_data_verification_details.output;
    const pwdResetUtil = imports["sn_uib_pwd_reset.PwdResetUxfClientUtil"]();
    if (!result || !result.isValid) {
        api.emit("PWD_RESET_UIB#SHOW_ERROR_PAGE_FROM_PERSONAL_DATA_VERIFICATION", {
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
                "subHeading": !result ? "" : result.errorMessage
            }
        });
        return;
   }
    let questionAnswerDetails = { ...api.state.questionAnswerDetails};
    let nextButtonState = {...api.state.nextButtonState};
    questionAnswerDetails.question = result.question;
    questionAnswerDetails.answer = "";
    nextButtonState.label = await pwdResetUtil.getVerifyTransistionButtonLabel(api.context.props.isLastVerification, helpers);
    nextButtonState.isValid = false;
    api.setState("nextButtonState", nextButtonState);
    api.setState("questionAnswerDetails", questionAnswerDetails);
    api.setState("verificationLabel", result.label);
}
