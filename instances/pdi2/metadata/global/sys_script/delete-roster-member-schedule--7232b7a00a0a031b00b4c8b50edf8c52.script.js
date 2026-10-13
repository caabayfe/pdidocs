if (current.rotation_schedule) {
	var gr = new GlideRecord("cmn_schedule");
	if (gr.get(current.rotation_schedule))
		gr.deleteRecord();
}

if (!GlideTransaction.get() || (GlideTransaction.get().getRequestParameter("sysparm_form") != "m2m")) {
	var rotaGr = current.roster.rota.getRefRecord();
	var onCallRotation = new OnCallRotation();
	if (onCallRotation.canAutoUpgradeToNewScheduleEngine(rotaGr)) {
		onCallRotation.upgradeShiftToNewScheduleEngine(rotaGr);
	} else if (onCallRotation.isShiftOnOldEngine(rotaGr)) {
		new OCRotaMember().recalculate(current, previous);
	} else {
		var rosterGr = current.roster.getRefRecord();
		new OnCallRoster(rosterGr).updateRotationPayload();
	}
}
