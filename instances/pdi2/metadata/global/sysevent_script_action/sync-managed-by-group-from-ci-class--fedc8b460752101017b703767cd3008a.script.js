function processEvent() {
    var util = new CSDMCMDBUtil();
    var batchSize = util.getDataSyncProcessBatchSize();
    var newValues = event.parm1 ? event.parm1 : "";
    var oldValues = event.parm2 ? event.parm2 : "";
    var ciSysIds = {};

    // dynamicCiGroup : [] assoc ci list array
    var cisMappedToGroup = {};

    // techncial service offering : dynamic ci group
    var groupsMappedToService = {};

    var className = current.getValue("class");
    var ciCountOffset = 0;

    ciSysIds = util.getCisForClassWithEncQueryAndWindow(className, "managed_by_group!=" + newValues + "^ORmanaged_by_groupISEMPTY", batchSize, ciCountOffset);
    var previousFirstSysId = 0;
	var batchCount = 0;
    while (Object.keys(ciSysIds).length > 0) {
        gs.debug("Sync Managed By Group from CI Class batch number: " + batchCount + " batchSize: " + batchSize + " ciCountOffset: " + ciCountOffset, "CSDMCMDBUtil");
        if (previousFirstSysId && Object.keys(ciSysIds).indexOf(previousFirstSysId) >= 0) {
            // protect against infinite loop
            gs.error("Sync Managed By Group from CI Class attempted to update a duplicate SysID", "CSDMCMDBUtil");
            return;
        }
        cisMappedToGroup = util.getCisMappedToDCG(Object.keys(ciSysIds));
        if (Object.keys(cisMappedToGroup).length > 0) {

            groupsMappedToService = util.getAssocTSOsFromDCG(Object.keys(cisMappedToGroup));

            // fetch the technical service offerings
            var grTso = util.getTSOs(Object.keys(groupsMappedToService));

            while (grTso.next()) {

                if (grTso.getValue("managed_by_group")) {
                    groupsMappedToService[grTso.getValue("sys_id")].forEach(function(groupSysId) {
                        cisMappedToGroup[groupSysId].forEach(function(ciToSkip) {
                            // remove these cis from the update structure, they already are assigned to a TSO that has a managed by group
                            delete ciSysIds[ciToSkip];
                            ciCountOffset++;
                        });
                    });
                }
            }
        }
        var finalCiArrayAfterProcess = Object.keys(ciSysIds);
        if (finalCiArrayAfterProcess.length > 0) {
            util.updateRecords(className, finalCiArrayAfterProcess, {
                managed_by_group: newValues
            });
        }
        previousFirstSysId = finalCiArrayAfterProcess[0];
        gs.debug("Sync Managed By Group from CI Class updated MBG for CI Count: " + finalCiArrayAfterProcess.length + " batch number: " + batchCount, "CSDMCMDBUtil");
        ciSysIds = util.getCisForClassWithEncQueryAndWindow(className, "managed_by_group!=" + newValues + "^ORmanaged_by_groupISEMPTY", batchSize, ciCountOffset);
    }
}
processEvent();
