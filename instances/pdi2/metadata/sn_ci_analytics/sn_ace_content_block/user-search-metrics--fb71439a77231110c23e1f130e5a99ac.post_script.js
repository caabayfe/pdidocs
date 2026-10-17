(function(context, pageParams) {
    var params = JSON.parse(JSON.stringify(pageParams.params));
    params.aceNav = 'search-metrics';
    params.timestamp = Date.now();
    context.props_details.nav_payload = {
        route: 'search-metrics',
        params: params,
    };
})(context, pageParams);
