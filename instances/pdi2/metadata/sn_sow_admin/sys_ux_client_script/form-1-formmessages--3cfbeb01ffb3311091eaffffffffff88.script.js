/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let formMessages = [];
    if (api.data.gform.nowRecordFormBlob && api.data.gform.nowRecordFormBlob.formMessages) {
        formMessages = api.data.gform.nowRecordFormBlob.formMessages;
        formMessages.map(function(message) {
            if (message.buttons) {
                delete message.buttons;
            }
            return message;
        });
    }
    return formMessages;
}
