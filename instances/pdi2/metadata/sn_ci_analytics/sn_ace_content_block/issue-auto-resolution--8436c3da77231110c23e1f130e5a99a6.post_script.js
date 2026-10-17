(function(context, pageParams) {
    var params = JSON.parse(JSON.stringify(pageParams.params));
    params.aceNav = 'issue-auto-resolution';
    params.timestamp = Date.now();
    context.props_details.nav_payload = {
        route: 'issue-auto-resolution',
        params: params,
    };
})(context, pageParams);
