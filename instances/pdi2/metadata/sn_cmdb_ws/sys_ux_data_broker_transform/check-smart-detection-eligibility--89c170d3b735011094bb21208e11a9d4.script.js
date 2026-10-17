function transform(input) {
    var taskId = input.taskId;

    var smartDetectionUtil = new sn_cmdb_ws.CMDBAttestationSmartDetectionUtil();

    var isSmartDetectionDisabled = smartDetectionUtil.isSmartDetectionDisabled();
    var isEligibleForSmartDetection = smartDetectionUtil.isEligibleForSmartDetection();
    var result = {};

    if (!isSmartDetectionDisabled && isEligibleForSmartDetection) {
        result = smartDetectionUtil.getTaskState(taskId);
        result.smartDetectionFilter = smartDetectionUtil.getSmartDetectionFilter();

		var smartDetectionEligibleCisInfo = smartDetectionUtil.getSmartDetectionEligibleCIsInfo(taskId);

        if (result.smartDetectionAccepted) {
            result.activateSmartDetection = false;

            // if the smart detection has been accepted but all the CIs have been moved to Not Yet Reviewed and some CIs are eligible for smart detection, retrigger the flow
            var attestationStatusCount = smartDetectionUtil.getCountBasedOnAttestationStatus(taskId);
            var allCisInNotYetReviewedState = attestationStatusCount &&
                attestationStatusCount.length === 1 &&
                attestationStatusCount[0].attestation_status === smartDetectionUtil.ATTESTATION_STATUS.NOT_YET_REVIEWED &&
                attestationStatusCount[0].count > 0;

            if (allCisInNotYetReviewedState && smartDetectionEligibleCisInfo.ciCount > 0) {
                result.activateSmartDetection = true;
            }
        } else {
			// insert smart detection state if the state is empty
			if (!result.runOn) {
				smartDetectionUtil.insertOrUpdateSmartDetectionState(taskId, false, smartDetectionEligibleCisInfo.ciCount, result.hidePopupUserPref);
			}
            result.activateSmartDetection = !result.hidePopupUserPref;
            result.ciCount = smartDetectionEligibleCisInfo.ciCount;
            result.lastDiscovered = smartDetectionEligibleCisInfo.lastDiscovered;
            result.runOn = smartDetectionEligibleCisInfo.runOn;
        }
    } else {
        result.activateSmartDetection = false;
    }

    result.smartDetectionDisabled = isSmartDetectionDisabled;
    result.smartDetectionEligible = isEligibleForSmartDetection;
    return result;
}
