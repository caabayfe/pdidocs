function transform(input) {

    var returnObj = {};
    var sysId = input.sys_id;
    var res = new sn_vsc.SCPlaybookUtil().getBPStepData(sysId);
    var msg = "";
    var outstandingStepsCount = res.totalSteps - res.completedSteps;
    if (res.completedSteps > 0) {
        msg = gs.getMessage('This Best Practice was last edited on {0} by {1}. ', [res.lastUpdated.split(" ")[0], res.lastUpdatedBy]);
    }
    if (outstandingStepsCount > 0) {
        msg += gs.getMessage('{0} outstanding steps are ready to be completed.', outstandingStepsCount);
    }
    returnObj = {
        'totalSteps': res.totalSteps,
        'completedSteps': res.completedSteps,
        'outstandingSteps': outstandingStepsCount,
        'message': msg
    };

    return returnObj;
}
