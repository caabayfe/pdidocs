(function(context, pageParams) {
    context.props_details.nav_payload = {
        route: 'topic-details',
        params: {
            startDate: pageParams && pageParams.params && pageParams.params.startDate,
            endDate: pageParams && pageParams.params && pageParams.params.endDate,
        }
    };
})(context, pageParams);
