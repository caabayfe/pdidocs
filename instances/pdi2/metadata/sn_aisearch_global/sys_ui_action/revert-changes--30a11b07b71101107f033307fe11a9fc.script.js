var url = current.getTableName() + '.do?sys_id=' + current.sys_id.toString() + '&sysparm_view=default';

try {
	var reverter = new sn_aisearch_global.AisMigrationReverter(current.sys_id);
reverter.revertAll();
	gs.addInfoMessage(gs.getMessage('All changes reverted'));
	current.state = "CONFIGURATION_CONVERTED";
	current.update();
} catch(e) {
	gs.addErrorMessage(gs.getMessage('One or more errors encountered. Check the migration logs'));
}
gs.action.setRedirectURL(url);
