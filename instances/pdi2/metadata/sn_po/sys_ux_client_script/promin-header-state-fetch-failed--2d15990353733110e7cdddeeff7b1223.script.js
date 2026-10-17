/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const {
        data,
        errors
    } = api.data.fetch_promin_header_state_1.output;
    api.setState('versionLoading', false);

    if (errors && errors.length > 0 && errors[0].errorType == "PROJECT_RESTRICTED_ERROR") {
        api.setState('page_empty_state', {
            errorType: await helpers.translate("Project access is restricted"),
            message: await helpers.translate("Contact {0} to get access", errors[0].message),
            illustration: 'permissions'
        });
        api.emit('SCREEN_STATUS_CHANGED', {
            title: await helpers.translate('Error'),
        });
        return;
    }
    if (!data.GlidePromin_Query.version) {
        // don't show open latest version navigation button
        api.setState('page_empty_state', {
            errorType: await helpers.translate("Project version unavailable"),
            message: await helpers.translate("The version you’re trying to access can’t be opened."),
            illustration: 'error'
        });
        return;
    }
    if (errors && errors.length > 0) {
        api.setState('page_empty_state', {
            errorType: errors[0].errorType,
            message: errors[0].message,
            illustration: 'error'
        });
        api.emit('SCREEN_STATUS_CHANGED', {
            title: await helpers.translate('Error'),
        });
    }
}
