/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var summary = api.state.lastCloneSummary;
    var result = api.data.getlastclonesummary_1.output;
    summary.cloneStartTime = result.startTime;
    summary.endTime = result.endTime;
    api.setState('lastCloneSummary', '');
    api.setState('lastCloneSummary', summary);
    if(result.state !== 'No clone has been scheduled for this instance'){
        api.setState("isCloneSummaryLoading", false);
    }
}
