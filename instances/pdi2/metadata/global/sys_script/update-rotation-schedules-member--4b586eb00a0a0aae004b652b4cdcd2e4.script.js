if (!GlideTransaction.get() || (GlideTransaction.get().getRequestParameter("sysparm_form") != "m2m")) {
    var rotaGr = current.roster.rota.getRefRecord();
    var rosterGr = current.roster.getRefRecord();
    var onCallRotation = new OnCallRotation();
	if (onCallRotation.canAutoUpgradeToNewScheduleEngine(rotaGr)) {
        onCallRotation.upgradeShiftToNewScheduleEngine(rotaGr);
    } else if (onCallRotation.isShiftOnOldEngine(rotaGr)) {
        new OCRotaMember().recalculate(current, previous);
    } else {
		new OnCallRoster(rosterGr).updateRotationPayload();
	}
}
