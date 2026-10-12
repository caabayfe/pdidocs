function transform(input) {
    var output = {};
    var sowInteractionUtils = new SOWInteractionUtils();
    output.taskQuery = sowInteractionUtils.getTaskAggregationQuery(input.userSysId);
    output.numberOfDays = sowInteractionUtils.getNumberOfDays();
    var taskGr = new GlideRecord('task');
    taskGr.addEncodedQuery(output.taskQuery, true);
    taskGr.setLimit(1);
    taskGr.query();
    output.hasTasks = taskGr.hasNext();
    output.isDRRPluginInstalled = GlidePluginManager.isActive('com.snc.uib.sn_dyn_rel_rec');
    return output;
}
