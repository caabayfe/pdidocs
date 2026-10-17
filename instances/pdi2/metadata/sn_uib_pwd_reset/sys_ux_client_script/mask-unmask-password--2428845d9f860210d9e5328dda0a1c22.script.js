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
    const result = api.data.get_pwd_reset_success_page_data.output ? api.data.get_pwd_reset_success_page_data.output : {};
    if(!result.isValid){
        api.emit("PWD_RESET_UIB#SHOW_ERROR_PAGE_FROM_SUCCESS", {
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
                "subHeading": result.errorMessage != "" ? result.errorMessage : ""
            }
        });
        return;
    }
    const password = result.passwordDetails.password;
    const passwordStateNew = { ...api.state.passwordState
    };
    if (passwordStateNew.isPasswordMasked) {
        passwordStateNew.password = password;
        passwordStateNew.isPasswordMasked = false;
        passwordStateNew.eyeIcon = "eye-slash-fill";
        passwordStateNew.tooltip = await helpers.translate("Mask password");
    } else {
        passwordStateNew.password = maskAllCharacters(password);
        passwordStateNew.isPasswordMasked = true;
        passwordStateNew.eyeIcon = "eye-fill";
        passwordStateNew.tooltip = await helpers.translate("Unmask password");
    }
    api.setState('passwordState', passwordStateNew);
    return;

    function maskAllCharacters(value, maskChar = '*') {
        return maskChar.repeat(value.length);
    }
   
}
