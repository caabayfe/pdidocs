/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {

    const gFormData = api.data.gform && api.data.gform.nowRecordFormBlob;
    const {
        table,
        sysId
    } = gFormData;
    const props = api.data.page_props.output;
    const {
        is_scope_not_matched,
        user_scope,
        record_scope,
        record_scope_name,
        user_scope_name,
        canWrite,
        is_form_supported
    } = props;
    let hereLink = '';

    if (!is_form_supported) {
        api.setState('isFormSupported', false);
        hereLink = `/${table}.do?sys_id=${sysId}`;
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'cross_scope_alert',
                status: 'warning',
                icon: 'info',
                content: {
                    type: "html",
                    value: '<div>' + await helpers.translate("You can view this record but can't edit it here.") + '<a href = ${hereLink} target = "_blank">' + await helpers.translate('Edit record') + '</a></div>'
                }
            }]
        });
    } else {
        if (is_scope_not_matched && record_scope && user_scope && record_scope_name && user_scope_name && !canWrite) {
            const record_scope_navigation_link = ((record_scope).toLowerCase() == 'global') ? `/sys_scope.do?sys_id=${record_scope}` : `/sys_store_app.do?sys_id=${record_scope}`;
            const user_scope_navigation_link = ((user_scope).toLowerCase() == 'global') ? `/sys_scope.do?sys_id=${user_scope}` : `/sys_store_app.do?sys_id=${user_scope}`;
            hereLink = `/${table}.do?sys_id=${sysId}&sysparm_record_scope=${record_scope}&sysparm_record_target=${table}`;
            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                items: [{
                    id: 'cross_scope_alert',
                    status: 'warning',
                    icon: 'info',
                    content: {
                        type: "html",
                        value: `<div>This record is in 
                    <a href = ${record_scope_navigation_link} target = "_blank">${record_scope_name}</a> but 
                    <a href = ${user_scope_navigation_link} target = "_blank">${user_scope_name}</a> is the current application. 
                    To edit this record click 
                    <a href = ${hereLink} target = "_blank">here</a></div>`
                    }
                }]
            });
        }
    }
}
