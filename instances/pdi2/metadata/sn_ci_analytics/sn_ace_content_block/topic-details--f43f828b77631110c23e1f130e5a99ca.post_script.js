(function(context, pageParams) {
    var params = JSON.parse(JSON.stringify(pageParams.params));
    params.aceNav = 'topic-details';
    params.timestamp = Date.now();
    context.props_details.nav_payload = {
        route: 'topic-details',
        params: params,
    };
})(context, pageParams);
