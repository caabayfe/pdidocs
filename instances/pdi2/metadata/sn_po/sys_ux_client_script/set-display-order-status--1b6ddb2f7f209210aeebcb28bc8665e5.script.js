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
        activityForm
    } = api.state;

    api.setState('activityForm', () => {
        return {
            ...activityForm,
            fields: {
                ...activityForm.fields,
                displayOrder: {
                    value: 50,
                    invalid: false
                }
            }
        };
    });
}
