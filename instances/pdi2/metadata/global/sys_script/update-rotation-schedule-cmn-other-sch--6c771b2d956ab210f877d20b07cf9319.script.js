(function executeRule(current, previous /*null when async*/) {

	var ocRota = new OnCallRotation();
	var rotas = ocRota.getAffectedRotas(current.schedule.sys_id + "");
	var updatedRotaSchedulesCount = 0;
	for (var rota in rotas) {
		var rotaGr = new GlideRecord("cmn_rota");
		if (rotaGr.get(rotas[rota])) {
			if (ocRota.canAutoUpgradeToNewScheduleEngine(rotaGr)) {
				ocRota.upgradeShiftToNewScheduleEngine(rotaGr);
			} else if (ocRota.isShiftOnOldEngine(rotaGr)) {
				ocRota.computeRotaSchedules(rotas[rota]);
				updatedRotaSchedulesCount++;
			} else {
				var rosterGr = new GlideRecord("cmn_rota_roster");
				rosterGr.addQuery("rota", rotaGr.getUniqueValue());
				rosterGr.query();
				while (rosterGr.next()) {
					new OnCallRoster(rosterGr).updateRotationPayload();
				}
			}
		}
	}
	if (updatedRotaSchedulesCount > 0) 
		gs.info("Associated On-Call Schedules have been updated for schedule " + current.schedule.sys_id);	

})(current, previous);
