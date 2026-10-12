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

    const {
        checkValidation
    } = imports["sn_app_ux_commons.EventRecurrenceUtils"]({
        api,
        helpers
    });

    const type = event.payload.action.type;

    if (type === 'dismiss') {
        const targetKey = event.context.item.value.key;
        const newValiadtionMessages = api.state.validationMessages.filter(message => message.key !== targetKey);
        api.setState('validationMessages', [...newValiadtionMessages]);

        const validationError = {
            event: api.state.eventValidationError,
            skipDates: api.state.skipDateValidationError,
            exceptions: api.state.exceptionValidationError
        };

        const isValid = checkValidation(validationError, newValiadtionMessages);
        api.setState('disableSaveBtn', !isValid);
    }
}
