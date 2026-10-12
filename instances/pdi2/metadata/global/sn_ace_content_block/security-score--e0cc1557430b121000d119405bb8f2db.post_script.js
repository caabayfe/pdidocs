(function(context, pageParams) {

    var miUiUtil = new MIUIUtil();

    var menu = [
        miUiUtil.createSideNavMenu({
            title: gs.getMessage('Security findings'),
            route: 'security-score'
        }),
        miUiUtil.createSideNavMenu({
            title: gs.getMessage('Basic auth accounts'),
            route: 'basic-auth',
            fields: {
                viewType: 'list'
            }
        }),
        miUiUtil.createSideNavMenu({
            title: gs.getMessage('WSA set to false'),
            route: 'wsa-false',
            fields: {
                viewType: 'list'
            }
        }),
        miUiUtil.createSideNavMenu({
            title: gs.getMessage('UI logins with integration'),
            route: 'ui-logins-with-integration',
            fields: {
                viewType: 'list'
            }
        })
    ];

    /**
     * Since need to disable only Inactive Accounts section based on settings, have added to fetch
     * only related record's active flag
     */
    var gr = new GlideRecord('sys_mi_risk_category');
    gr.addQuery('name', 'dormant');
    gr.addActiveQuery();
    gr.query();
    if (gr.next()) {
        menu.splice(1, 0, miUiUtil.createSideNavMenu({
            title: gs.getMessage('No login for 100 days'),
            route: 'inactive-accounts',
            fields: {
                viewType: 'list'
            }
        }));
    }

    context.menu = menu;
    context.title = gs.getMessage("Security findings");

})(context, pageParams);
