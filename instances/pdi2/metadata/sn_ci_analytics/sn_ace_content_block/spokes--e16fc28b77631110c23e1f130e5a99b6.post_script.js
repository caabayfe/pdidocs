(function(context, pageParams) {
    var params = JSON.parse(JSON.stringify(pageParams.params));
    params.aceNav = 'spoke';
    params.timestamp = Date.now();
    context.props_details.nav_payload = {
        route: 'spoke',
        params: params,
    };
})(context, pageParams);
