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
    const { payload: { table: tableName = '' } = { } } = event;

    try {
        const message = await helpers.translate(
            '<b>Open List</b> The selected {0} list will be displayed to the user.', 
            tableName.replace(/[^\w. ]/gi, c => ('&#' + c.charCodeAt(0) + ';'))
        );
        
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                type: 'html',
                message: message
            }]
        });
    } catch (err) {
        console.error(err);
    }
}
