/**
 * Data broker to add groups to subscription, if not already added
 * @param {object} input - Gets subscriptionId, groupIds, isS as input as defined in the Properties
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
        const unallocatedGroupService = new sn_sub_man.UnallocatedGroupRecommendationProvider_UnallocatedGroupRecommendationViewDao();
        groupIds = unallocatedGroupService.getGroupIdsBySubscriptionAndExcludedGroups(subscriptionId, exceptedRecords);
    }

    // Execute sync
    const subscriptionDetailService = new sn_entitlement.SubscriptionDetailService();
    subscriptionDetailService.setM2MRecordsBeingProcessedToUIVisibleFalse(groupIds, subscriptionId);

    // Execute async
    const steps = gs
        .getProperty('sn_sub_man.add_group_async_steps', 'addgroupstosubscription,addgroupmemberstosubscription,executepartialupdateforgroups')
        .split(',');
    const args = {
        subscriptionId: subscriptionId,
        groupIds: groupIds
    };

    gs.eventQueue('sn_sub_man.add_groups_to_subscription', null, JSON.stringify(steps), JSON.stringify(args));

    return 'true';
}
