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
    api.setState('exceptedRecordsUnconfirmedFlow', exceptedRecords);
    api.setState('selectedUnconfirmedGroupsList', selectedRecords);
    api.setState('isSelectAllSelectedUnconfirmedFlow', allRecordsSelected);
    
    //This will update the count of selected groups and selected user counts
    api.data.unconfirmed_selected_groups.refresh();
}
