/**
 * If items are added after the request is set to 'approved' ensure the stage and approval fields are set correctly
 * and that the workflow will be attached through invoking the 'Start Tasks' business rule.
 * Designed to work with the 'Add New Item' UI Action on sc_request.
 * Not designed to work if a new item is added manually. such as enabling the new button on the 'Requested Items' related list.
 */

setApprovalFields();

function setApprovalFields() {
   // We handle this differently for delivery plans vs. workflows
   if ((current.cat_item.workflow && !current.cat_item.workflow.nil()) || (current.cat_item.flow_designer_flow && !current.cat_item.flow_designer_flow.nil())) {
      current.approval = "requested";
      current.stage = "request_approved";
   } else {
      current.approval = current.request.approval;   
      current.stage = getNextStage(current);
   }
}

function getNextStage(reqItem) {
   // return the first delivery task
   var nextStage = "nothing";
   var planID = GlideappDeliveryPlan.resolvePlanID(reqItem);
   var gr = new GlideRecord("sc_cat_item_delivery_task");
   gr.addQuery("delivery_plan", planID);
   gr.orderBy("order");
   gr.query();
   if(gr.next())
      nextStage = gr.name.getDisplayValue();
   
   return nextStage;
}
