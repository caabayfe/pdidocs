(function(context) {
    if (GlidePluginManager.isActive('com.glide.cs.chatbot') && GlidePluginManager.isActive('sn_ci_analytics')) {
        //context.props_details.link = '/now/conversation/settings/overview';
    } else {
        context.props_details.disabled = true;
    }

})(context);
