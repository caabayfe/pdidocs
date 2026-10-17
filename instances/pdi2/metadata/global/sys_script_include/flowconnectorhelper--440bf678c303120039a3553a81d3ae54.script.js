var FlowConnectorHelper = Class.create();
FlowConnectorHelper.prototype = {

    PROBE_NAME: "Flow Connector Probe",

    initialize: function() {},

    /**
     * Schedules flow connectors that are due to run and sends ECC queue messages.
     * @returns {void}
     */
    schedule: function() {
        var FLOW_CONNECTOR_TABLE = 'sa_flow_connector';

        var scheduleStartTime = new GlideDateTime();

        var flowConnectorGr = new GlideRecord(FLOW_CONNECTOR_TABLE);
        flowConnectorGr.addActiveQuery();
        flowConnectorGr
            .addNullQuery('next_run_time')
            .addOrCondition('next_run_time', '<=', scheduleStartTime);
        flowConnectorGr.query();

        gs.print('flow connectors that need to run: ' + flowConnectorGr.getRowCount());

        while (flowConnectorGr.next()) {
            this._updateFlowConnectorNextRunTime(flowConnectorGr, scheduleStartTime);

            this.sendConnectorToECCQueue(flowConnectorGr.sys_id, flowConnectorGr.sys_class_name);
        }
    },

    /**
     * @param {GlideRecord} flowConnectorGr
     * @param {GlideDateTime} scheduleStartTime
     * @returns {void}
     * @private
     */
    _updateFlowConnectorNextRunTime: function(flowConnectorGr, scheduleStartTime) {
        var nextRunTimeDate = new GlideDateTime(scheduleStartTime);
        nextRunTimeDate.addSeconds(flowConnectorGr.schedule);
        flowConnectorGr.next_run_time = nextRunTimeDate;
        flowConnectorGr.update();
    },

    /**
     * @param {string} connectorSysId
     * @param {string} connectorTableName
     * @returns {string | null}
     */
    sendConnectorToECCQueue: function(connectorSysId, connectorTableName) {
        var connectorGr = new GlideRecord(connectorTableName);
        if (!connectorGr.get(connectorSysId)) {
            gs.error('Did not find connector');
            return null;
        }

        var PROBE_SOURCE_SCHEDULE = 'Schedule';
        var SCRIPT_PARAMETER_KEY = 'script';

        var eccProbe = SncProbe.get(this.PROBE_NAME);
        eccProbe.setSource(PROBE_SOURCE_SCHEDULE);
        eccProbe.setName(connectorGr.name);
        eccProbe.addParameter(SCRIPT_PARAMETER_KEY, connectorGr.javascript_to_run.name);

        this._addConnectorFieldsToProbe(connectorGr, eccProbe);

        var agentName = connectorGr.mid.name;
        var eccQueueId = eccProbe.create(agentName);

        gs.print('sent probe for ' + connectorTableName + ':' + connectorSysId + ' ecc queue message: ' + eccQueueId);

        return eccQueueId;
    },

    /**
     * @param {GlideRecord} connectorGr
     * @param {SncProbe} eccProbe
     * @returns {void}
     * @private
     */
    _addConnectorFieldsToProbe: function(connectorGr, eccProbe) {
        var fieldList = connectorGr.getFields();
        for (var index = 0; index < fieldList.size(); ++index) {
            var fieldName = fieldList.get(index).getName();
            var fieldValue = connectorGr.getValue(fieldName);
            eccProbe.addParameter(fieldName, fieldValue);
        }
    },

    type: 'FlowConnectorHelper'
};
