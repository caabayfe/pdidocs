/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var redirectURL = api.data.rule_management_dmc.redirectURLForOTDProgress;
    const archiveActivationMessage = api.data.rule_management_dmc.archiveActivationMessage;
    var content = helpers.translateSync('Your new rule has been created.');
    if (redirectURL) {
        redirectURL = `now/nav/ui/classic/params/target/${redirectURL}`;
        content += `${helpers.translateSync(' To check progress, click ')}<a href='${redirectURL}'>${helpers.translateSync('here')}</a>`;
    }

    if (archiveActivationMessage) {
        content += `<br/><br/>${archiveActivationMessage}`;
    }

    return content;
}
