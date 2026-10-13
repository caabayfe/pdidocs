(function executeRule(current, previous /*null when async*/ ) {

    // Clear cache on addition of extra time
    var rotaGr = new GlideRecord('cmn_rota');
    rotaGr.addActiveQuery();
    rotaGr.addQuery('schedule', current.schedule + '');
    rotaGr.query();
    while (rotaGr.next()) {
        var ocRota = new OnCallRotation();
        if (ocRota.isShiftOnNewEngine(rotaGr)) {
            ocRota.updateAllRostersRotationPayload(rotaGr.getUniqueValue());
        }
    }

})(current, previous);
