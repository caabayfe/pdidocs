(function(context, pageParams, blockcontext) {
    var taskDefGR = new GlideAggregate('comm_task_definition');
    taskDefGR.addQuery("comm_plan_definition", pageParams.planSysId);
    taskDefGR.addAggregate('COUNT');
    taskDefGR.query();
    var count = 0;
    if (taskDefGR.next()) {
        count = taskDefGR.getAggregate('COUNT');
    }
    return {
        showEmptyState: !(count > 0),
        showList: count > 0,
    };
})(context, pageParams, blockcontext);
