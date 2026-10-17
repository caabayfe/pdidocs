/**
 * Return the list of stages for a Request Item as a choice list
 * 
 * We first determine if the item has a workflow or a delivery plan. For
 * delivery plans, we create the stages from the delivery plan tasks. For
 * workflows, we create the stages from the workflow stages.
 */
function sc_req_item_stageGetChoices() {
	if (JSUtil.nil(answer)) {
		// answer is a Java Object hence do not use typeof check. As this will throw error. JSUtil.nil will check nullability for java objects.
		// answer is not set then return immediately as there is no placeholder for choicelist.
		return;
	}
	var wfs = new WorkflowStages();
	var pendingChoice = new GlideChoice("not_started", gs.getMessage("Not Started"));
	// Fix for Service Catalog Overview homepage We do not have current or we have bad defined current object
	if (typeof current == "undefined" || JSUtil.nil(current) || !current || JSUtil.nil(current.sys_id)) {
		try {
			// get most up-to-date list of options. 
			// answer is a GLOBAL variable, and is populated by a Choice list.
			// see SysChoice.java method: getChoicesFunction
				answer.add(pendingChoice);
				wfs.getSimpleChoiceList('sc_req_item', 'stage', answer);
		} catch (e) {
			gs.log("Error generating stage choices: " + e);
			return;
		}
	}

	if ( typeof current != "undefined" && !JSUtil.nil(current) && !JSUtil.nil(current.sys_id) && (JSUtil.nil(current.cat_item) || JSUtil.nil(current.cat_item.name))) {
		addErrorChoice(gs.getMessage("Catalog item removed"));
		return;
	}

	if (typeof current == "undefined" || !current) 
		return;

	if (current.cat_item && current.cat_item.workflow != null && !current.cat_item.workflow.nil()) {
		// Create the choices from the workflow stages
		var version;
		
		// We have already started a workflow for the item, use its version
		if (current.context)
			version = current.context.workflow_version;
		else {
			// We have not started a workflow for the item yet (pending request
			// approval) so determine the version we will eventually be using
			version = new Workflow().getVersion(current.cat_item.workflow);
			if (!version || version.nil()) 
				return;
			
			version = version.sys_id + '';
		}
		wfs.setWorkflowVersion(version, current.context + '');
		wfs.getChoices(current.stage, answer);
		
		if (!answer.getChoice("request_approved")) {
			addRequestApprovedChoice();
		}
	} 
	else if (current.cat_item && current.cat_item.flow_designer_flow != null && !current.cat_item.flow_designer_flow.nil()) {
               // Create the choices from the Flow Designer stages
			var choice = new GlideChoice("waiting_for_approval", gs.getMessage("Request Approval"));
			answer.add(choice);
			var flowStages = GlideappCalculationHelper.getFlowStages(current.cat_item.flow_designer_flow);
			for (var i = 0; i < flowStages.getSize(); i++) {
				var c = flowStages.getChoice(i);
				answer.add(c);
			}
    }
	else {
		// Create the choices from the delivery plan tasks
		sc_req_item_stage_DeliveryPlanChoices(answer);
	}

	if (JSUtil.notNil(current.order_guide) && JSUtil.notNil(current.order_guide.sequencing_process) && !answer.getChoice("not_started"))
		answer.addFirst("not_started", gs.getMessage("Not Started"));

	function addErrorChoice(label) {
		answer.add('error', label).image = "images/workflow_rejected.gifx";
	}

	function addRequestApprovedChoice() {
		var numberofChoices = answer.getSize();
		for (var i = 0; i < numberofChoices; i++) {
			var retrievedChoice = answer.get(i);
			if (retrievedChoice.getValue() == 'waiting_for_approval' || retrievedChoice.getValue() == 'approved') {
				var choice = new GlideChoice("request_approved", gs.getMessage("Request Approved"));
				answer.add(i+1, choice);
				return;
			}
		}
	}
}

// Choices include the Delivery Plan steps if a DP is specified
function sc_req_item_stage_DeliveryPlanChoices(answer) {
	// always add this
	var choices = new GlideChoiceList();
	choices.add("waiting_for_approval", gs.getMessage("Request Approval"));
	if (typeof current != "undefined" && !JSUtil.nil(current) && current.cat_item != null && !current.cat_item.nil()) {
		// there is a catalog item
		var planID = GlideappDeliveryPlan.resolvePlanID(current);

		var plan = GlideAbstractExecutionPlan.get(planID);
		if (plan != null) {
			var tokens = plan.getSortedTokenList();

			for (var x = 0; x < tokens.size(); x++) {
				var tt = tokens.get(x);
				choices.add(tt.getName(), gs.getMessage(tt.getName()));
			}
		}
	}
	answer.addAll(new GlideappRequestItemWorkflow(current).generateChoices(choices));
}
