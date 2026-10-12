const steps = new Set(JSON.parse(event.parm1).map(step => step.toLowerCase()));
const args = JSON.parse(event.parm2);
const subscriptionId = args.subscriptionId;
const groupIds = args.groupIds;

if (steps && steps.size > 0 &&
    subscriptionId && subscriptionId.length > 0 &&
    groupIds && groupIds.length > 0) {

    const groupAllocationService = new sn_sub_man.GroupAllocationService();

    if (steps.has('removegroupsfromsubscription'))
        groupAllocationService.removeGroupsFromSubscription(groupIds, subscriptionId);

    if (steps.has('removegroupmembersfromsubscription'))
        groupAllocationService.removeGroupMembersFromSubscription(groupIds, subscriptionId);

    if (steps.has('executepartialupdateforgroups'))
        groupAllocationService.executePartialUpdateForGroups(groupIds);
}
