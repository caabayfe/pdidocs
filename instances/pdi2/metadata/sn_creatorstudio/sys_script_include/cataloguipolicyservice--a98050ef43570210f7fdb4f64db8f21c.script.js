const CatalogUiPolicyService = (function() {
    return class CatalogUiPolicyService {
        static type = "CatalogUiPolicyService";
        static #TABLE_NAME = "catalog_ui_policy";
        static #ACTION_TABLE_NAME = "catalog_ui_policy_action";
        static #VARIABLE_TABLE_NAME = "item_option_new";
        static #QUESTION_TYPES = {
            REFERENCE: "8",
            FIELD_CHOICE: "18",
            MULTI_SELECT: "21"
        };

        static getUiPoliciesForForm(rpId) {
            const uiPolicies = CatalogUiPolicyService.#fetchUiPolicies(rpId);
            const policySysIds = Object.keys(uiPolicies);
            const actions = CatalogUiPolicyService.#fetchUiPolicyActions(policySysIds);

            actions.forEach(action => {
                const uiPolicy = uiPolicies[action.uiPolicy];
                if (uiPolicy) {
                    uiPolicy.actions.push(action);
                }
            });

            const result = {};
            Object.values(uiPolicies).forEach(policy => {
                policy.actions.forEach(action => {
                    const catalogVariable = action.catalogVariable;
                    if (!result[catalogVariable]) {
                        result[catalogVariable] = {
                            policies: []
                        };
                    }
                    result[catalogVariable].policies.push(policy);
                });
            });
            return result;
        }

        static #fetchUiPolicies(rpId) {
            const uiPolicies = {};
            const grPolicy = new GlideRecordSecure(CatalogUiPolicyService.#TABLE_NAME);
            grPolicy.addQuery("catalog_item", rpId);
            grPolicy.query();
            while (grPolicy.next()) {
                uiPolicies[grPolicy.getValue("sys_id")] = {
                    sysId: grPolicy.getValue("sys_id"),
                    shortDescription: grPolicy.getValue("short_description"),
                    catalogConditions: grPolicy.getValue("catalog_conditions"),
                    appliesCatalog: grPolicy.getValue("applies_catalog") === "1",
                    appliesReqItem: grPolicy.getValue("applies_req_item") === "1",
                    appliesScTask: grPolicy.getValue("applies_sc_task") === "1",
                    actions: [],
                };
            }
            return uiPolicies;
        }

        // Query actions by ui_policy (not catalog_item) because the CRP post_insert_script
        // does not populate catalog_item on catalog_ui_policy_action records.
        static #fetchUiPolicyActions(policySysIds) {
            if (!policySysIds || policySysIds.length === 0) return [];
            const actionLookupValues = [];
            const actions = [];
            const grAction = new GlideRecordSecure(CatalogUiPolicyService.#ACTION_TABLE_NAME);
            grAction.addQuery("ui_policy", "IN", policySysIds.join(","));
            grAction.query();

            while (grAction.next()) {
                actions.push({
                    catalogItem: grAction.getValue("catalog_item"),
                    catalogVariable: grAction.getValue("catalog_variable").substring(3),
                    cleared: grAction.getValue("cleared") === "1",
                    disabled: grAction.getValue("disabled"),
                    field: grAction.getValue("field"),
                    fieldMessage: grAction.getValue("field_message"),
                    fieldMessageType: grAction.getValue("field_message_type"),
                    mandatory: grAction.getValue("mandatory"),
                    order: grAction.getValue("order"),
                    sysId: grAction.getValue("sys_id"),
                    uiPolicy: grAction.getValue("ui_policy"),
                    value: grAction.getValue("value"),
                    valueAction: grAction.getValue("value_action"),
                    visible: grAction.getValue("visible"),
                    variable: grAction.getValue("variable"),
                });

                const actionValue = grAction.getValue("value");
                if (actionValue) {
                    actionLookupValues.push({
                        catalogVariable: grAction.getValue("catalog_variable").substring(3),
                        variable: grAction.getValue("variable"),
                        value: actionValue
                    });
                }
            }

            CatalogUiPolicyService.#getDisplayValuesForActions(actions, actionLookupValues);

            return actions;
        }

        static #getDisplayValuesForActions(actions, actionLookupValues) {
            //Exit eagerly if there are no values to lookup
            if (!actionLookupValues.length) return false;

            const variableIds = [...new Set(actionLookupValues.map(action => action.catalogVariable))]

            //Query all variable types with values to determine if further lookup is required
            const grVariables = new GlideRecordSecure(CatalogUiPolicyService.#VARIABLE_TABLE_NAME);
            grVariables.addQuery("sys_id", "IN", variableIds.toString());
            grVariables.query();

            while (grVariables.next()) {
                const variableId = grVariables.getValue('sys_id');
                const variableType = grVariables.getValue('type');

                actions.filter(action => action.catalogVariable === variableId)
                    .forEach(action => {
                        action.variable = {
                            variableId: variableId,
                            variableType: variableType,
                            reference: grVariables.getValue('reference'),
                            listTable: grVariables.getValue('list_table'),
                            lookupTable: grVariables.getValue('lookup_table'),
                            lookupValue: grVariables.getValue('lookup_value'),
                        }
                    });
            }

            const variableUtil = new global.VariableUtil();
            //Iterate over actions where type is reference type / multi select / field choice
            actions.filter(action => action.variable &&
                (action.variable.variableType === CatalogUiPolicyService.#QUESTION_TYPES.REFERENCE ||
                    action.variable.variableType === CatalogUiPolicyService.#QUESTION_TYPES.MULTI_SELECT
                )
            ).forEach(action => {
                action.displayValue = variableUtil.getDisplayValue(action.variable.variableId, action.value);
            });

        }
    };
})();
