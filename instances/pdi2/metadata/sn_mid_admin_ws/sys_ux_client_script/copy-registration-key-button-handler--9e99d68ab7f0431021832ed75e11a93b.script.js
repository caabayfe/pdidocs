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
    const regKeyPlain = api.state.regKeyPlain;
    helpers.writeText(regKeyPlain);
    const copiedMessage = await helpers.translate('mid_setup_copied_to_clipboard', 'Copied to clipboard');
    api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
        items: [{
            id: 'copy_success',
            status: 'positive',
            icon: 'circle-check-outline',
            content: {
                type: 'string',
                value: copiedMessage
            },
            action: {
                type: 'dismiss'
            }
        }]
    });
}
