/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

    const { allRecordsSelected, selectedRecords, exceptedRecords } = event.payload;
    
    // set state
    // exceptedRecordsUnconfirmedFlow is used to store the records that are excluded from the selection
    api.setState('exceptedRecordsRemoveGroupsFlow', exceptedRecords);
    //This will update the state parameter with the list of selected records from the Remove Groups list
    api.setState('selectedRemoveGroupsList', event.payload.selectedRecords);
    api.setState('isSelectAllSelectedRemoveGroupsFlow', allRecordsSelected);
    
     //This will update the count of selected groups to remove and selected user counts
    api.data.remove_groups_selected_groups.refresh();
}
