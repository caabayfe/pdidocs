(function(context, pageParams) {
    context.props_details.nav_payload = {
        route: 'overview',
        params: {
            aceNav: 'overview',
            startDate: pageParams.params.startDate,
            endDate: pageParams.params.endDate,
            timestamp: Date.now(),
        }
    };
})(context, pageParams);
