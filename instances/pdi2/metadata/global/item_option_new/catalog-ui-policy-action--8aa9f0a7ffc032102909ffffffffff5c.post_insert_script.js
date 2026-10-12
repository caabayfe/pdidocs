(function() {
    function update(action, uiPolicy) {
        var uiPolicyActionGR = new GlideRecord('catalog_ui_policy_action');
        uiPolicyActionGR.get(action.sys_id + '');
        setValues(uiPolicyActionGR, action);
        uiPolicyActionGR.ui_policy = uiPolicy;
        uiPolicyActionGR.catalog_item = current.catalog_item;
        uiPolicyActionGR.variable_set = current.variable_set;
        return uiPolicyActionGR.update();
    }

    function setValues(gr, action) {
        gr.catalog_variable = action.catalog_variable + '';
        gr.order = action.order + '';
        gr.mandatory = action.mandatory + '';
        gr.visible = action.visible + '';
        gr.disabled = action.disabled + '';
        gr.field_message_type = action.field_message_type + '';
        gr.field_message = action.field_message + '';
        gr.value_action = action.value_action + '';
        gr.value = action.value + '';
        gr.cleared = action.cleared + '';
    }

    function create(action, uiPolicy) {
        var uiPolicyActionGR = new GlideRecord('catalog_ui_policy_action');
        uiPolicyActionGR.initialize();
        if (GlideStringUtil.isEligibleSysID(action.sys_id)) {
            uiPolicyActionGR.setNewGuidValue(action.sys_id);
        }
        setValues(uiPolicyActionGR, action);
        uiPolicyActionGR.ui_policy = uiPolicy;
        uiPolicyActionGR.catalog_item = current.catalog_item;
        uiPolicyActionGR.variable_set = current.variable_set;
        return uiPolicyActionGR.insert();
    }

    function deletePolicyActions(uiPolicyActions) {
        var gr = new GlideRecord('catalog_ui_policy_action');
        gr.addQuery('sys_id', 'IN', uiPolicyActions.join());
        gr.query();
        gr.deleteMultiple();
    }

    function save() {
        var uiPolicy = current.sys_id;
        if (!uiPolicy)
            return;

        var currentUIPolicyActions = {};
        var uiPolicyActionGR = new GlideRecord('catalog_ui_policy_action');
        uiPolicyActionGR.addQuery('ui_policy', uiPolicy);
        uiPolicyActionGR.query();
        while (uiPolicyActionGR.next()) {
            currentUIPolicyActions[uiPolicyActionGR.sys_id + ''] = true;
        }


        var valueStr = producer.catalog_ui_policy_action;
        if (valueStr) {
            var actions;
            try {
                value = JSON.parse(valueStr);
                if (Array.isArray(value))
                    actions = value;
                else
                    actions = value.actions || [];
            } catch (e) {
                actions = [];
                return;
            }

            for (var i = 0; i < actions.length; i++) {
                var action = actions[i];
                var exists = currentUIPolicyActions[action.sys_id + ''];
                var returnedId;
                if (exists) {
                    delete currentUIPolicyActions[action.sys_id + ''];
                    returnedId = update(action, uiPolicy);
                } else
                    returnedId = create(action, uiPolicy);

                if (!GlideStringUtil.isEligibleSysID(returnedId)) {
                    throw "Unable to create/update policy action"
                }
            }
        }

        var currentUIPolicyActionIdsArr = Object.keys(currentUIPolicyActions);
        if (currentUIPolicyActionIdsArr.length > 0)
            deletePolicyActions(currentUIPolicyActionIdsArr);
    }

    save();
})();
