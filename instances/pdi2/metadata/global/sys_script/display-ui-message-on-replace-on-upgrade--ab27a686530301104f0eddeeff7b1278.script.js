(function executeRule(current, previous /*null when async*/) {

	gs.addInfoMessage(gs.getMessage("The active field and any other fields with update_exempt attribute on a metadata table will not be replaced with the values from base version on upgrade, even if a Customer Update record is set to 'replace_on_upgrade'"));
})(current, previous);
