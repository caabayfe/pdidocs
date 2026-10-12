(function executeQuery(v_table, v_query) {

    const encodedQuery = getEncodedQuery(v_query.getCondition("subscription"));
    const gr = new GlideRecord("group_allocation_data_m2m_subscription_detail");
    gr.addEncodedQuery(encodedQuery);
    gr.addActiveQuery();
    // Setting remote table row limit to 20000 along with turning on Enhanced Capacity flag
    gr.setLimit(20000);
    // joins
    const helper = new sn_sub_man.SMGlideRecordHelper();
    helper.addExtraField(gr, "subscription_detail.subscription.sys_id");
    helper.addExtraField(gr, "group_allocation_data.group.sys_id");
    helper.addExtraField(gr, "group_allocation_data.group.manager");
    helper.addExtraField(gr, "group_allocation_data.group.name");

    gr.query();

    const rows = [];
    const groupIds = [];

    const ZERO = Number(0).toLocaleString();
    while (gr.next()) {
        if (!gr.group_allocation_data?.group?.name)
            continue; // if the group name is not resolvable, then domain seperation may be responsible for restricting access to the group and should not result in an output entry
        const row = {
            // using group sys id as record sys id
            sys_id: gr.group_allocation_data.group.sys_id,
            user_count: ZERO,
            user_count_int: 0,
            active_users_count: ZERO,
            active_users_count_int: 0,
            group: gr.group_allocation_data.group.sys_id,
            manager: gr.group_allocation_data.group.manager,
            subscription: gr.subscription_detail.subscription,
            ui_visible: gr.ui_visible
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
        let encodedQuery = "subscription_detail.is_latest=true^is_allocated=false";

        // If this remote table is being queried by subscription ID, optimize our query of the m2m table
        // to only retrieve the relevant records
        if (gs.nil(subscriptionIDCondition))
            return encodedQuery;

        const [key, value] = subscriptionIDCondition.split("=");
        const shouldApplyIDCondition = key === "subscription" && !gs.nil(value);

        if (shouldApplyIDCondition)
            encodedQuery += "^subscription_detail.subscription.sys_id=" + value;

        return encodedQuery;
    }

})(v_table, v_query);
