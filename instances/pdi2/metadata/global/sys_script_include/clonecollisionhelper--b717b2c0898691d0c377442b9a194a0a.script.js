var CloneCollisionHelper = Class.create();
/**
 * Gets any conflicts that overlap the period defined by startDate and endDate
 * @instanceId
 * @param startDate
 * @param endDate
 * @return <object> conflicts
 */
CloneCollisionHelper.getConflictsByDate = function(instanceId, startDate, endDate) {
    var dcConflicts = {};
    var dcCalendarUtil = new DCCalendarRestEndPoint();
    //Check given dates are null or end date is greater than start date.
    if (!gs.nil(startDate) && !gs.nil(endDate)) {
        var startDateTimeInUTC = new GlideDateTime(startDate);
        var endDateTimeInUTC = new GlideDateTime(endDate);
        if (startDateTimeInUTC.after(endDateTimeInUTC))
            return {
                status: "error",
                message: "Given startDate : " + startDate + " is after endDate : " + endDate
            };
    } else {
        return {
            status: "error",
            message: "Given startDate : " + startDate + " or endDate is empty : " + endDate
        };
    }
    var result = dcCalendarUtil.requestToGetConflictsRest(startDateTimeInUTC, endDateTimeInUTC, instanceId);
    if ((!gs.nil(result.stcdResult.status)) && result.stcdResult.status == "error") {
        dcConflicts.status = result.stcdResult.status;
        dcConflicts.message = result.stcdResult.errorMessage;
    } else {
        dcConflicts.blackoutConflicts = result.stcdResult.blackoutConflicts;
        dcConflicts.maintenanceConflicts = result.stcdResult.maintenanceConflicts;
        dcConflicts.status = result.stcdResult.status;
    }
    return dcConflicts;

};
