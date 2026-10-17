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
    if (event.payload.data.output.data.GlideRecord_Mutation.update_help_guidance != null) {
        api.setState('hideCongratulationsPage', false);
        api.data.get_setup_info.refresh();
    } else {
        var errorMsg = await helpers.translate('Your guided setup was created in a different scope than your current instance scope. Change your current instance scope to the scope of guided setup to continue editing it. Reach out to your admin for more help.');

        var alerts = [{
            id: "setup_scope_error_alert_1",
            status: "critical",
            icon: "exclamation-triangle-fill",
            content: errorMsg,
            action: {
                type: "dismiss"
            }
        }];

        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: alerts
        });
    }
}
