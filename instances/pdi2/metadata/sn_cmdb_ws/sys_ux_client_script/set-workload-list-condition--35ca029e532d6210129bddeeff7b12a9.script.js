/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {
        hasDataManagerAdminOrAdminOrMaint
    } = imports["sn_cmdb_ws.userRoleUtils"]();

    let isAdmin = hasDataManagerAdminOrAdminOrMaint(api.context.session.user.roles);  
    api.setState('isDMAdmin', isAdmin);
    let groupBaseCondition = 'chart.sub_category=cert_dashboard_user_group_workload^state=2';
    let userBaseCondition = 'chart.sub_category=cert_dashboard_user_workload^state=2';
    let groupDynamicCondition = 'user_groupDYNAMICd6435e965f510100a9ad2572f2b47744^ORuser_group.managerDYNAMIC90d1921e5f510100a9ad2572f2b477fe';
    let userDynamicCondition = 'user.managerDYNAMIC90d1921e5f510100a9ad2572f2b477fe^ORuserDYNAMIC90d1921e5f510100a9ad2572f2b477fe';
    if (isAdmin) {
        api.setState('groupWorkloadQuery', groupBaseCondition);
        api.setState('userWorkloadQuery', userBaseCondition);
    } else {
        api.setState('groupWorkloadQuery', groupBaseCondition + '^' + groupDynamicCondition);
        api.setState('userWorkloadQuery', userBaseCondition + '^' + userDynamicCondition);
    }
}
