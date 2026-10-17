setAndExpendDeliveryPlan();

function setAndExpendDeliveryPlan() { 
   gs.include("DeliveryPlanMatcher");
   var matcher = new DeliveryPlanMatcher(current);
   var planID = matcher.getPlan();
   if (!planID)
      return;
   
   current.delivery_plan = planID;
   gs.include("DeliveryPlan");
   var plan = new DeliveryPlan(current);
   plan.createChildren();
}
