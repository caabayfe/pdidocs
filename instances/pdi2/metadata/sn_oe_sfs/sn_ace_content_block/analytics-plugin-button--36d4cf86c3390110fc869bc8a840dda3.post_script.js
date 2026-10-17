(function(context) {
    if (CIPlugin.VAAnalytics().isActive()) {
        context.title = gs.getMessage('Go to app');
        context.props_details.link = '/now/conversation/settings/overview';
        context.props_details.variant = 'secondary';
        context.props_details.icon = 'open-link-right-fill';

    } else {
        context.title = gs.getMessage('Get this plugin');
        context.props_details.link = 'https://store.servicenow.com/sn_appstore_store.do#!/store/application/c53ca02a73c310108564b17afef6a7c0/';
        context.props_details.variant = 'primary';
        context.props_details.icon = 'open-link-right-fill';
    }
    context.props_details.action_type = 'link';
    context.props_details.key = 'DEFLECTION_METRICS_VA_ANALYTICS';

})(context);
