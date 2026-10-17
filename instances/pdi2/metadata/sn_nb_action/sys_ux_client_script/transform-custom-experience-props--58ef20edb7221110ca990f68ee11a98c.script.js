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
    const {
        customExpProps
    } = event.payload;

    api.setState('customExpProps', customExpProps);
    

    // Unwrap previewFields
    let previewFields = {};

    Object.keys(customExpProps.previewFields).forEach(function(key, index) {
        previewFields[customExpProps.previewFields[key].label] = customExpProps.previewFields[key].value.value;
    });

    const cardHeading = {
        label: customExpProps.name
    };
    

    api.setState('heading', ({
        currentValue
    }) => ({
        ...currentValue,
        ...cardHeading
    }));

    const line1 = Object.keys(previewFields)
    .filter(k => customExpProps['name'] != previewFields[k])
    .map(k => {
        return {
            label: k,
            value: {
                type: 'string',
                value: previewFields[k]
            }
        };
    });
    api.setState('line1', line1);

}
