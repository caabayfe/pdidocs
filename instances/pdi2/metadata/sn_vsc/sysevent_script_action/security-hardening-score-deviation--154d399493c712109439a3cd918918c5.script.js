process();

function process() {
    var constants = new sn_vsc.SecurityCenterConstants();
    var thresholdProp = gs.getProperty(constants.securityTaskProperty.HARDENING_SCORE_DEVIATION_THRESHOLD);
    if (gs.nil(thresholdProp)) {
        gs.warn("Missing " + constants.securityTaskProperty.HARDENING_SCORE_DEVIATION_THRESHOLD);
        return;
    }

    if (isNaN(thresholdProp) || parseInt(thresholdProp) <= 0) {
        gs.warn("Skipped to process for " + constants.securityTaskType.HARDENING_SCORE_DEVIATION_THRESHOLD + " due to incorrect value system property " + constants.securityTaskProperty.HARDENING_SCORE_DEVIATION_THRESHOLD);
        return;
    }

    if ((gs.nil(event.parm1) || isNaN(event.parm1)) && (gs.nil(event.parm2) || isNaN(event.parm2))) {
        gs.warn("Skipped to process for " + constants.securityTaskType.HARDENING_SCORE_DEVIATION_THRESHOLD + " due to missing parm1/parm2 or invalid parm1/parm2 in sysevent");
        return;
    }

    //check the score change from last daily score for threshold breach and create a security task
    var newScore = parseInt(event.parm1);
    var prevScore = parseInt(event.parm2);

    var thresholdValue = parseInt(thresholdProp);
    var scoreChange = prevScore - newScore;
    if (scoreChange >= thresholdValue) {
        var taskParams = {
            'score': newScore,
            'old_score': prevScore,
            'details_params': [newScore, prevScore]
        };
        new SCTaskManagerOperations().queueSecurityTaskCreate(constants.securityTaskType.HARDENING_SCORE_DEVIATION, null, taskParams);
    }
}
