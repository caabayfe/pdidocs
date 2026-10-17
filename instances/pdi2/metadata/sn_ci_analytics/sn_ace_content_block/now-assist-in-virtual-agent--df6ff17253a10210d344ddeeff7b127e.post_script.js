(function(context, pageParams) {
    context.props_details.nav_payload = {
        route: 'nowassist-va-analytics',
        params: {
            startDate: pageParams.params.startDate,
            endDate: pageParams.params.endDate
        }
    };
})(context, pageParams);
