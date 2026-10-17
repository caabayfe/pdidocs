(function(context, pageParams) {
    context.props_details.nav_payload = {
        route: 'users',
        params: {
            aceNav: 'users',
            startDate: pageParams.params.startDate,
            endDate: pageParams.params.endDate,
            timestamp: Date.now(),
        }
    };
})(context, pageParams);
