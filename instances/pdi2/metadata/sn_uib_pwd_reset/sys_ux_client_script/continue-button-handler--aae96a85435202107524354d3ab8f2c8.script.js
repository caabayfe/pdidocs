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
    const token = api.state.token;
    const isLastVerification = api.state.isLastVerification;
    let verificationDetails = [...api.state.verificationDetails];
    api.setState("isVerificationSelectionEnabled", false);

    let filteredVerificationDetails = verificationDetails.filter(function(verification) {
        return verification.isChecked === true;
    });

    api.setState("verificationDetails", filteredVerificationDetails);
    api.setState("isVerificationLoading", true);
    api.emit("PWD_RESET_UIB#NAVIGATE_TO_NEXT_VERIFICATION", {
        route: filteredVerificationDetails[0].route,
        token: token,
        verificationId: filteredVerificationDetails[0].verificationId,
        isLastVerification: isLastVerification
    });
}
