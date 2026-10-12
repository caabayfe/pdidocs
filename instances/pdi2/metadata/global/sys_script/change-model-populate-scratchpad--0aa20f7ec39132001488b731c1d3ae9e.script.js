(function executeRule(current, previous /*null when async*/ ) {
    var changeRequest = new ChangeRequest(current);
    var typeCompatibility = gs.getProperty("com.snc.change_management.change_model.type_compatibility", false) === "true";
    var model = {
        "field": changeRequest.getStateFieldName(),
        "available_states": [],
        "mandatory_fields": {},
        "state_attributes": changeRequest.getStateAttributes(),
        "contains_attribute": changeRequest.getAttributesModelContains(),
        "field_choices": {},
        "initial_state": changeRequest.getInitialState(),
        "apply_record_preset": true,
        "record_preset": {},
        "type_compatibility": typeCompatibility,
        "hidden": typeCompatibility && gs.getProperty("com.snc.change_management.change_model.hide", false) === "true",
        "contains_template_field_policies": false,
        "template_field_policies": {}
    };
    g_scratchpad.change_model = model;

    var currentState = "";
    var nextStates = changeRequest.getNextManualStates();
    if (current.isNewRecord())
        currentState = changeRequest.getInitialState();
    else if (current.isActionAborted()) {
        var prevChgReqGr = new GlideRecord(current.getTableName());
        prevChgReqGr.get(current.getUniqueValue());
        var prevChgReq = new ChangeRequest(prevChgReqGr);
        currentState = prevChgReq.getState();
        nextStates = prevChgReq.getNextManualStates();
    } else
        currentState = changeRequest.getState();

    // All available states
    if (currentState)
        model.available_states = [currentState].concat(nextStates);

    if (!current.chg_model.nil()) {
        var changeModel = new ChangeModel(current.chg_model.getRefRecord());
        model.apply_record_preset = changeModel.applyRecordPreset();
        model.record_preset = changeModel.getRecordPresetValues();

        if (Array.isArray(nextStates))
            nextStates.forEach(function(toState) {
                model.mandatory_fields[toState] = changeModel.getTransitionMandatoryFields(currentState, toState);
            });
    }

    // All field choices
    var choiceGr = new GlideSysChoice(current.getTableName(), changeRequest.getStateFieldName()).getChoices();
    while (choiceGr.next()) {
        if (choiceGr.getValue("inactive") === "1")
            continue;

        var choice = {
            "value": choiceGr.getValue("value"),
            "label": choiceGr.getDisplayValue("label")
        };

        model.field_choices[choice.value] = choice;
    }

    // Change Template
    var chgModelTemplateSysId = current.getValue("chg_model_template");
    if (global.JSUtil.notNil(chgModelTemplateSysId)) {
        var changeTemplate = new global.ChangeTemplate(chgModelTemplateSysId);
        var templateFieldPolicies = changeTemplate.getFieldPolicies();
        model.contains_template_field_policies = templateFieldPolicies.hasFieldPolicies;
        model.template_field_policies = {
            "mandatory_template_field_policies": templateFieldPolicies.mandatoryFieldPolicies,
            "readonly_template_field_policies": templateFieldPolicies.readOnlyFieldPolicies
        };
    }

    function getMandatoryFields(stateTransitions) {
        var mandatoryFields = [];
        if (!Array.isArray(stateTransitions) || stateTransitions.isEmpty())
            return mandatoryFields;

        stateTransitions.forEach(function(stateTransition) {
            if (Array.isArray(stateTransition.conditions) && !stateTransition.conditions.isEmpty())
                stateTransition.conditions.forEach(function(elem) {
                    if (Array.isArray(elem.condition.mandatory_fields) && !elem.condition.mandatory_fields.isEmpty())
                        mandatoryFields = mandatoryFields.concat(elem.condition.mandatory_fields);
                });
        });
        return mandatoryFields;
    }

})(current, previous);
