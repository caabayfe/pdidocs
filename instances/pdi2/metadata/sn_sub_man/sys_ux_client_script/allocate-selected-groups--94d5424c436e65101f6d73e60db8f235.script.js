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
    //This will allocate the list of selected groups to the subscription
    const selectedGroupIds = api.state.selectedRelevantGroupsList;

    /*
    selectedGroupsToAddToSubscription client state parameter is used by the 'Add Groups to Subscription' data broker. Change in state will 
    trigger the invocation of the data transform. There is no need to invoke a data resource refresh because of this
    */
    api.setState('selectedGroupsToAddToSubscription', selectedGroupIds);

    const output = api.data.add_groups_to_subscription.output.toLowerCase();
    if (output == 'true') {
        /*
        selectedGroupsForAllocatedCount client state parameter is used by the 'Get Allocated User and Groups Counts' data broker. Change in state will 
        trigger the invocation of the data transform. There is no need to invoke a data resource refresh because of this. 
        This will give the number of groups and users that have been added with the current allocation action
        */
        api.setState('selectedGroupsForAllocatedCount', selectedGroupIds);

        //clear selected groups, as the list selector does not get refreshed
        api.setState('selectedGroupsObjArray', []);
        api.setState('allocateButtonDisable', true);
    } else {
        const currentTimestamp = Date.now();
        const params = {
            'allocate': 'afail',
            'ts': currentTimestamp,
            'showmod':false
        };
        const category = 'regularuser';
        const sysId = api.context.props.sysId;
        //clear selected groups, as the list selector does not get refreshed
        api.setState('selectedGroupsObjArray', []);
        api.setState('allocateButtonDisable', true);
        
        //navigate to details page after successful group allocation
        helpers.navigate.to('subscription-details', {
            sysId,
            category
        }, params);
    }

}
