(function executeRule(current, previous /*null when async*/ ) {
    gs.include("DeliveryPlan");
    var plan = new DeliveryPlan(current);
    plan.initTasks();
})(current, previous);
