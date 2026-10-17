(function executeQuery(v_table, v_query) {
    const getValFromVQueryCondition = (condition) => {
        if (!condition || condition.length === 0 || condition.indexOf('=') === -1)
            return null;

        return condition.split('=')[1];
    };

    const subscriptionId = getValFromVQueryCondition(v_query.getCondition("subscription"));

    new sn_sub_man.UnallocatedGroupRecommendationProvider()
        .getData(subscriptionId)
        .forEach(row => v_table.addRow(row));
})(v_table, v_query);
