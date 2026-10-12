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

    const { allRecordsSelected, selectedRecords, exceptedRecords } = event.payload;
    
    // set state
    // exceptedRecordsUnconfirmedFlow is used to store the records that are excluded from the selection
    api.setState('exceptedRecordsAddGroupsFlow', exceptedRecords);
    api.setState('isSelectAllSelectedAddGroupsFlow', allRecordsSelected);
    //This will update the state parameter with the list of selected records from the Relevant Groups list
    api.setState('selectedRelevantGroupsList', selectedRecords);

    //This will update the count of selected relevant groups and selected user counts
    api.data.relevant_selected_groups.refresh();
}
