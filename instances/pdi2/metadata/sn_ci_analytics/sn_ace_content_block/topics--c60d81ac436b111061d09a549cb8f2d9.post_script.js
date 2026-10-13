(function(context, pageParams) {
    var params = JSON.parse(JSON.stringify(pageParams.params));
    params.aceNav = 'topics';
    params.timestamp = Date.now(),
        context.props_details.nav_payload = {
            route: 'topics',
            params: params,
        };
})(context, pageParams);
