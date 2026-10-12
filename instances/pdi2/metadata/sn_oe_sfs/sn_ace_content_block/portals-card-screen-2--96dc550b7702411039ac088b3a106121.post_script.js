(function(context) {

    var gr = new GlideRecord('sp_agent_chat_config');
    gr.addActiveQuery();
    gr.query();
    var portalIds = [];
    var portals = [];
    while (gr.next()) {
        if (gr.getValue('portal')) {
            gr.getValue('portal').split(",").forEach(function(portalId) {
                if (portalIds.indexOf(portalId) == -1) {
                    portalIds.push(portalId);
                    var portalGR = new GlideRecord('sp_portal');
                    portalGR.get(portalId);
                    var urlSuffix = portalGR.getDisplayValue("url_suffix");
                    portals.push({
                        "id": urlSuffix,
                        "label": portalGR.getDisplayValue("title"),
                        "link": "/" + urlSuffix
                    });
                }
            });
        }
    }
    context.splitButtonActionData = {
        "label": gs.getMessage("Open portal"),
        "link": "",
        "items": portals
    };
	context.props_details.image = '/images/ci_landingexp_portals.png';
	return context;
})(context);
