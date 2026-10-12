var PDOverrideRepository = Class.create();
PDOverrideRepository.prototype = {
    initialize: function() {},
    type: 'PDOverrideRepository',

    getOverridesByProcessDefinition: function(processDefinitionId) {
        if (!processDefinitionId)
            throw (gs.getMessage('Missing required parameter: processDefinitionId'));

        var gr = new GlideRecord(PDConstants.TABLES.PD_ACTIVITY_OVERRIDE);
        gr.addQuery(PDConstants.FIELDS.OVERRIDE_PARENT + "." + PDConstants.FIELDS.PROCESS_DEFINITION, processDefinitionId);
        gr.query();

        var overrides = [];
        while (gr.next()) {
            overrides.push(this._getOverrideFromGR(gr));
        }
        return overrides;
    },

    insertOverride: function(fields) {
        fields = fields || {};
        var sysId = fields.sysId;

        this._throwIfMissingMandatoryFields(fields, ['sysId']);

        var gr = PDUtils.newGlideRecordWithSkipProcessUpdate(PDConstants.TABLES.PD_ACTIVITY_OVERRIDE);
        gr.initialize();

        if (sysId)
            gr.setNewGuidValue(sysId);

        this._setFieldsOnGr(fields, gr);
        var insertedOverrideId = gr.insert();

        if (!insertedOverrideId) {
            var errorRecordId = sysId || '';
            throw gs.getMessage('Unable to insert override {0}: {1}', [errorRecordId, gr.getLastErrorMessage()]);
        }

        var padGCFCollector = new PADGCFCollector();
        padGCFCollector.recordProcessUsageEvent(padGCFCollector.processEvents.OVERRIDE_CREATED, 0);

        return this._getOverrideFromGR(gr);
    },

    updateOverride: function(fields) {
        fields = fields || {};

        this._throwIfMissingMandatoryFields(fields, ['sysId']);

        var sysId = fields['sysId'];
        var gr = PDUtils.newGlideRecordWithSkipProcessUpdate(PDConstants.TABLES.PD_ACTIVITY_OVERRIDE);
        var overrideGr = gr.get(sysId);

        if (!overrideGr)
            throw (gs.getMessage('Unable to find override with id: {0}', sysId));

        this._setFieldsOnGr(fields, gr);
        if (!gr.update())
            throw gs.getMessage('Unable to update override {0}: {1}', [sysId, overrideGr.getLastErrorMessage()]);

        var override = this._getOverrideFromGR(gr);
        return override;
    },

    deleteOverrides: function(overrideIdsStr) {
        PDUtils.deleteRecordsBySysIds(overrideIdsStr, PDConstants.TABLES.PD_ACTIVITY_OVERRIDE);
    },

    _getOverrideLaneFromGR: function(gr) {
        var glideRecord = new GlideRecord(PDConstants.TABLES.PD_ACTIVITY);
        var laneId = null;
        if (glideRecord.get(gr.getValue(PDConstants.FIELDS.OVERRIDE_PARENT))) {
            laneId = glideRecord.getValue(PDConstants.FIELDS.LANE);
        }
        return laneId;
    },

    _getOverrideFromGR: function(gr) {
        var FIELDS = PDConstants.FIELDS;

        var startRuleVarActivitiesElement =
            gr.getElement(PDConstants.FIELDS.START_RULE_VAR_AFTER_ACTIVITIES);
        var startRuleVarActivitiesValue =
            startRuleVarActivitiesElement && startRuleVarActivitiesElement.getValue();
        if (startRuleVarActivitiesValue)
            startRuleVarActivitiesValue = startRuleVarActivitiesElement.split(',');

        var startRuleVarBranchesElement =
            gr.getElement(PDConstants.FIELDS.START_RULE_VAR_BRANCHES);
        var startRuleVarBranchesValue =
            startRuleVarBranchesElement && startRuleVarBranchesElement.getValue();
        if (startRuleVarBranchesValue)
            startRuleVarBranchesValue = startRuleVarBranchesValue.split(',')
            .map(function(branch) {
                var splitBranch = branch.split('.');
                return {
                    activityId: splitBranch[0],
                    branchId: splitBranch[1]
                };
            });

        var startRule = {
            definition: gr.getValue(FIELDS.START_RULE),
            vars: {
                activities: startRuleVarActivitiesValue || [],
                branches: startRuleVarBranchesValue || []
            },
            startRuleName: gr.getValue(PDConstants.FIELDS.START_RULE_NAME),
            startsAfterLanes: gr.getValue(PDConstants.FIELDS.STARTS_AFTER_LANES) && gr.getValue(PDConstants.FIELDS.STARTS_AFTER_LANES).split(','),
            startsAfterBranches: PDUtils.transformStartsAfterBranches(
                gr.getValue(PDConstants.FIELDS.STARTS_AFTER_BRANCHES)
            ),
            startsAfterActivities: gr.getValue(PDConstants.FIELDS.STARTS_AFTER_ACTIVITIES) && gr.getValue(PDConstants.FIELDS.STARTS_AFTER_ACTIVITIES).split(',')
        };
        //To be removed to deprecate start rule V2 Schema
        startRule = PDUtils.addStartRuleV2Schema(startRule, !this._getOverrideLaneFromGR(gr), true);

        return {
            sys_id: PDUtils.getFieldReturnValue(gr, FIELDS.SYS_ID),
            override_parent: PDUtils.getFieldReturnValue(gr, FIELDS.OVERRIDE_PARENT),
            order: PDUtils.getFieldReturnValue(gr, FIELDS.ORDER),
            start_rule: startRule,
            variant: PDUtils.getFieldReturnValue(gr, FIELDS.VARIANT)
        };
    },

    _setFieldsOnGr: function(fields, gr) {
        for (var fieldName in fields) {
            var fieldValue = fields[fieldName];
            var snakeCaseFieldName = PDUtils.camelcaseToSnakecase(fieldName);
            switch (snakeCaseFieldName) {
                case PDConstants.FIELDS.SYS_ID: //we never want to set the sys id of an update
                    break;
                case PDConstants.FIELDS.START_RULE:
                    PDUtils.handleStartRuleChange(fieldValue, gr);
                    break;
                default:
                    PDUtils.setGlideRecordFieldValue(gr, snakeCaseFieldName, fieldValue);
            }
        }
    },

    _throwIfMissingMandatoryFields: function(fields, mandatoryFields) {
        var missingFields = PDUtils.findMissingFields(fields, mandatoryFields).join(", ");
        if (missingFields.length)
            throw gs.getMessage('Missing {0}', [missingFields]);
    }
};
