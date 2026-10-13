var ocRota = new OnCallRotation();
if (ocRota.canAutoUpgradeToNewScheduleEngine(current)) {
    ocRota.upgradeShiftToNewScheduleEngine(current);
} else if (ocRota.isShiftOnOldEngine(current)) {
	var rosterGR = new GlideRecord("cmn_rota_roster");
	rosterGR.addActiveQuery();
	rosterGR.addQuery("rota", current.sys_id);
	rosterGR.query();
	while (rosterGR.next()) {
		updateRoster(rosterGR);
	}
} else if (current.getElement(OnCallRotationSNC.FIELDS.SCHEDULE_ENGINE).changes()) {
	ocRota.updateAllRostersRotationPayload(current.getUniqueValue());
}

function updateRoster(rosterGR) {
	// Recompute the rotation schedules for the roster members
	ocRota.computeRotationSchedules(rosterGR);
	gs.addInfoMessage(gs.getMessage('Rotation schedules for "{0}" "{1}" have been updated', [rosterGR.name, rosterGR.rota.name]));
}
