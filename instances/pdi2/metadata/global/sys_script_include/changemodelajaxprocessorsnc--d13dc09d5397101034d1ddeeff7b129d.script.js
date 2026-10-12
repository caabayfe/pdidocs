var ChangeModelAJAXProcessorSNC = Class.create();
ChangeModelAJAXProcessorSNC.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    LOG_PROPERTY: "com.snc.itsm.state_transition_model.log",

    initialize: function(request, responseXML, gc) {
        AbstractAjaxProcessor.prototype.initialize.call(this, request, responseXML, gc);

        this._log = new GSLog(this.LOG_PROPERTY, this.type).setLog4J();
    },

    getModel: function() {

        function getAllFieldChoices(table, field) {
            var fieldChoices = {};
            var choiceGr = new GlideSysChoice(table, field).getChoices();
            while (choiceGr.next()) {
                if (choiceGr.getValue('inactive') === '1')
                    continue;

                var choice = {
                    'value': choiceGr.getValue('value'),
                    'label': choiceGr.getDisplayValue('label')
                };

                fieldChoices[choice.value] = choice;
            }
            return fieldChoices;
        }

        var typeCompatibility = gs.getProperty('com.snc.change_management.change_model.type_compatibility', false) === 'true';
        var hideChangeModel = gs.getProperty('com.snc.change_management.change_model.hide', false) === 'true';

        // Same structure as BR 'Populate scratchpad with model' on change_request
        var model = {
            'field': 'state',
            'available_states': [],
            'mandatory_fields': {},
            'state_attributes': [],
            'contains_attribute': [],
            'field_choices': {},
            'initial_state': '-5',
            'apply_record_preset': true,
            'record_preset': {},
            "type_compatibility": typeCompatibility,
            'hidden': typeCompatibility && hideChangeModel,
            'contains_template_field_policies': false,
            'template_field_policies': {}
        };

        // Order of operations, change sys id takes precedent, then model, then type. Always check and prevent value set to: 'undefined'
        var changeSysId = JSUtil.nil(this.getParameter('sysparm_change_sys_id')) ? '' : this.getParameter('sysparm_change_sys_id') + '';
        var changeType = JSUtil.nil(this.getParameter('sysparm_change_type')) ? '' : this.getParameter('sysparm_change_type') + '';
        var modelId = JSUtil.nil(this.getParameter('sysparm_model_sys_id')) ? '' : this.getParameter('sysparm_model_sys_id') + '';
        var modelOnForm = 'true' === (this.getParameter('sysparm_model_on_form') + '').toLowerCase();
        var tableName = JSUtil.nil(this.getParameter('sysparm_table')) ? '' : this.getParameter('sysparm_table') + '';
        var modelTemplateId = JSUtil.nil(this.getParameter('sysparm_template_sys_id')) ? '' : this.getParameter('sysparm_template_sys_id') + '';

        var changeRequest = null;
        var changeRequestGr = new GlideRecord(tableName);
        changeRequestGr.initialize();
        var validChange = changeSysId && changeRequestGr.get(changeSysId);
        if (validChange && !modelId && !modelOnForm)
            modelId = changeRequestGr.getValue('chg_model');

        var changeModel = null;
        var changeModelGr = new GlideRecord('chg_model');

        var validModel = modelId && changeModelGr.get(modelId);
        if (validModel)
            changeModel = new ChangeModel(changeModelGr);

        if (validModel && !tableName)
            tableName = changeModelGr.getValue('table_name');

        if (!validModel && !tableName)
            tableName = 'change_request';

        var modelChanged = validChange && validModel && (modelId !== changeRequestGr.getValue('chg_model') && !!modelId !== changeRequestGr.chg_model.nil());
        var modelChangedToType = validChange && !validModel && modelChanged;

        // only relevant if no model, i.e. type based change
        var typeChanged = validChange && !validModel && (changeType !== changeRequestGr.getValue('type') && !!changeType !== changeRequestGr.type.nil());
        var typeChangedToModel = validChange && validModel && changeRequestGr.chg_model.nil();

        var setInitialState = false;

        if (validChange) {
            if (modelChanged || typeChanged)
                setInitialState = true;

            if (modelChangedToType)
                changeRequestGr.setValue('chg_model', '');

            if (typeChangedToModel)
                changeRequestGr.setValue('chg_model', modelId);
        }

        if (!validChange) {
            changeRequestGr = new GlideRecord(tableName);
            changeRequestGr.initialize();
            setInitialState = true;

            // New records with model passed in
            if (validModel)
                changeModel.applyModel(changeRequestGr);

            // If we haven't got a Change Request and Model on form but empty
            if (!validModel && modelOnForm && changeType)
                changeRequestGr.setValue('type', changeType);

            // If we haven't got a Change Request and no Model on form
            if (!validModel && !modelOnForm) {
                if (typeCompatibility && changeType)
                    changeRequestGr.setValue('type', changeType);

                // change models but removed model from form
                if (!typeCompatibility) {
                    changeModelGr = new GlideRecord('chg_model');
                    validModel = changeModelGr.get(ChangeModel.getDefaultModelValue(changeRequestGr));

                    if (validModel) {
                        changeModel = new ChangeModel(changeModelGr);
                        changeRequestGr.setValue('chg_model', changeModelGr.getUniqueValue());
                        changeModel.applyModel(changeRequestGr);
                    }
                }
            }
        }

        changeRequest = new ChangeRequest(changeRequestGr);

        model.field = changeRequest.getStateFieldName();
        model.initial_state = changeRequest.getInitialState();
        model.state_attributes = changeRequest.getStateAttributes();
        model.contains_attribute = changeRequest.getAttributesModelContains();

        if (setInitialState)
            changeRequestGr.setValue('state', changeRequest.getInitialState());

        if (changeRequest.getState())
            model.available_states = [changeRequest.getState()].concat(changeRequest.getNextManualStates());

        if (Array.isArray(model.available_states))
            model.available_states.forEach(function(state) {
                model.mandatory_fields[state] = this.getMandatoryFields(changeRequest.evaluateMoveTo(state, true));
            }, this);

        if (validModel) {
            model.apply_record_preset = changeModel.applyRecordPreset();
            model.record_preset = changeModel.getRecordPresetValues();
        }

        model.field_choices = getAllFieldChoices(tableName, model.field);

        if (this._log.atLevel(global.GSLog.DEBUG))
            this._log.debug("[getModel] modelTemplateId: " + modelTemplateId);

        if (global.JSUtil.notNil(modelTemplateId)) {
            var templateFieldPolicies = this.getTemplateFieldPolicies(modelTemplateId);
            model.contains_template_field_policies = templateFieldPolicies.hasFieldPolicies;
            model.template_field_policies = {
                "mandatory_template_field_policies": templateFieldPolicies.mandatoryFieldPolicies,
                "readonly_template_field_policies": templateFieldPolicies.readOnlyFieldPolicies
            };
        }

        return JSON.stringify(model);
    },

    getMandatoryFields: function(stateTransitions) {
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
    },

    getTemplateFieldPolicies: function(chgModelTemplateSysId) {
        var changeTemplate = new global.ChangeTemplate(chgModelTemplateSysId);
        var templateFieldPolicies = changeTemplate.getFieldPolicies();
        return {
            "hasFieldPolicies": templateFieldPolicies.hasFieldPolicies,
            "mandatoryFieldPolicies": templateFieldPolicies.mandatoryFieldPolicies,
            "readOnlyFieldPolicies": templateFieldPolicies.readOnlyFieldPolicies
        };
    },

    type: 'ChangeModelAJAXProcessorSNC'
});
