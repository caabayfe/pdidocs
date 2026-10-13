(function executeRule(current, previous /*null when async*/ ) {

    current.group = current.cmn_rota ? current.cmn_rota.group : current.cmn_rota_escalation_set.group;
	
})(current, previous);
