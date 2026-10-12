var utils = new sn_aisearch_global.AISMigrationUtils();

var url = current.getTableName() + '.do?sys_id=' + current.sys_id.toString() + '&sysparm_view=default';

if (utils.isAnyChangeNeedsReview(current.sys_id)) {
    gs.addErrorMessage(gs.getMessage('One or more migrated records need to be reviewed. Please go to the related list and accept or reject the changes'));

    gs.action.setRedirectURL(url);
} else {
    try {
        var committer = new sn_aisearch_global.AisMigrationCommitter(current.sys_id);
        committer.commitAll();
        gs.addInfoMessage(gs.getMessage('All changes committed'));
        current.state = "CONFIGURATION_COMMITTED";
        current.update();
    } catch (e) {
		gs.error(e);
        gs.addErrorMessage(gs.getMessage('One or more errors encountered. Check the migration logs'));
    }
    gs.action.setRedirectURL(url);
}
