(function executeRule(current, previous) {
	var operation = current.operation();
	if (operation === "update" && !current.getElement("delivery_time").changes() && !current.getElement("delivery_plan").changes())
		return;

	if (operation === "update" && current.getElement("delivery_plan").changes())
		doCalcTotalDeliveryTime(previous.getValue("delivery_plan"));

	doCalcTotalDeliveryTime(current.getValue("delivery_plan"));
})(current, previous);

function doCalcTotalDeliveryTime(deliveryPlan) {
	if (deliveryPlan.isNil())
		return;
	
	var round = gs.getProperty("glide.sc.round.delivery.times", "true");
	var totaldays = 0;
	var calculator =  new GlideappCalculationHelper();
	calculator.setPlanId(deliveryPlan);
	if (round == "true") {
		// rounds off to days
		totaldays = calculator.calcMaxPathLength();
	}
	if (totaldays > 0) {
		// if > 1 day we round
		updateDeliveryPlan(totaldays + " 00:00:00", deliveryPlan);
	} else {
		// if < 1 day we do it all
		var realTime = calculator.calcActualMaxPlanLength();
		var duration = realTime.getDurationValue();
		var display = realTime.getDisplayValue();
		updateDeliveryPlan(duration, deliveryPlan);
		
	}
}

function updateDeliveryPlan(target, deliveryPlan) {
	// update the delivery plan
	var gr = new GlideRecord("sc_cat_item_delivery_plan");
	gr.addQuery("sys_id", deliveryPlan);
	gr.query();
	if (gr.next()) {
		gr.setValue('total_delivery_time', target);
		gr.update();
	}
}
