(function overrideView(view, is_list) {

    answer = view;
    if (is_list) {
        var session = gs.getSession();
        if (session.getClientData('canRouteToEMS') === null)
            session.putClientData('canRouteToEMS', SNC.UsageAnalyticsScriptUtils.canRouteToEMS());

        var canRouteToEMS = session.getClientData('canRouteToEMS');
        if (canRouteToEMS == 'true')
            answer = 'subscription_entitlement';

        var uri = gs.action.getGlideURI();
        var sysParamView = uri.get('sysparm_view');
        if (sysParamView == "")
            answer = view;
    }

})(view, is_list);
