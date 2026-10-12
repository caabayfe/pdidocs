(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var result = [];
    var flows = [];
    var relatedObjectArray = [];
    var queryParams = request.queryParams;

    /**
     * Returns true if a duplicate sanpshot version found in sys_hub_flow_logic table, of a flow related to decision table.
     * @param nameKey - Sys id of the record.
     * @param snapshotArray - Array of flows/subflow related to decision table.
     * @returns {Boolean}
     */
    var isSnapshotExist = (nameKey, snapshotArray) => {
        for (var i = 0; i < snapshotArray.length; i++) {

            //If sys_id of sys_hub_flow_logic matches with any other master_snapshot or latest snapshot return true
            if (snapshotArray[i].latest_snapshot === nameKey || snapshotArray[i].master_snapshot === nameKey || snapshotArray[i].sys_id === nameKey) {
                return true;
            }
        }
        return false;
    };

    var decisionSysId = queryParams.decision_sys_id;

    if (!decisionSysId) {
        throw new sn_ws_err.ServiceError()
            .setStatus(500)
            .setMessage('decision_sys_id query parameter is required.');
    }

	//Get Decision tables referenced in Flows
	var getDTableReferencedFlows = (flowLogicTableName,decisionSysId) => {
		var dTableReferencedFlows = [];
		var flowLogicGr = new GlideRecord(flowLogicTableName);
		var flowGr = new GlideRecord('sys_hub_flow');
		flowLogicGr.isValid() && flowLogicGr.addQuery('decision_table', decisionSysId);
		flowLogicGr.isValid() && flowLogicGr.query();
		while (flowLogicGr.next()) {
			var flowValue = flowLogicGr.getValue('flow');
			var canRead = flowLogicGr.canRead();
			var flow = {};

			if (flowGr.get(flowValue)) {
				flow = {
					sys_id: flowValue,
					name: flowLogicGr.getDisplayValue('flow'),
					type: flowGr.getValue('type'),
					canread: canRead,
					active: flowGr.getValue('active'),
					status: flowGr.getValue('status'),
					latest_snapshot: flowGr.getValue('latest_snapshot'),
					master_snapshot: flowGr.getValue('master_snapshot'),
				};
				dTableReferencedFlows.push(flow);
			}
		}
		return dTableReferencedFlows;
	};
	//Get Decision tables referenced in flow version-1
	flows = getDTableReferencedFlows('sys_hub_flow_logic',decisionSysId);

	//Get Decision tables referenced in flow version-2
	flows = flows.concat(getDTableReferencedFlows('sys_hub_flow_logic_instance_v2',decisionSysId));

    /**
      Check and remove any duplicate records found in sys_hub_flow_logic.
      Also add type and active fields if both are null for non duplicate records.
    */
    for (var i = 0; i < flows.length; i++) {
        var match = false;
        if (flows[i].active === null && flows[i].status === null && flows[i].latest_snapshot === null && flows[i].master_snapshot === null) {
            for (var j = i + 1; j < flows.length; j++) {

                /** If active, status, latest_snapshot and master_snapshot all are null, check If sys_id of sys_hub_flow_logic matches with any other master_snapshot or latest snapshot.
                   If matches then remove the one which has null  active, status, latest_snapshot and master_snapshot.
                */
                if ((flows[i].sys_id === flows[j].latest_snapshot || flows[i].sys_id === flows[j].master_snapshot)) {
                    relatedObjectArray.push(flows[j]);
                    match = true;
                    break;
                }
            }
        }

        /** Check If sys_id of sys_hub_flow_logic already exist in relatedObjectArray.
        If Not then check if it has active and status both are null,
        then read those properties from sys_hub_flow_snapshot and in 
        Existing object.
        */
        if (match === false && !isSnapshotExist(flows[i].sys_id, relatedObjectArray)) {
            if (flows[i].active === null || flows[i].status === null) {
                var flowSnapshotGr = new GlideRecord('sys_hub_flow_snapshot');
                flowSnapshotGr.get(flows[i].sys_id);
                flows[i].type = flows[i].type === null ? flowSnapshotGr.getValue('type') : flows[i].active;
                flows[i].active = flows[i].active === null ? flowSnapshotGr.getValue('active') : flows[i].active;
            }
            relatedObjectArray.push(flows[i]);
        }
    }

    /** Filter read only values.*/
    for (var index in relatedObjectArray) {
        if (relatedObjectArray[index].canread) {
            result.push(relatedObjectArray[index]);
        } else {
            result.push({
                canread: false
            });

        }
    }


    response.setBody(result);
    response.setStatus(200);

})(request, response);
