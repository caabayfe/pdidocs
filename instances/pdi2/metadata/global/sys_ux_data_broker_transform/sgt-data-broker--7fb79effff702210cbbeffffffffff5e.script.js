function transform(input) {

    const getScanJobInstance = () => new SGTScanJob();
    const getScanHistoryInstance = () => new SGTScanHistoryDAO();
    const sgtDBViewDAO = () => new global.SGTDBViewDAO();
    const sgtScanResultDAO = () => new global.SGTScanResultDAO();
    const memberRemovalJob = () => new SGTGrpMemberRemovalJob();
    const memberRemovalJobHistoryDAO = () => new SGTMemberRemovalJobHistoryDAO();

    const methods = {

        scheduleScan: (params) => {
            params.scheduledTime = !params.scheduledTime ? new GlideDateTime() : new GlideDateTime(params.scheduledTime, true);
            getScanJobInstance().schedule(params);
        },

        scheduleForRemoval: (params) => memberRemovalJob().scheduleForRemoval(params.scanID, params.scheduledTime),

        cancelScan: (params) => getScanJobInstance().cancel(params.sysId),

        isAnyJobScheduledOrRunning: () => getScanHistoryInstance().isAnyJobScheduledOrRunning(),

        isAnyRemovalJobScheduledOrRunning: () => memberRemovalJobHistoryDAO().isAnyJobScheduledOrRunning(),

        getScanHistory: (sysId) => getScanHistoryInstance().getScanHistory(sysId),

        doManualConfiguration: function(userList) {
            let gdt = new GlideDateTime();
            var scanHistory = getScanHistoryInstance();
            var scanID = scanHistory.create(gdt, 0, true);
            sgtScanResultDAO().createScanResultForManualScan(scanID, userList);
            scanHistory.updateStatus(scanID, scanHistory.JOB_STATUS.COMPLETED);
            return scanID;
        },

        getKeepListUserId: (params) => sgtScanResultDAO().getKeepListUserId(params.scanId),

        addDays: (params) => {
            var gdt = params.time != undefined ? new GlideDateTime(params.time) : new GlideDateTime();
            if (params.daysToAdd != undefined)
                gdt.addDaysUTC(params.daysToAdd);
            return {
                displayValue: gdt.getDisplayValue(),
                numericValue: gdt.getNumericValue()
            };
        },

        updateAutoProvisioningStatus: (status) => new SGTProperties().updateAutoProvisioningProperty(status),

        getOrCreateNonScriptedUsersDBView: (params) => sgtDBViewDAO().getOrCreateNonScriptedUsersDBView(params.scanId),

        getCSWMembersCount: (params) => sgtScanResultDAO().getCSWMembersCount(params.scanId),

        resetScanResults: (params) => sgtScanResultDAO().resetScanResults(params.scanId, params.manualScan),

        moveUsersToKeepList: (params) => sgtScanResultDAO().moveUsersToKeepList(params.scanId, params.scanResults),

        moveAllUsersToRemoveList: (params) => sgtScanResultDAO().moveAllUsersToRemoveList(params.scanId),

        moveUsersToRemoveList: (params) => sgtScanResultDAO().moveUsersToRemoveList(params.scanResults),

        getUserInScanResult: (params) => sgtScanResultDAO().getUserInScanResult(params.scanResultId),

        getUserInGRMember: (params) => sgtScanResultDAO().getUserInGRMember(params.grMemberId),
    };

    return input.requests.map(req => ({
        action: req.action,
        result: methods[req.action](req.params)
    }));
}
