(function(context, pageParams) {

    var miUiUtil = new MIUIUtil();

    var menu = [
        miUiUtil.createSideNavMenu({
            title: gs.getMessage('Unique API calls'),
            route: 'metrics',
            fields: {
                page: 'unique-api-calls'
            },
            params: {
                query: 'all'
            },
            endpoint: 'metrics?page=unique-api-calls'
        }),
        miUiUtil.createSideNavMenu({
            title: gs.getMessage('Machine identity accounts'),
            route: 'metrics',
            fields: {
                page: 'mi-account-list'
            },
            endpoint: 'metrics?page=mi-account-list'
        }),
        miUiUtil.createSideNavMenu({
            title: gs.getMessage('High privilege accounts'),
            route: 'metrics',
            fields: {
                page: 'high-privilege-accounts'
            },
            params: null,
            endpoint: 'metrics?page=high-privilege-accounts'
        })
    ];

    context.menu = menu;
    context.title = gs.getMessage("Metrics");

})(context, pageParams);
