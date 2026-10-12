/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    //This script is to handle all redirection logic from reference links on tabs on the Issues tab
    const issuesTabID = api.state.issuesTabID;
    const tableName = event.payload.recordTable;
    const sysID = event.payload.sys_id;
    switch (issuesTabID) {
        case 't0':
            unconfirmedUserGroupsAction(tableName, sysID);
            break;
        case 't1':
            unmappedCustomTablesAction(sysID);
            break;
        case 't2':
            unmappedCustomAppsAction(sysID);
            break;
        case 't3':
            incompatibleUsersAction(tableName, sysID);
            break;
    }

    function unconfirmedUserGroupsAction(table, sysId) {
        switch (table) {
            case 'sys_user_group':
                //redirect to group record page
                navigateToExternalUrl(tableName, sysId);
                break;
            case 'subscription_entitlement':
                //redirect to details page
                const category = 'unconfirmedusers';
                const sefieldsObj = {
                    sysId,
                    category
                };
                navigateToUrl('subscription-details', sefieldsObj);
                break;

        }
    }

    function incompatibleUsersAction(table, sysId) {
        switch (table) {
            case 'sys_user_group':
                //redirect to group record page
                navigateToExternalUrl('sys_user_group', sysId);
                break;
            case 'subscription_entitlement':
                //redirect to details page
                const category = 'incompatibleusers';
                const sefieldsObj = {
                    sysId,
                    category
                };
                navigateToUrl('subscription-details', sefieldsObj);
                break;
            case 'unallocated_user_recommendation':
                // save unallocated user recommendation record sysid to state
                api.setState('incompatibleUserSysId', sysID);
                // call glide query for to get the record with this sys id
                api.data.unallocated_user_reco_query.refresh();

                break;
        }
        return;
    }

    function unmappedCustomTablesAction(sysId) {
        //redirect to ua_custom_table_inventory record page
        const table = 'ua_custom_table_inventory';
        navigateToExternalUrl(table, sysId);
    }

    function unmappedCustomAppsAction(sysId) {
        //redirect to sys_scope record page for this app
        const table = 'sys_scope';
        const views = 'subscription';
        const params = {
            sysparm_view: views
        };
        navigateToExternalUrlWithParams(table, sysId, params);
    }

    function navigateToUrl(routeVal, fieldsObj) {
        helpers.navigate.to(routeVal, fieldsObj);
    }

    function navigateToUrlWithParam(routeVal, fieldsObj, paramsObj) {
        helpers.navigate.to(routeVal, fieldsObj, paramsObj);
    }

    //Navigate to UI16 record page
    function navigateToExternalUrl(table, sysId) {
        return navigateToExternalUrlWithParams(table, sysId, null);
    }

    //Navigate to UI16 record page with params
    function navigateToExternalUrlWithParams(table, sysId, paramsObj) {
        let url = "/now/nav/ui/classic/params/target/" + table + ".do" + encodeURIComponent("?sys_id=" + sysId);
        if (paramsObj) {
            // Iterate through the parameters object and append each parameter to the URL
            Object.keys(paramsObj).forEach(param => {
                url += '&' + param + '=' + encodeURIComponent(paramsObj[param]);
            });
        }
        api.emit('CUSTOM_REDIRECT_URL', {
            url: url
        });
    }

}
