function transform(input) {
    var wrapperFunction = function() {
        var recordSelection = input.recordSelection;
        var encodedQuery = "";
        if (recordSelection.allRecordsSelected) {
          encodedQuery = recordSelection.fixedFilter + '^' + recordSelection.query;
        }
        var proxy = new sn_cmdb_ws.CMDBWsDMPolicyUIProxy();
        var DM = new CMDBWsDMConstants();
        var isDeletePoliciesActionScheduled = false;
        if (recordSelection.selectionCount <= DM.UI_DEFAULT_LIMIT.DM_DELETE_POLICY) {
          proxy.deleteSelectedPolicies(encodedQuery, recordSelection.selectedRecords);
        } else {
          proxy.markPoliciesForDeletion(encodedQuery, recordSelection.selectedRecords);
          isDeletePoliciesActionScheduled = true;
        }
        return {
          "isDeletePoliciesActionScheduled": isDeletePoliciesActionScheduled
        };
	};
    return new sn_cmdb_ws.CMDBWsDataBrokerHandler().execute("sn_cmdb_ws_dm", "Data Manager Delete Policies", wrapperFunction);
}
