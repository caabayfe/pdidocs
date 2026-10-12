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
    let {textToCopy, copySuccessMessage, failureMessage, alertMessageDuration} = api.context.props.payload;
    
    try {
        const status = await helpers.writeText(textToCopy);
        const message = await helpers.translate(copySuccessMessage || 'Text copied to clipboard');
        api.emit('COPY_ACTION_DONE', {
            items: [{
                'type': 'info',
                'message': message
            }]
        });
    } catch (error) {
        const message = await helpers.translate(failureMessage || 'Failed to copy text');
        api.emit('COPY_ACTION_DONE', {
            items: [{
                'type': 'error',
                'message': message
            }]
        });
        console.error('Copy Text To Clipboard', error);
    }
    if (isNaN(alertMessageDuration)) {
        return;
    }
    helpers.timing.setTimeout(()=>{
        api.emit('REMOVE_ALERT');
    }, alertMessageDuration);
}
