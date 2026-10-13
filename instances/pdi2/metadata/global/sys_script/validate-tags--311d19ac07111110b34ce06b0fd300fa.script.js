(function executeRule(current, previous /*null when async*/ ) {
    // These validation are done before inserting new tags when created from event rules or event field mapping.
    // The conditions are checked again in this BR is case of manual insert or update to em_alert_tags.

	gs.include('EvtMgmtAlertTagsUtil'); 
    if (!current) return;
	
	if(current.tag_name == previous.tag_name) return;

    var evtMgmtAlertTagsUtil = new global.EvtMgmtAlertTagsUtil();

    // Do not allow changes in em_alert_tags table if 'evt_mgmt.alert_tags_state' property value is false
    if (!evtMgmtAlertTagsUtil.canUseEmAlertTagsTable()) {
        gs.addErrorMessage(gs.getMessage('Alert tags is not enabled, since the "evt_mgmt.enable_alert_tags" property value if false'));
        current.setAbortAction(true);
        return;
    }

    //Alert tag names must start with the value of evt_mgmt.alert_tags_prefix property, default is "t_".
    if (!evtMgmtAlertTagsUtil.isValidAlertTagName(current.tag_name)) {
        var alertTagsPrefix = gs.getProperty('evt_mgmt.alert_tags_prefix', 't_');
        gs.addErrorMessage(gs.getMessage('Invalid tag name. A tag name must begin with "{0}" prefix.', alertTagsPrefix));
        current.setAbortAction(true);
        return;
    }

    //Alert tag name must be unique in the table  
    if (evtMgmtAlertTagsUtil.doesAlertTagExist(current.tag_name)) {
        gs.addErrorMessage(gs.getMessage('An Alert Tag with the name {0} already exists in table.', current.tag_name));
        current.setAbortAction(true);
        return;
    }

})(current, previous);
