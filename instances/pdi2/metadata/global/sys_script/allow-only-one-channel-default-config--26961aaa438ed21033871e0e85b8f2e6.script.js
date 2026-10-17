(function executeRule(current, previous /*null when async*/ ) {
    var commType = current.getValue("channel_type");
    var sysId = current.getUniqueValue();
    var commConfigGr = new GlideRecord("on_call_communication_channel_config");
    if (!gs.nil(sysId)) commConfigGr.addQuery("sys_id", "!=", sysId);
    commConfigGr.addActiveQuery();
    commConfigGr.addQuery("sys_domain", gs.getUser().getDomainID() || "global");
    commConfigGr.addQuery("channel_type", commType);
    commConfigGr.addQuery("channel_default", true);
    commConfigGr.setLimit(1);
    commConfigGr.query();
    if (commConfigGr.next()) {
        var defaultConfigUrl = "<a href='/nav_to.do?uri=on_call_communication_channel_config.do?sys_id=" + commConfigGr.getUniqueValue() + "'>";
        gs.addInfoMessage(
            gs.getMessage("There can be only one default configuration per channel type. You can view the current default configuration {0} here {1}.",
                ["<a href='/nav_to.do?uri=on_call_communication_channel_config.do?sys_id=" + commConfigGr.getUniqueValue() + "'>", "</a>"])
        );
        gs.setRedirect(gs.getProperty('glide.servlet.uri') + '/nav_to.do?uri=' + current.getTableName() + '.do?sys_id=' + current.getUniqueValue());
        current.setValue("channel_default", false);
        current.setAbortAction(true);
    }
})(current, previous);
