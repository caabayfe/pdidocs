(function(context, pageParams) {
    var params = JSON.parse(JSON.stringify(pageParams.params));
    params.aceNav = 'nlu-prediction';
    params.timestamp = Date.now();
    context.props_details.nav_payload = {
        route: 'nlu-prediction',
        params: params,
    };
})(context, pageParams);
