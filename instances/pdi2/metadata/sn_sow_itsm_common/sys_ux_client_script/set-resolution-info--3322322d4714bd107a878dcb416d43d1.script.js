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
        output
    } = api.data.get_resolution_details;
    const fieldMap = { ...api.state.fieldMap
    };
    if (!output) {
        api.setState('fields', fieldMap);
        return;
    }
    const {
        capabilities,
        status
    } = output;

    const resolutionConfig = { ...api.state.resolutionConfig
    };
    if (resolutionConfig && resolutionConfig.capability && status === 'completed') {
        const capability = capabilities[resolutionConfig.capability];
        if (capability.status === 'success') {
            const response = JSON.parse(capability.response);
            var message = await helpers.translate('Field filled by Now Assist');
            if (resolutionConfig.fields) {
                if (resolutionConfig.fields.close_notes && response.close_notes && ('close_notes' in fieldMap) && !fieldMap['close_notes'].value) {
                    fieldMap['close_notes'].value = response.close_notes;
                    fieldMap['close_notes'].displayValue = response.close_notes;
                    fieldMap['close_notes'].messages = [{
                        'message': message,
                        'type': 'info'
                    }];
                }
                if (resolutionConfig.fields.close_code && response.close_code && ('close_code' in fieldMap) && !fieldMap['close_code'].value) {
                    fieldMap['close_code'].value = response.close_code;
                    fieldMap['close_code'].displayValue = response.close_code;
                    fieldMap['close_code'].messages = [{
                        'message': message,
                        'type': 'info'
                    }];
                }
            }
        }
    }

    api.setState('fields', fieldMap);
}
