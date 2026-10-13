(function(context, pageParams) {
    context.props_details.nav_payload = {
        route: 'issue-auto-resolution',
        params: {
            startDate: pageParams && pageParams.params && pageParams.params.startDate,
            endDate: pageParams && pageParams.params && pageParams.params.endDate,
        }
    };
})(context, pageParams);
