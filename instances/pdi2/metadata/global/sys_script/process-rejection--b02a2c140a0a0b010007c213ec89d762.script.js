startPeerTasks();
function startPeerTasks() {
   gs.include("DeliveryPlan");
   var parent_id = current["parent"] + '';
   var parent_class = current["parent"].sys_class_name + '';
   var prec = new GlideRecord(parent_class);
   prec.get(parent_id);
   var plan = new DeliveryPlan(prec);
   plan.rejectTask(current);
}
