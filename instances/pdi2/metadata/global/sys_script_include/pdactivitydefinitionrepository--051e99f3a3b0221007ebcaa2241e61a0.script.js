var PDActivityDefinitionRepository = Class.create();
PDActivityDefinitionRepository.prototype = {
    initialize: function() {},
    type: 'PDActivityDefinitionRepository',

    getActivityDefinitions: function() {
        const gr = new GlideRecordSecure(PADConstants.TABLES.PD_ACTIVITY_DEFINITION);
        const scope = gs.getCurrentApplicationId();
        const query = 'access=public^NQactive=true^sys_scope=' + scope;
        gr.addQuery(query);
        gr.query();

        const activityDefinitions = [];
        while (gr.next()) {
            const activityDefinitionObject = this.getActivityDefinitionObject(gr);
            activityDefinitions.push(activityDefinitionObject);
        }
        this._decorateWithAdditionalData(activityDefinitions);

        return activityDefinitions;
    },

    /**
     * A private method that was extracted from the PDActivityRepository to
     * prevent duplicate logic in both this repo and there.
     */
    getActivityDefinitionObject: function(activityDefGr) {
        if (!activityDefGr)
            return;

        var canRead = activityDefGr.canRead();
        var FIELDS = PDConstants.FIELDS;

        return {
            sys_id: PDUtils.getFieldReturnValue(activityDefGr, FIELDS.SYS_ID),
            name: PDUtils.getFieldReturnValue(activityDefGr, FIELDS.NAME),
            label: PDUtils.getFieldReturnValue(activityDefGr, FIELDS.LABEL),
            badge: PDUtils.getFieldReturnValue(activityDefGr, FIELDS.BADGE),
			enable_ai_agent: PDUtils.getFieldReturnValue(activityDefGr, FIELDS.ENABLE_AI_AGENT),
            ai_agent_objective: PDUtils.getFieldReturnValue(activityDefGr, FIELDS.AI_AGENT_OBJECTIVE),
            ai_agent_obj_additional_detail: PDUtils.getFieldReturnValue(activityDefGr, FIELDS.AI_AGENT_AUTONOMOUS_OBJECTIVE),
			conversational_agents: PDUtils.getFieldReturnValue(activityDefGr, FIELDS.CONVERSATIONAL_AGENTS),
            ai_agent_run_as: PDUtils.getFieldReturnValue(activityDefGr, FIELDS.AI_AGENT_RUN_AS),
            ai_agent_user: PDUtils.getFieldReturnValue(activityDefGr, FIELDS.AI_AGENT_USER),
            ai_agent_execution_mode: PDUtils.getFieldReturnValue(activityDefGr, FIELDS.AI_AGENT_ACTIVITY_AUTO_COMPLETE),
            activity_type: PDUtils.getFieldReturnValue(activityDefGr, FIELDS.ACTIVITY_TYPE),
            activity_type_obj: this._getActivityTypeObject(PDUtils.getFieldReturnValue(activityDefGr, FIELDS.ACTIVITY_TYPE).value),
            source: PDUtils.getFieldReturnValue(activityDefGr, FIELDS.SOURCE),
            source_type: PDUtils.getFieldReturnValue(activityDefGr, FIELDS.SOURCE_TYPE),
            input_display_preferences: PDUtils.getFieldReturnValue(activityDefGr, FIELDS.INPUT_DISPLAY_PREFERENCES),
            experience_display_preferences: PDUtils.getFieldReturnValue(activityDefGr, FIELDS.EXPERIENCE_DISPLAY_PREFERENCES),
            additional_functionality: PDUtils.getFieldReturnValue(activityDefGr, FIELDS.ADDITIONAL_FUNCTIONALITY),
            can_read: canRead
        };
    },

    /**
     * Shared with the "Flag non-form activity for AI Agent tab" business rule so both
     * places agree on what counts as form-based, instead of maintaining the logic twice.
     */
    isFormBased: function(activityDefGr) {
        if (!activityDefGr) {
            return false;
        }

        if (activityDefGr.category.toString() === PDConstants.NON_INTERACTIVE_CATEGORY_SYS_ID) {
            return false;
        }

        var typeVals = activityDefGr.type_vals;
        if (!typeVals || (!('form_view' in typeVals) && !('form_fields' in typeVals))) {
            return false;
        }

        var displayPrefs = activityDefGr.experience_display_preferences;
        var SHOW_AS_ADDITIONAL_PROP_TO_ADMIN = 'advanced';

        if (!displayPrefs) {
            return !!(typeVals.form_view || typeVals.form_fields);
        }

        var formViewDisplayPref = this._getDisplayPrefValue('form_view', displayPrefs);
        var formFieldsDisplayPref = this._getDisplayPrefValue('form_fields', displayPrefs);

        if (formFieldsDisplayPref === SHOW_AS_ADDITIONAL_PROP_TO_ADMIN || formViewDisplayPref === SHOW_AS_ADDITIONAL_PROP_TO_ADMIN) {
            return !!(typeVals.form_view || typeVals.form_fields);
        }

        return true;
    },

    _getDisplayPrefValue: function(key, str) {
        // Display preferences are stored as a ';'-delimited "key=value" string
        // (e.g. "form_view=advanced;form_fields=advanced"), so match "key=" and
        // capture everything up to the next ';' (or the end of the string).
        var regex = new RegExp(key + '=([^;]*)');
        var match = str.match(regex);
        return match ? match[1] : null;
    },

    _getActivityTypeObject: function(activityTypeId) {
        if (!activityTypeId)
            return;

        var gr = new GlideRecord(PDConstants.TABLES.PD_ACTIVITY_TYPE);
        gr.get(activityTypeId);
        if (!gr.canRead()) {
            return;
        }

        var FIELDS = PDConstants.FIELDS;

        return {
            sys_id: PDUtils.getFieldReturnValue(gr, FIELDS.SYS_ID),
            name: PDUtils.getFieldReturnValue(gr, FIELDS.NAME),
            color: PDUtils.getFieldReturnValue(gr, FIELDS.COLOR),
            icon: PDUtils.getFieldReturnValue(gr, FIELDS.ICON),
            color_category_obj: this._getColorCategoryObject(PDUtils.getFieldReturnValue(gr, FIELDS.COLOR_CATEGORY).value)
        };
    },

    _getColorCategoryObject: function(id) {
        if (!id)
            return;

        var gr = new GlideRecord(PDConstants.TABLES.COLOR_CATEGORY_TABLE);
        gr.get(id);
        if (!gr.canRead()) {
            return;
        }

        var FIELDS = PDConstants.FIELDS;

        return {
            display_name: PDUtils.getFieldReturnValue(gr, FIELDS.COLOR_CATEGORY_DISPLAY_NAME),
            custom_property: PDUtils.getFieldReturnValue(gr, FIELDS.COLOR_CATEGORY_CUSTOM_PROPERTY)
        };
    },

    /**
     * The Activity Definition data we query for here are not used in the PDActivityRepository
     * and it would slow down the gets in that repo if they were included.
     */
    _decorateWithAdditionalData: function(activityDefinitions) {
        if (!Array.isArray(activityDefinitions) || activityDefinitions.length < 1) {
            return;
        }

        this._decorateWithVarMeta(activityDefinitions);
        this._decorateWithSourceDefinition(activityDefinitions);
    },

    _decorateWithVarMeta: function(activityDefinitions) {
        const FIELDS = PDConstants.FIELDS;
        this._decorateWithReference(activityDefinitions, PDConstants.TABLES.VAR_DICTIONARY, FIELDS.MODEL_ID, FIELDS.SOURCE, (gr, activityDefinition) => {
            if (!activityDefinition.variable_meta) {
                activityDefinition.variable_meta = [];
            }
            if (!activityDefinition?.inputs?.variables) {
                activityDefinition.inputs = Object.assign({
                        variables: []
                    },
                    activityDefinition.inputs);
            }
            activityDefinition.variable_meta.push({
                element_name: PDUtils.getFieldReturnValue(gr, FIELDS.ELEMENT),
                dependent_on_field: PDUtils.getFieldReturnValue(gr, FIELDS.DEPENDENT_ON_FIELD)
            });
            if (gr.getValue(FIELDS.NAME).includes(PDConstants.RAW_ASSETS.TABLE_FLOW_INPUT)) {
                activityDefinition.inputs.variables.push({
                    variableName: gr.getValue(FIELDS.ELEMENT),
                    label: gr.getValue(FIELDS.LABEL),
                    isMandatory: PDUtils.getFieldReturnValueInBoolean(gr, FIELDS.MANDATORY).value
                });
            }
        });
        this._decorateWithReference(activityDefinitions, PDConstants.TABLES.VAR_DICTIONARY, FIELDS.MODEL_ID, FIELDS.ACTIVITY_TYPE, (gr, activityDefinition) => {
            if (!activityDefinition?.type_vals?.variables) {
                activityDefinition.type_vals = Object.assign({
                        variables: []
                    },
                    activityDefinition.type_vals);
            }
            activityDefinition.type_vals.variables.push({
                variableName: gr.getValue(FIELDS.ELEMENT),
                label: gr.getValue(FIELDS.LABEL),
                isMandatory: PDUtils.getFieldReturnValueInBoolean(gr, FIELDS.MANDATORY).value
            });
        });
    },
    _decorateWithSourceDefinition: function(activityDefinitions) {
        const FIELDS = PDConstants.FIELDS;
        const assignSourceDefinition = (fieldName, gr, activityDefinition) => {
            activityDefinition[fieldName] = {
                name: PDUtils.getFieldReturnValue(gr, FIELDS.NAME),
                access: PDUtils.getFieldReturnValue(gr, FIELDS.ACCESS),
                type: PDUtils.getFieldReturnValue(gr, FIELDS.TYPE),
                sys_id: PDUtils.getFieldReturnValue(gr, FIELDS.SYS_ID)
            };
        };
        this._decorateWithReference(
            activityDefinitions,
            PDConstants.TABLES.SYS_HUB_FLOW,
            FIELDS.SYS_ID,
            FIELDS.SOURCE,
            assignSourceDefinition.bind(this, 'subflow_definition')
        );
        this._decorateWithReference(
            activityDefinitions,
            PDConstants.TABLES.SYS_HUB_ACTION_TYPE_DEFINITION,
            FIELDS.SYS_ID,
            FIELDS.SOURCE,
            assignSourceDefinition.bind(this, 'action_type_definition')
        );
    },
    _decorateWithReference(activityDefinitions, table, joinField, joinValue, assignFunction) {
        const gr = new GlideRecord(table);
        let grOR;
        const actDefIndex = {};
        activityDefinitions.forEach((activityDefinition) => {
            if (!grOR) {
                grOR = gr.addQuery(joinField, activityDefinition[joinValue].value);
            } else {
                grOR.addOrCondition(joinField, activityDefinition[joinValue].value);
            }
            if (!actDefIndex[activityDefinition[joinValue].value]) {
                actDefIndex[activityDefinition[joinValue].value] = [];
            }
            actDefIndex[activityDefinition[joinValue].value].push(activityDefinition);
        });
        gr.query();

        while (gr.next()) {
            let activityDefinitions = actDefIndex[gr.getValue(joinField)];
            if (!activityDefinitions) {
                continue;
            }

            activityDefinitions.forEach(assignFunction.bind(this, gr));
        }
    }
};
