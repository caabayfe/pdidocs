(function(context, pageParams) {
    var params = JSON.parse(JSON.stringify(pageParams.params));
    params.aceNav = 'funnels';
    params.timestamp = Date.now();
    context.props_details.nav_payload = {
        route: 'funnels',
        params: params,
    };
})(context, pageParams);
