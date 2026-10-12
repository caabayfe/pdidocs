function onLoad() {
    if (!g_scratchpad.change_model)
        return;

    var model = g_scratchpad.change_model;

    // Updates the state field relevant to the model
    model.updateStates = function(resetToInitialState) {
        var model = g_scratchpad.change_model;
        var fieldValue = g_form.getValue(model.field);

        g_form.clearOptions(model.field);

        if (!model.available_states || !model.available_states.length)
            return;

        model.available_states.forEach(function(state) {
            var choice = model.field_choices[state + ""];
            if (!choice) {
                //Add in the option as a value choice is it's in the model but not an available choice.
                g_form.addOption(model.field, state, state);
                return;
            }
            g_form.addOption(model.field, choice.value, choice.label);
        });

        // If the model doesn't contain the Change Request's state value
        if (model.available_states.indexOf(fieldValue) === -1 || resetToInitialState) {
            g_form.setValue(model.field, model.initial_state);
            return;
        }

        // If the Change Request is set to a value not in the Choice List or the model add it as an option.
        if (Object.keys(model.field_choices).indexOf(fieldValue) === -1)
            g_form.addOption(model.field, fieldValue, fieldValue);

        g_form.setValue(model.field, fieldValue);
    };

    model.updatePresets = function() {
        var model = g_scratchpad.change_model;
        if (!g_scratchpad.change_model.apply_record_preset)
            return;

        Object.keys(model.record_preset).forEach(function(field) {
            if (field === "EQ" || field === "chg_model")
                return;

            g_form.setValue(field, model.record_preset[field].value, model.record_preset[field].displayValue);
        });
    };

    // Legacy method, use refreshReadOnlyFields instead
    model.setPresetsReadOnly = function(readOnly) {
        _setModelReadOnlyFields(readOnly);
    };

    model.refreshModel = function(refreshedElements) {
        if (!refreshedElements)
            return;

        var model = g_scratchpad.change_model;
        Object.keys(refreshedElements).forEach(function(key) {
            model[key] = refreshedElements[key];
        });
    };

    model.mandatory_fields_set = [];

    model.refreshMandatoryFields = function() {
        _setTemplateMandatoryFields();
        _setModelMandatoryFields();
    };

    model.refreshReadOnlyFields = function(readOnly) {
        _setTemplateReadOnlyFields();
        _setModelReadOnlyFields(readOnly);
    };

    model.hide = function() {
        if (g_scratchpad.change_model.hidden)
            g_form.setDisplay("chg_model", false);
    };

    // Sets the model field readonly if the change is not in the initial state
    model.readOnlyIfNotInitial = function() {
        var model = g_scratchpad.change_model;
        if (g_form.getValue(model.field) + "" !== model.initial_state + "")
            g_form.setReadOnly("chg_model", true);
    };

    // Returns true if the current state has the named attribute
    model.hasStateAttribute = function(attributeName) {
        return model.state_attributes.indexOf(attributeName) !== -1;
    };

    // Returns true if the named attribute is associated to any state in the model
    model.containsAttribute = function(attributeName) {
        return model.contains_attribute.indexOf(attributeName) !== -1;
    };

    model.requestRefreshUpdateModel = function() {
        var ga = new GlideAjax("ChangeModelAJAXProcessor");
        ga.addParam("sysparm_name", "getModel");
        ga.addParam("sysparm_table", g_form.getTableName());
        ga.addParam("sysparm_change_sys_id", g_form.getUniqueValue());
        ga.addParam("sysparm_model_sys_id", g_form.getValue("chg_model"));
        ga.addParam("sysparm_model_on_form", g_form.hasField("chg_model"));
        ga.addParam("sysparm_change_type", g_form.getValue("type"));
        ga.getXML(updateScratchpad);

        function updateScratchpad(response) {
            var answer = response.responseXML.documentElement.getAttribute("answer");
            var refreshedElements = JSON.parse(answer);
            var model = g_scratchpad.change_model;
            model.refreshModel(refreshedElements);
            model.updateStates(false);
            model.refreshMandatoryFields();
        }
    };

    /* Change Model*/
    function _setModelMandatoryFields() {
        var model = g_scratchpad.change_model;
        var mandatoryFields = model.mandatory_fields[g_form.getValue("state")];
        if (!Array.isArray(mandatoryFields))
            return;

        mandatoryFields.forEach(function(mandatoryField) {
            if (!g_form.isMandatory(mandatoryField)) {
                g_form.setMandatory(mandatoryField, true);
                model.mandatory_fields_set.push(mandatoryField);
            }
        });

        if (model.mandatory_fields_set.length === 0)
            return;

        var unsetmandatoryFields = model.mandatory_fields_set.filter(function(field) {
            return !mandatoryFields.includes(field);
        });

        if (Array.isArray(unsetmandatoryFields))
            unsetmandatoryFields.forEach(function(mandatoryField) {
                g_form.setMandatory(mandatoryField, false);
            });
    }

    function _setModelReadOnlyFields(readOnly) {
        if (readOnly && !g_scratchpad.change_model.apply_record_preset)
            return;

        var model = g_scratchpad.change_model;
        Object.keys(model.record_preset).forEach(function(field) {
            if (field === "chg_model")
                return;

            g_form.setReadOnly(field, readOnly);
        });
    }

    /* Change Template */
    // Sets fields to mandatory as per the Change template field policies
    function _setTemplateMandatoryFields() {
        var model = g_scratchpad.change_model;
        if (!model || !model.template_field_policies || !model.template_field_policies.mandatory_template_field_policies)
            return;

        var mandatoryFields = model.template_field_policies.mandatory_template_field_policies;

        mandatoryFields.forEach(function(mandatoryField) {
            if (!g_form.isMandatory(mandatoryField))
                g_form.setMandatory(mandatoryField, true);
        });
    }

    // Sets fields to read-only as per the Change template field policies
    function _setTemplateReadOnlyFields() {
        var model = g_scratchpad.change_model;
        if (!model || !model.template_field_policies || !model.template_field_policies.readonly_template_field_policies)
            return;

        var readonlyFields = model.template_field_policies.readonly_template_field_policies;

        readonlyFields.forEach(function(readonlyField) {
            g_form.setReadOnly(readonlyField, true);
        });
    }
}
