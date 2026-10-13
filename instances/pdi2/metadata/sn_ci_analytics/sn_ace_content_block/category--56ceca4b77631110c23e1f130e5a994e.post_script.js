(function(context, pageParams) {
    var params = JSON.parse(JSON.stringify(pageParams.params));
    params.aceNav = 'category';
    params.timestamp = Date.now();
    context.props_details.nav_payload = {
        route: 'category',
        params: params,
    };
})(context, pageParams);
