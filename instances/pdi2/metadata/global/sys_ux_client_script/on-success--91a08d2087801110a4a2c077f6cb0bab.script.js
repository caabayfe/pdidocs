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
    if (event.payload.data.output) {
        if (!api.state.active) {
            helpers.modal.open('custom_1', {});
            api.setState('hideModal', false);
        } else {
            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                items: [{
                    id: 'Disable IAR Alert',
                    status: 'info',
                    icon: 'info-circle-outline',
                    content: 'Issue Auto Resolution has been disabled for ' + api.data.gliderecord_query.output.data.GlideRecord_Query.sys_cs_auto_resolution_configuration._results[0].target_table_name.displayValue,
                    action: {
                        type: 'dismiss'
                    }
                }]
            });
            api.setState('hideModal', true);
        }
        api.setState('active', !api.state.active);
    } else {
        var errorMessage = '<p>Enabling Issue Auto Resolution configuration failed. Review the following pre-requisites and try again.<br/><br/>- At least one language configuration needs to be set active in Machine Learning Model section.</p>';
        if(api.state.result.isHRTable)
            errorMessage = '<p>Enabling Issue Auto Resolution configuration failed. Review the following pre-requisites and try again.<br/><br/>- At least one language configuration needs to be set active in Machine Learning Model section.<br/>- AI Search needs to be enabled.</p>';
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'iar_error_alert',
                status: 'critical',
                icon: 'circle-close-fill',
                content: {
                    type: "html",
                    value: errorMessage
                },
                action: {
                    type: 'dismiss',
                }
            }]
        });
    }
}
