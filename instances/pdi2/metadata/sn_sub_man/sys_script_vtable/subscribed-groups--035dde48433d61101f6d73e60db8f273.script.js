(function executeQuery(v_table, v_query) {

    const encodedQuery = getEncodedQuery(v_query.getCondition("subscription"));

    const gr = new GlideRecord("group_has_subscription");
    gr.addEncodedQuery(encodedQuery);
    // Setting remote table row limit to 20000 along with turning on Enhanced Capacity flag
    gr.setLimit(20000);
    // joins
    const helper = new sn_sub_man.SMGlideRecordHelper();
    helper.addExtraField(gr, "subscription.sys_id");
    helper.addExtraField(gr, "group.sys_id");
    helper.addExtraField(gr, "group.manager.sys_id");
    helper.addExtraField(gr, "group.description");
    helper.addExtraField(gr, "group.type");
    helper.addExtraField(gr, "group.name");

    gr.query();

    const rows = [];
    const groupIds = [];
    const ZERO = Number(0).toLocaleString();

    while (gr.next()) {
        if (!gr.group?.name)
            continue; // if the group name is not resolvable, then domain seperation may be responsible for restricting access to the group and should not result in an output entry
        const row = {
            sys_id: gr.group.sys_id,
            user_count: ZERO,
            user_count_int: 0,
            active_users_count: ZERO,
            active_users_count_int: 0,
            group: gr.group.sys_id,
            manager: gr.group.manager.sys_id,
            subscription: gr.subscription.sys_id,
            type: gr.group.type,
            description: gr.group.description
        };
        groupIds.push(String(row.group));
        rows.push(row);
    }

    const userCountsByGroup = getNumGroupMembersByGroupIDs(groupIds);
    const activeUserCountsByGroup = new sn_entitlement.UserDao().getActiveGroupMembersCountByGroupIDs(groupIds);
    rows.forEach(row => {
        const grpId = String(row.group);
        if (userCountsByGroup.has(grpId)) {
            row.user_count = Number(userCountsByGroup.get(grpId)).toLocaleString();
            row.user_count_int = userCountsByGroup.get(grpId);
            row.active_users_count = Number(activeUserCountsByGroup.get(grpId) | 0).toLocaleString();
            row.active_users_count_int = activeUserCountsByGroup.get(grpId) | 0;
        }

        v_table.addRow(row);
    });

    function getNumGroupMembersByGroupIDs(groupIds) {
        const counts = new Map();

        if (groupIds.length === 0)
            return counts;

        const grmembers = new GlideAggregate('sys_user_grmember');
        grmembers.addQuery('group', "IN", groupIds);
        grmembers.addAggregate('COUNT', "group");
        grmembers.query();
        while (grmembers.next()) {
            counts.set(grmembers.getValue("group"), grmembers.getAggregate("COUNT", "group"));
        }

        return counts;
    }

    function getEncodedQuery(subscriptionIDCondition) {
        // If this remote table is being queried by subscription ID, optimize our query of the group_has_subscription table
        // to only retrieve the relevant records
        if (gs.nil(subscriptionIDCondition))
            return "";

        const [key, value] = subscriptionIDCondition.split("=");
        const shouldApplyIDCondition = key === "subscription" && !gs.nil(value);

        if (shouldApplyIDCondition) {
            return "subscription=" + value;
        } else
            return "";
    }

})(v_table, v_query);
