(function executeRule(current, previous /*null when async*/ ) {
    var commType = current.getValue("channel_type");
    var sysId = current.getUniqueValue();
    var commConfigGr = new GlideRecord("on_call_communication_channel_config");
    if (!gs.nil(sysId)) commConfigGr.addQuery("sys_id", "!=", sysId);
    commConfigGr.addActiveQuery();
    commConfigGr.addQuery("channel_type", commType);
    commConfigGr.addQuery("channel_default", true);
    commConfigGr.setLimit(1);
    commConfigGr.query();
    if (!commConfigGr.next()) {
        gs.addErrorMessage(
            gs.getMessage("There has to be one default configuration per channel type.")
        );
        gs.setRedirect(gs.getProperty('glide.servlet.uri') + '/nav_to.do?uri=' + current.getTableName() + '.do?sys_id=' + current.getUniqueValue());
        current.setValue("channel_default", true);
        current.setAbortAction(true);
    }

})(current, previous);
