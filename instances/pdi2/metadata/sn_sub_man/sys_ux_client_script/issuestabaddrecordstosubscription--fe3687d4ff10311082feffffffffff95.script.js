/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const issuesTabID = api.state.issuesTabID;
    let issuesTable;
	switch(issuesTabID) {
        case 't1':
            issuesTable = 'global_custom_tables_recommendation';
            break;
        case 't2':
            issuesTable = 'custom_applications_recommendation';
            break;
        default:
            issuesTable = 'global_custom_tables_recommendation';
    }

    /*
    issuesRecordsToAddToSubscription client state parameter is used by the 'Add Records to Subscription' data broker. Change in state will 
    trigger the invocation of the data transform. There is no need to invoke a data resource refresh because of this
    */
    const recommendationIds = api.state.selectedRecommendationRecords;
    const recommendationObj = {
        table: issuesTable,
        recommendationIds: recommendationIds
        };
    api.setState('issuesRecommendationMap', recommendationObj);
    
}
