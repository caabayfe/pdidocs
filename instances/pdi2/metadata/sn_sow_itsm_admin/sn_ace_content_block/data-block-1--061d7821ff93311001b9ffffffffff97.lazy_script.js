(function(context, pageParams, blockcontext) {
    var planDefGR = new GlideAggregate('comm_plan_definition');
    planDefGR.addAggregate('COUNT');
    planDefGR.query();
    var count = 0;
    if (planDefGR.next()) {
        count = planDefGR.getAggregate('COUNT');
    }
    return {
        listRecordCount: count,
        showEmptyState: !(count > 0),
        showList: count > 0
    };
})(context, pageParams, blockcontext);
