function transform(input) {
    var id = input && input.sys_id;
    var logic_types = [{
        "id": "all",
        "label": gs.getMessage("All conditions must be met to trigger this policy")
    }, {
        "id": "any",
        "label": gs.getMessage("Any of the conditions must be met to trigger this policy")
    }];
    var resp = {
        "when_to_run": "N/A",
        "triggers": [],
        "condition_logic": [],
        "condition_logic_types": logic_types,
        "conditions": [],
        "notification": "N/A",
        "isOOBPolicy": false
    };

    var policyManager = new sn_vsc.SecurityPoliciesManager();
    policyManager.updatePolicyConfigureValue(id);

    if (!id) return resp;
    var gr = new GlideRecord("sn_vsc_security_policy");
    if (gr.get(id)) {
	var existingConditionLogic = {
  	    "id" : "",
            "label" : ""
	};
        if (gr.getValue("events_criteria_type") == "all") {
            existingConditionLogic.id = logic_types[0].id;
            existingConditionLogic.label = logic_types[0].label;
        } else {
            existingConditionLogic.id = logic_types[1].id;
            existingConditionLogic.label = logic_types[1].label;
        }
	resp["condition_logic"].push(existingConditionLogic);
        resp["when_to_run"] = gr.getDisplayValue("trigger");
        if (gr.getValue("policy_type") == "system") {
            resp["isOOBPolicy"] = true;
        }
    }
    gr = new GlideRecord("sn_vsc_security_policy_condition");
    gr.addEncodedQuery("policy=" + id, true);
    gr.query();
    while (gr.next()) {
        // Get the condition's description fromt the sys_hub_action_type_definition table
        var sysHubActionTypeDefGr = new GlideRecord("sys_hub_action_type_definition");
        if (sysHubActionTypeDefGr.get(gr.getValue("action_type"))) {
            resp["conditions"].push(sysHubActionTypeDefGr.getDisplayValue("description"));
        }
    }

    gr = new GlideRecord("sn_vsc_security_policy_action");
    gr.addEncodedQuery("policy=" + id, true);
    gr.query();
    if (gr.next()) {
        var actionTypeSysId = gr.getValue("action_type");
        var hubActionTypeGr = new GlideRecord("sys_hub_action_type_definition");
        hubActionTypeGr.addEncodedQuery("sys_id=" + actionTypeSysId, true);
        hubActionTypeGr.query();
        if (hubActionTypeGr.next()) {
            resp["notification"] = hubActionTypeGr.getDisplayValue("description") || "-";
        } else {
            resp["notification"] = "-";
        }
    }

    gr = new GlideRecord("sn_vsc_security_policy_event_type");
    gr.query();
    while (gr.next()) {
        resp["triggers"].push({
            "id": gr.getValue("sys_id"),
            "label": gr.getDisplayValue()
        });
    }
    return resp;
}
