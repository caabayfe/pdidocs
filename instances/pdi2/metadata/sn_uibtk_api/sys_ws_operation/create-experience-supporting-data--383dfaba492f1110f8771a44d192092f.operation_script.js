(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    const apiHelper = new APIHelper(request, response);
    apiHelper.execute(function() {
        // Hard coded app shell sys_ids: workspace , breadcrump app shell, portal, uxrBase
        const appShellUIQuery = 'category=chrome^sys_created_by!=admin^sys_created_by!=maint^sys_created_by!=tectonic^sys_created_byNOT LIKE@snc^NQsys_idINc276387cc331101080d6d3658940ddd2,e341e22cc32e2010ea04a5a1d840dd02,1e3d29d9ff9c321033b2ffffffffffa2,76a83a645b122010b913030a1d81c780';
        const appShellUIGR = new Macroponent().getRecordsByQuery(appShellUIQuery, 'name', true);
        const appShellUIs = [];
        while (appShellUIGR.next()) {
            appShellUIs.push({
                label: appShellUIGR.getValue('name'),
                id: appShellUIGR.getUniqueValue()
            });
        }

        const instanceNameGR = new GlideRecord('sys_properties');
        instanceNameGR.get('name', 'instance_name');

        const instanceRoles = [];
        const instanceRolesGR = new GlideRecord('sys_user_role');
        instanceRolesGR.orderBy('name');
        instanceRolesGR.query();
        while (instanceRolesGR.next()) {
            instanceRoles.push({
                label: instanceRolesGR.getValue('name'),
                id: instanceRolesGR.getUniqueValue()
            });
        }

        apiHelper.getResponse({
            appShells: appShellUIs,
            instanceName: instanceNameGR.getValue('value'),
            roles: instanceRoles
        }, BuilderToolkitConstants.ERRORS.A_ERROR_HAS_OCCURED);
    });

})(request, response);
