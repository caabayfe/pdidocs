(function refineQuery(current, primary, secondary) {
    var callerID = secondary.sys_id;
    var qur = new SOWInteractionUtils().getTaskAggregationQuery(callerID);	
    current.addEncodedQuery(qur, true);
})(current, primary, secondary);
