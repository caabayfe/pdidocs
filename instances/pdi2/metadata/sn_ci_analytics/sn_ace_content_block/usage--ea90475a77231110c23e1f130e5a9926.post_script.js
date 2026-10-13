(function(context, pageParams) {
    context.props_details.nav_payload = {
        route: 'usage',
        params: {
            aceNav: 'usage',
            startDate: pageParams.params.startDate,
            endDate: pageParams.params.endDate,
            timestamp: Date.now(),
        }
    };
})(context, pageParams);
