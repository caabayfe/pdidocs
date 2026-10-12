/**
 * Data broker to remove groups from subscription
 * @param {object} input - Gets subscriptionId, groupIds, isSelectAllSelected and exceptedRecords as input as defined in the Properties
 * @return {string}
 */
function transform(input) {
    const subscriptionId = input.subscriptionId;
	const isSelectAllSelected = input.isSelectAllSelected;
	// exceptedRecords is used to store the records that are excluded from the selection
	const exceptedRecords = input.exceptedRecords;
	let groupIds = input.groupIds;

    if (!subscriptionId || subscriptionId.length === 0 || (groupIds.length === 0 && isSelectAllSelected === false)) {
        // Counter-intuitively, this script gets called multiple times and often with an empty group list
        // Returning 'false' here will make other scripts think that the allocation failed and display error messages
        // Returning 'true' with the input guard is necessary for the downstream behavior to work as desired.
        return 'true';
    }

    const groupAllocationService = new sn_sub_man.GroupAllocationService();
    if (isSelectAllSelected) {
      groupIds = groupAllocationService.getAllGroupsIdsWithExceptedRecordsBySubscriptionId(subscriptionId, exceptedRecords);
    }

    // Execute async
    const steps = gs
        .getProperty('sn_sub_man.remove_group_async_steps', 'removegroupsfromsubscription,removegroupmembersfromsubscription,executepartialupdateforgroups')
        .split(',');
    const args = {
        subscriptionId: subscriptionId,
        groupIds: groupIds
    };

    gs.eventQueue('sn_sub_man.rm_groups_from_subscription', null, JSON.stringify(steps), JSON.stringify(args));

    return 'true';
}
