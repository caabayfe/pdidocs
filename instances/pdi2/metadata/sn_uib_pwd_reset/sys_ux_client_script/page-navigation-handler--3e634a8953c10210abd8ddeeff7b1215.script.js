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
    const getDefaultStepperState = [{
                "id": "identify",
                "label": await pwdResetUtil.getTranslation(helpers, "Identify"),
                "progress": "partial"
            },
            {
                "id": "verify",
                "label": await pwdResetUtil.getTranslation(helpers, "Verify"),
                "progress": "none"
            },
            {
                "id": "reset",
                "label": await pwdResetUtil.getTranslation(helpers, "Reset"),
                "progress": "none"
            }
        ];
    const {
        route,
        token,
        additionalInfo
    } = event.payload;
    let currentPage = api.state.currentPage;
    let currStepperItems = api.state.stepperItems;
    let setDefaultStepperState = true;
    switch (route) {
        case "verify-password-reset-snc":
            currentPage = "verify";
            currStepperItems[0].progress = "done";
            currStepperItems[1].progress = "partial";
            setDefaultStepperState = false;
            break;
        case "reset-password-reset-snc":
            currentPage = "reset";
            currStepperItems[1].progress = "done";
            currStepperItems[2].progress = "partial";
            setDefaultStepperState = false;
            break;
    }

    /* As the stepper is only in Identify, Verify and Reset, the default state is always Identify */
    if (setDefaultStepperState) {
        api.setState("stepperItems", [...getDefaultStepperState]);
        api.setState("currentPage", "identify");
    } else {
        api.setState("stepperItems", [...currStepperItems]);
        api.setState("currentPage", currentPage);
    }
    api.emit("NOW_UXF_PAGE#CLEAR_NOTIFICATIONS");
    const payloadObj = {
        viewportElementId: "viewport_1",
        route: route,
        fields: token ? {
            token
        } : null,
        params: additionalInfo ? {
            additionalInfo
        } : null,
    };
    api.emit("MACROPONENT_VIEWPORT_LOAD_REQUESTED", payloadObj);
}
