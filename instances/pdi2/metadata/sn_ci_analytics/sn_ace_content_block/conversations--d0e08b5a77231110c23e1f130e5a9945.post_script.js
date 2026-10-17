(function(context, pageParams) {
    context.props_details.nav_payload = {
        route: 'conversations',
        params: {
            aceNav: 'conversations',
            startDate: pageParams.params.startDate,
            endDate: pageParams.params.endDate,
            timestamp: Date.now(),
        }
    };
})(context, pageParams);
