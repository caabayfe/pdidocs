(function(context) {
    var gr = new GlideRecord('sp_agent_chat_config');
    gr.addActiveQuery();
    gr.query();
    var portalConfigs = [];
    while (gr.next()) {
        var portalConfigId = gr.getDisplayValue("sys_id");
        portalConfigs.push({
            id: portalConfigId,
            label: gr.getDisplayValue("name"),
            event_name: 'VA_PORTAL_RECORD_LINK_CLICK',
            link: "/sp_agent_chat_config.do?sys_id=" + portalConfigId,
            external: true
        });
    }
    context.splitButtonActionData = {
        "label": gs.getMessage("Add to portal"),
        "link": "/sp_agent_chat_config.do?sys_id=-1",
        "external": true,
        "items": portalConfigs
    };
	context.props_details.image = '/images/ci_landingexp_portals.png';
	return context;
})(context);
