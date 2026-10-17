/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const uiConstants = imports["sn_instance_clone.InstanceCloneUIConstants"]();
    helpers
        .snHttp(uiConstants.SERVER_PATH, {
            method: "POST",
            body: {
                operation: uiConstants.OPERATION.SAVE_USER_PREFERENCE,
                userPref: "mif_remind_me_in_7days",
                value: true
            },
        })
        .then((response) => {
            console.log("Prefs saved successfully!!");
        })
        .catch((resp) => {
            if (!!resp.error) {
                try {} catch (e) {}
            }
        });
}
