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
    var props = api.data.cross_scope.output;
    var {
        is_scope_not_matched,
        user_scope,
        record_scope,
        record_scope_name,
        user_scope_name
    } = props;
    var table = "ssa_deflection_configuration";
    var sysId = api.context.props.deflectionconfigurationId;
    var record_scope_navigation_link = ((record_scope).toLowerCase() == 'global') ? `/sys_scope.do?sys_id=${record_scope}` : `/sys_store_app.do?sys_id=${record_scope}`;
    var user_scope_navigation_link = ((user_scope).toLowerCase() == 'global') ? `/sys_scope.do?sys_id=${user_scope}` : `/sys_store_app.do?sys_id=${user_scope}`;
    var clickHereLink = `/${table}.do?sys_id=${sysId}&sysparm_record_scope=${record_scope}&sysparm_record_target=${table}&sysparm_view=ci_admin_console`;
    if (is_scope_not_matched && record_scope && user_scope && record_scope_name && user_scope_name) {
        helpers.translate('here').then((translatedHere) => {
            const recScopeAncor = `<a href=${record_scope_navigation_link} target="_blank" style="color:RGB(1,89,107)">${record_scope_name}</a>`;
            const userScopeAncor = `<a href=${user_scope_navigation_link} target="_blank" style="color:RGB(1,89,107)">${user_scope_name}</a>`;
            const currentAncor = `<a href=${clickHereLink} target="_blank" style="color:RGB(1,89,107)">${translatedHere}</a>`;
            helpers.translate('The record is in {0} but {1}  is the current application. To edit this record click {2}', recScopeAncor, userScopeAncor, currentAncor)
                .then((translatedHTML) => {
                    api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                        items: [{
                            id: 'cross_scope_alert',
                            status: 'warning',
                            icon: 'info',
                            content: {
                                type: "html",
                                value: '<p>' + translatedHTML + '</p>'
                            }
                        }]
                    });
                });
        });
        api.setState("disable_save", true);
    }
}
