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
    const bestPracticesCompletedHistory = '/now/security-center-monitoring/sec_center_kpi_details/3d100b0e778b31101b803a91fa5a999a';
    const activeIntegrationAccounts = '/now/security-center-monitoring/identity-center-details/c3d0ecd820485910f877de4b9ee9cc26/sys_user/Active%20integration%20accounts/internal_integration_user%253Dfalse%255EORinternal_integration_userISEMPTY%255Eweb_service_access_only%253Dtrue%255Eactive%253Dtrue/ORDERBYDESCsys_created_on/user_name%2Cname%2Cemail%2Cactive%2Csys_created_on%2Csys_updated_on';
    const activePrivilegedAccount = '/now/security-center-monitoring/identity-center-details/f6476f276bb01110638c83eece44afec/sn_vsc_icenter_privileged_users_details/Active%20privileged%20users/usr_active%253Dtrue/ORDERBYDESCusr_name/usr_user_name%2Cusr_name%2Cuserrole_role%2Cusr_email%2Cusr_active%2Cusr_sys_created_on%2Cusr_sys_updated_on';
    const neverLoggedInUsers = '/now/security-center-monitoring/identity-center-details/6f068c1020085910f877de4b9ee9cc94/sys_user/Users%20never%20logged%20in/last_login_timeISEMPTY%255Esys_created_on%253Cjavascript%253Ags.beginningOfLast30Days()%255Eactive%253Dtrue/ORDERBYDESCsys_created_on/user_name%2Cname%2Cemail%2Cactive%2Csys_created_on%2Csys_updated_on';
    if (event.payload != undefined) {
        var indicatorId = event.payload.params.indicatorSysid;
        if (indicatorId == "3d100b0e778b31101b803a91fa5a999a") {
            navItemSelected(bestPracticesCompletedHistory);
        } else if (indicatorId == "c3d0ecd820485910f877de4b9ee9cc26") {
            navItemSelected(activeIntegrationAccounts);
        } else if (indicatorId == "f6476f276bb01110638c83eece44afec") {
            navItemSelected(activePrivilegedAccount);
        } else if (indicatorId == "6f068c1020085910f877de4b9ee9cc94") {
            navItemSelected(neverLoggedInUsers);
        }
    }

    function navItemSelected(targetUrl) {
        api.emit('NAV_ITEM_SELECTED', {
            external: {
                url: targetUrl,
                "target": "_self"
            }
        });
    }
}
