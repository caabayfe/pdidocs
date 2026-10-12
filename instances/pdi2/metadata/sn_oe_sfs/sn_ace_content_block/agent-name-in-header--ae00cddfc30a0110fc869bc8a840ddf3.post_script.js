(function(context, pageParams) {
    var record = new sn_oe_sfs.CIUtil().getChatSetUpRecord();
    context.props_details.record = record;
    var chatSetupGr = new GlideRecord('sys_cs_live_agent_setup');
    if (chatSetupGr.get(record)) {
        var shouldShowAgentDetails = (chatSetupGr.getValue('show_agent_details') == "1");
        if (!shouldShowAgentDetails) {
            context.props_details.disabled = true;
        }
    }
})(context, pageParams);
