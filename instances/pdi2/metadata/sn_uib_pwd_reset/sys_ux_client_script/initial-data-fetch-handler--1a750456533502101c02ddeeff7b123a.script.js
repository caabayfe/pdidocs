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
    const result = api.data.get_initial_security_question_verification_data ? api.data.get_initial_security_question_verification_data.output : {};
    if (!result.isValid) {
        api.emit("PWD_RESET_UIB#SHOW_ERROR_PAGE_FROM_SECURITY_QUESTION_VERIFICATION", {
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
                "subHeading": result.errorMessage
            }
        });
    }
    const questions = result.data.questions;
    let initialData = { ...api.state.initialData
    };
    initialData.heading = result.data.label;

    let questionAnswerDetails = [];
    let nextButtonState = { ...api.state.nextButtonState
    };
    nextButtonState.isValid = false;
    for (let i = 0; i < questions.length; i++) {
        questionAnswerDetails.push({
            question: questions[i],
            answer: ""
        });
    }
    api.setState("questionAnswerDetails", questionAnswerDetails);
    api.setState("initialData", initialData);
    api.setState("nextButtonState", nextButtonState);
}
