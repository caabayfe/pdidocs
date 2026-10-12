var PDLaneRepository = Class.create();
PDLaneRepository.prototype = {
    initialize: function() {},
    type: 'PDLaneRepository',

    getLanes: function(processDefinitionId) {
        var lanes = [];
        var lanesGR = new GlideRecord(PDConstants.TABLES.PD_LANE);
        lanesGR.addQuery(PDConstants.FIELDS.PROCESS_DEFINITION, processDefinitionId);
        lanesGR.query();
        while (lanesGR.next()) {
            var lane = this._getLaneFromGR(lanesGR);
            lanes.push(lane);
        }
        return lanes;
    },

    insertLane: function(fields) {
        fields = fields || {};
        var sysId = fields.sysId;
        var processDefinition = fields.processDefinition;
        var gr = PDUtils.newGlideRecordWithSkipProcessUpdate(PDConstants.TABLES.PD_LANE);
        gr.initialize();
        if (!processDefinition)
            throw gs.getMessage('Missing process definition id');

        if (sysId)
            gr.setNewGuidValue(sysId);

        var startDelay = fields['startDelay'];
        startDelay = PDUtils.updateStartWithDelay(startDelay);

        this._setFieldsOnGr(fields, gr, false);

        var insertedId = gr.insert();

        if (!insertedId) {
            var errorRecordId = sysId || '';
            throw gs.getMessage('Unable to insert lane {0}: {1}', [errorRecordId, gr.getLastErrorMessage()]);
        }

        var lane = this._getLaneFromGR(gr, startDelay);
        return lane;
    },

    updateLane: function(fields) {
        fields = fields || {};

        var sysId = fields['sysId'];

        if (!sysId)
            throw (gs.getMessage('Missing required field: sysId'));

        var startDelay = fields['startDelay'];
        startDelay = PDUtils.updateStartWithDelay(startDelay, sysId);

        var gr = PDUtils.newGlideRecordWithSkipProcessUpdate(PDConstants.TABLES.PD_LANE);
        var laneGr = gr.get(sysId);

        if (!laneGr)
            throw (gs.getMessage('Unable to find lane with id: {0}', sysId));

        this._setFieldsOnGr(fields, gr, true);

        if (!gr.update())
            throw gs.getMessage('Unable to update lane {0}: {1}', [sysId, laneGr.getLastErrorMessage()]);

        var lane = this._getLaneFromGR(gr, startDelay);
        return lane;
    },

    deleteLanes: function(laneIdsStr) {
        if (!(laneIdsStr || '').length)
            throw (gs.getMessage('No lane ids provided for deletion'));

        var laneGr = PDUtils.newGlideRecordWithSkipProcessUpdate(PDConstants.TABLES.PD_LANE);

        laneGr.addQuery(PDConstants.FIELDS.SYS_ID, 'IN', laneIdsStr);
        laneGr.query();
        laneGr.deleteMultiple();
    },

    _setFieldsOnGr: function(fields, gr, isUpdate) {
        gr[PDConstants.FIELDS.PROCESS_SCHEMA_VERSION] = fields['processSchemaVersion']; //gr.setValue doesn't work here because schema_version is not a valid field
        for (var fieldName in fields) {
            var fieldValue = fields[fieldName];
            var snakeCaseFieldName = PDUtils.camelcaseToSnakecase(fieldName);
            switch (snakeCaseFieldName) {
                case PDConstants.FIELDS.SYS_ID: //we never want to set the sys id of an update
                    break;
                case PDConstants.FIELDS.START_RULE:
                    PDUtils.handleStartRuleChange(fieldValue, gr);
                    break;
                case PDConstants.FIELDS.PROCESS_SCHEMA_VERSION:
                    break;
                case PDConstants.FIELDS.PERMISSION:
                    var parsedPermission;
                    try {
                        parsedPermission = JSON.parse(fieldValue);
                    } catch (e) {
                        parsedPermission = null;
                    }
                    if (parsedPermission === null) {
                        if (!isUpdate) { // if update. let them keep their old permission
                            var defaultPermission = PDUtils.getDefaultLanePermission();
                            PDUtils.setGlideRecordFieldValue(gr, snakeCaseFieldName, defaultPermission);
                        }
                    } else {
                        PDUtils.setGlideRecordFieldValue(gr, snakeCaseFieldName, fieldValue);
                    }
                    break;
                default:
                    PDUtils.setGlideRecordFieldValue(gr, snakeCaseFieldName, fieldValue);
            }
        }
    },

    _getLaneFromGR: function(gr, startDelay) {
        var FIELDS = PDConstants.FIELDS;
        var getStartRuleVarsLanes =
            gr.getElement(PDConstants.FIELDS.START_RULE_VAR_AFTER_LANES);
        var startRuleVarValueLanes = getStartRuleVarsLanes && getStartRuleVarsLanes.getValue();
        if (startRuleVarValueLanes)
            startRuleVarValueLanes = getStartRuleVarsLanes.split(',');

        if (!startDelay) {
            var startDelayGr = new GlideRecord(PDConstants.TABLES.PD_TIMER_ATTRIBUTES_TABLE);
            startDelayGr.addQuery('source', gr.getValue(FIELDS.SYS_ID));
            startDelayGr.query();
            if (startDelayGr.next()) {
                startDelay = PDUtils.getStartWithDelay(startDelayGr);
            }
        }

        var startRule = {
            definition: gr.getValue(FIELDS.START_RULE),
            vars: {
                lanes: startRuleVarValueLanes || []
            },
            startRuleName: gr.getValue(PDConstants.FIELDS.START_RULE_NAME),
            startsAfterLanes: gr.getValue(PDConstants.FIELDS.STARTS_AFTER_LANES) && gr.getValue(PDConstants.FIELDS.STARTS_AFTER_LANES).split(','),
            startsAfterBranches: PDUtils.transformStartsAfterBranches(
                gr.getValue(PDConstants.FIELDS.STARTS_AFTER_BRANCHES)
            ),
            startsAfterActivities: gr.getValue(PDConstants.FIELDS.STARTS_AFTER_ACTIVITIES) && gr.getValue(PDConstants.FIELDS.STARTS_AFTER_ACTIVITIES).split(','),
        };
        //To be removed to deprecate start rule V2 Schema
        startRule = PDUtils.addStartRuleV2Schema(startRule, true, false);

        return {
            sys_id: PDUtils.getFieldReturnValue(gr, FIELDS.SYS_ID),
            label: PDUtils.getFieldReturnValue(gr, FIELDS.LABEL),
            name: PDUtils.getFieldReturnValue(gr, FIELDS.NAME),
            color: PDUtils.getFieldReturnValue(gr, FIELDS.COLOR),
            order: PDUtils.getFieldReturnValue(gr, FIELDS.ORDER),
            active: PDUtils.getFieldReturnValue(gr, FIELDS.ACTIVE),
            description: PDUtils.getFieldReturnValue(gr, FIELDS.DESCRIPTION),
            process_definition: PDUtils.getFieldReturnValue(gr, FIELDS.PROCESS_DEFINITION),
            sys_created_on: PDUtils.getFieldReturnValue(gr, FIELDS.SYS_CREATED_ON),
            sys_updated_on: PDUtils.getFieldReturnValue(gr, FIELDS.SYS_UPDATED_ON),
            start_rule: startRule,
            restart_rule: PDUtils.getFieldReturnValue(gr, FIELDS.RESTART_RULE),
            condition_to_run: PDUtils.getFieldReturnValue(gr, FIELDS.CONDITION_TO_RUN),
            start_delay: {
                timerAttributes: startDelay || {}
            },
            permission: PDUtils.getFieldReturnValue(gr, FIELDS.PERMISSION)
        };
    }
};
