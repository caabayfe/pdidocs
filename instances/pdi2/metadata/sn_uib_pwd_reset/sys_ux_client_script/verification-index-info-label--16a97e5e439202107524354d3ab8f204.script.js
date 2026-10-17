/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const currVerIndex = api.data.pwd_reset_verify_page_controller.currVerificationIndex;
    if (currVerIndex == null)
        return "";

    return helpers.translateSync("Verification {0} of {1}", [(parseInt(currVerIndex, 10) + 1), api.data.pwd_reset_verify_page_controller.minimumSelection]);
}
