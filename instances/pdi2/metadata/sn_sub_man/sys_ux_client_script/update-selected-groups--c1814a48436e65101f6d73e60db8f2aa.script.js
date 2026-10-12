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
    //this will update the state parameter for selected groups whenever the selected list is updated in the list-selector component
    const selectedGroups = event.payload;
    //state variable will be updated with the selected groups object list
    api.setState('selectedGroupsObjArray', selectedGroups);
    const numOfRowsSelected = event.payload.length;

    //get the list of group ids from selected groups object list
    const selectedGroupIds = selectedGroups.map(group => group[0].id);
    //This will update the state parameter with the list of selected records from the Relevant Groups list
    api.setState('selectedRelevantGroupsList', selectedGroupIds);
    //This will update the count of selected relevant groups and selected user counts
    api.data.relevant_selected_groups.refresh();
    
    api.setState('allocateButtonDisable', numOfRowsSelected <= 0); //enable the button only if 1 or more rows are selected
    api.setState('clearGroupsButtonDisable', numOfRowsSelected <= 0); //enable the button only if 1 or more rows are selected
}
