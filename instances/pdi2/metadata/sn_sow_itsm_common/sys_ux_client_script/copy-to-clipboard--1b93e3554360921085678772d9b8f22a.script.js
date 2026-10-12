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
    var clipbordUtility = imports["sn_km_uib.Article actions include"]();
    var clipboard = clipbordUtility.getClipboard();
    var trimmedMessage = clipbordUtility.getTrimmedValue((api.state.messageBody.replaceAll(/(<br ?\/?>)|(<p>)/g, '\n').replace(/(?!^)<b>/g, '\n').replace(/(<([^>]+)>)/ig, '')));
    await helpers.writeText(trimmedMessage);

     api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'rt_copy_to_clipboard_success_',
                icon: 'check-circle-outline',
                status: 'positive',
                content: await helpers.translate('Copied to clipboard'),
                action: {
                    type: 'dismiss'
                }
            }]
        });

}
