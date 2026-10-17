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
    var props = api.data.page_props.output;
    var {
        is_scope_not_matched,
        user_scope,
        record_scope,
        record_scope_name,
        user_scope_name
    } = props;
    var table = "sys_cs_branding_setup";
    var sysId = api.context.props.sysId;
    var record_scope_navigation_link = ((record_scope).toLowerCase() == 'global') ? `/sys_scope.do?sys_id=${record_scope}` : `/sys_store_app.do?sys_id=${record_scope}`;
    var user_scope_navigation_link = ((user_scope).toLowerCase() == 'global') ? `/sys_scope.do?sys_id=${user_scope}` : `/sys_store_app.do?sys_id=${user_scope}`;
    var clickHereLink = `/${table}.do?sys_id=${sysId}&sysparm_record_scope=${record_scope}&sysparm_record_target=${table}&sysparm_view=ci_admin_console`;
    if (is_scope_not_matched && record_scope && user_scope && record_scope_name && user_scope_name) {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'cross_scope_alert',
                status: 'warning',
                icon: 'info',
                content: {
                    type: "html",
                    value: `<p>This record is in 
                    <a href = ${record_scope_navigation_link} target = "_blank" style = "color:RGB(1,89,107)">${record_scope_name}</a> but 
                    <a href = ${user_scope_navigation_link} target = "_blank" style = "color:RGB(1,89,107)">${user_scope_name}</a> is the current application. 
                    To edit this record click 
                    <a href = ${clickHereLink} target = "_blank" style = "color:RGB(1,89,107)">here</a>
                    </p>`
                }
            }]
        });
    }
}
