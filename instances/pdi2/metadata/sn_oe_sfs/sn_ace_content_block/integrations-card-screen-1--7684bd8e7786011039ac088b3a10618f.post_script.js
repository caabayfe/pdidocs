(function(context) {

    context.props_details.image = '/images/ci_landingexp_channels.png';
    var isBotAssociatedGr = new GlideAggregate('sys_cs_provider_application');
    isBotAssociatedGr.addAggregate('COUNT');
    isBotAssociatedGr.query();
    if (isBotAssociatedGr.next()) {
        if (isBotAssociatedGr.getAggregate('COUNT') > 0) {
            //Admin has added bot to a channel
            context.subtitle = gs.getMessage("Add your VA to other channels");
            context.props_details.description = gs.getMessage("Connect your Virtual Agent (VA) to other channels - Microsoft Teams, Slack, Workplace, and more-to give your users even more ways to chat.");
        } else {
            //Integrations has not been set up
            context.__is_complete = false;
			
            context.subtitle = gs.getMessage('Add your bot to other channels');
            context.props_details.description = gs.getMessage('Connect your bot to other channels — such as Microsoft Teams, Slack, Workplace and more — to enable your users to chat in more ways.');
        }
    }

})(context);
