if((current.schedule.type == 'roster' && current.schedule.document == 'cmn_rota') ||
	(current.schedule.type == 'rotation' && current.schedule.document == 'cmn_rota_member') ||
(current.schedule.type == 'create_new_roster' && current.schedule.document.nil()))
answer = true;
else
	answer = false;
