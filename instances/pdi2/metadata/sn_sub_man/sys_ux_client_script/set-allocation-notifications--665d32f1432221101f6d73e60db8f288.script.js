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

    /*This will set the paramater values to be used in the allocation notification displayed on the details page.
      These are the values from the current allocation event and not the total allocated counts.
    */

    const category = 'regularuser';
    const sysId = api.context.props.sysId;
    const currentTimestamp = Date.now();
    
    if (api.state.groupAllocationFail != false) {
        if (api.data.get_allocated_user_and_groups_counts.output.error == undefined) {
            const groupCount = api.data.get_allocated_user_and_groups_counts.output.count;
            const userCount = api.data.get_allocated_user_and_groups_counts.output.sum.active_users_count_int;
            const totalAllocatedUserCount = api.state.relevantUsersAllocatedCount;
            const allocateStatus = api.state.isSubscriptionCountCompliant ? 'success' : 'over';
            let params = {};
            if (allocateStatus == 'over') {
                params = {
                    'allocate': allocateStatus,
                    'uc': userCount,
                    'gc': groupCount,
                    'tc': totalAllocatedUserCount,
                    'ts': currentTimestamp,
                    'showmod':false
                };
            } else {
                params = {
                    'allocate': allocateStatus,
                    'uc': userCount,
                    'gc': groupCount,
                    'ts': currentTimestamp,
                    'showmod': false
                };
            };
        api.setState('isSubscriptionCountCompliant', true);
        //navigate to details page after successful group allocation
        helpers.navigate.to('subscription-details', {
            sysId,
            category
        }, params);
    } else {
            const params = {
                'allocate': 'cfail',
                'ts': currentTimestamp,
                'showmod': false
            };
            api.setState('isSubscriptionCountCompliant', true);
            //navigate to details page after failure on getting updated counts
            helpers.navigate.to('subscription-details', {
                sysId,
                category
            }, params);
        }
    } else {
        const params = {
            'allocate': 'afail',
            'ts': currentTimestamp,
            'showmod':false
        };
        api.setState('isSubscriptionCountCompliant', true);
        //navigate to details page after failure in allocating groups
        helpers.navigate.to('subscription-details', {
            sysId,
            category
        }, params);

    }




}
