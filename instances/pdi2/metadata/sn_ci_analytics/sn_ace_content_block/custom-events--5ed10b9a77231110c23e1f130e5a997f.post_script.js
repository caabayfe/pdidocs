(function(context, pageParams) {
    var params = JSON.parse(JSON.stringify(pageParams.params));
    params.aceNav = 'custom-events';
    params.timestamp = Date.now();
    context.props_details.nav_payload = {
        route: 'custom-events',
        params: params,
    };
})(context, pageParams);
