(function(context) {
    context.title = gs.getMessage('Automate');
    context.subtitle = gs.getMessage('Set up Issue Auto Resolution ');
    context.props_details.description = GlidePluginManager.isActive('com.glide.cs.auto_resolution') ? gs.getMessage('With Issue Auto Resolution (IAR), your bot will proactively reach out to and engage with your users to intelligently resolve their support requests.') : gs.getMessage("Issue Auto Resolution (IAR) allows a bot to initiate a conversation with a user after they submit a request through a non-conversational channel (like email or a portal).");
    context.props_details.image = '/images/ci_landingexp_iar.png';

})(context);
