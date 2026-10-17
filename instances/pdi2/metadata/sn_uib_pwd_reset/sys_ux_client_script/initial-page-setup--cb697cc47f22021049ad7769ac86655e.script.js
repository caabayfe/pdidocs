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
    //Registering page as dirty
    api.emit("SCREEN_STATUS_CHANGED", {
        isDirty: true,
        title: await pwdResetUtil.getTranslation(helpers, "Reset password"),
        dirtyModalId: "[component-id$='custom_confirm_modal']",
    });
    
    //Initial setup   
    api.setState("stepperItems", [{
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
    ]);
}
