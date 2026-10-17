(function executeRule(current, previous /*null when async*/) {

	var ocRota = new OnCallRotation();
	var rotas = ocRota.getAffectedRotas(current.sys_id + "");
	var updatedRotaSchedulesCount = 0;
	for (var rota in rotas) {
		var rotaGr = new GlideRecord("cmn_rota");
		if (rotaGr.get(rotas[rota])) {
			if (ocRota.canAutoUpgradeToNewScheduleEngine(rotaGr)) {
				ocRota.upgradeShiftToNewScheduleEngine(rotaGr);
			} else if (ocRota.isShiftOnOldEngine(rotaGr)) {
				ocRota.computeRotaSchedules(rotas[rota]);
				updatedRotaSchedulesCount++;
			}
		}
	}
	if (updatedRotaSchedulesCount > 0) 
		gs.info("Associated On-Call Schedules have been updated for schedule " + current.sys_id);	

})(current, previous);
