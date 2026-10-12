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
    const data = api.data.ci_admin_console__translations.output;
    const isVaPluginInstalled = api.data.va_plugin_status.output.active;
    if (!isVaPluginInstalled) {
        api.setState('disableActivateandSave', true);
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'plugin_install_alert',
                status: 'info',
                icon: '',
                content: (data) ? data.upgrade_alert : 'Please upgrade to access all features. Contact your account executive for more information.',
            }]
        });
    }

}
