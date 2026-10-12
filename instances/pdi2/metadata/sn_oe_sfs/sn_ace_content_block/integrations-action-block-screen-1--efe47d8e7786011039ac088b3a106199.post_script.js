(function(context) {
    var isBotAssociatedGr = new GlideAggregate('sys_cs_provider_application');
    isBotAssociatedGr.addAggregate('COUNT');
    isBotAssociatedGr.query();
    if (isBotAssociatedGr.next())
        context.title = isBotAssociatedGr.getAggregate('COUNT') > 0 ? gs.getMessage('View channel settings') : gs.getMessage('Set up VA channels');
    context.props_details.key = 'MANAGE_YOUR_BOT';
    context.props_details.aria = {"button":{"aria-label":"Manage your channels, Opens in new window"}};
})(context);
