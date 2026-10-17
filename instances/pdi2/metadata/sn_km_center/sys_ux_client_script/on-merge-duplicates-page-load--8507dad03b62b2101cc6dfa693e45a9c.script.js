/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({api, event, helpers, imports}) {
    // Only setup timeout if merge duplicates is being triggered via URL params
    if (api.context.props.sysId != '-1' || !api.state.isGeneratingMergeDuplicates || !api.context.props.duplicateSysIds) {
        return;
    }
        
    var timeoutMessage = await helpers.translate("There was a problem merging articles with AI (timed out). You can write it yourself now if you'd like.");
    
    var mergeDuplicatesTimeoutId = helpers.timing.setTimeout(function() {
        api.setState('isMergeDuplicatesTimedOut', true);
        api.setState('isGeneratingMergeDuplicates', false);

        api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
            items: [{
                id: "na_error",
                status: "critical",
                icon: "sn-sparkmoji-logo-outline",
                content: timeoutMessage,
                action: {
                    type: "dismiss"
                }
            }]
        });
    }, 180000);
    
    api.setState('mergeDuplicatesTimeoutId', mergeDuplicatesTimeoutId);
}
