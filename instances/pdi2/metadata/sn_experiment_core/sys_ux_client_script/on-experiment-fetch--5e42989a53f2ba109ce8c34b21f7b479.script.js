/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const [ data ] = api.data.look_up_experiment_record.results;

    api.setState('stackInfo', [
        {
            "label": "Category",
            "value": {
                "type": "string",
                "value": data.category.displayValue,
            }
        },
        {
            "label": "Key",
            "value": {
                "type": "string",
                "value": data.key.displayValue
            }
        },
        // {
        //     "label": "Description",
        //     "value": {
        //         "type": "string",
        //         "value": data.description.displayValue
        //     }
        // },
        {
            "label": "Start time",
            "value": {
                "type": "string",
                "value": data.start_time.displayValue
            }
        },
    ]);

    api.setState('experimentKey', data.key.displayValue);
}
