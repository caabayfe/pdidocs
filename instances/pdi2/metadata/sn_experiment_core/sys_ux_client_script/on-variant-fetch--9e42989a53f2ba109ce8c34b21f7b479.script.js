/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const output = api.data.look_up_variant_records.results;
    const stackInfo = [...api.state.stackInfo];
    let selectedVariant = '';
    
    const variants = output.map(variant => {
        if(variant.default_variant.value) {
            stackInfo.push({
                "label": "Default variant",
                "value": {
                    "type": "string",
                    "value": variant.name.displayValue,
                }
            });

            selectedVariant = variant.name.value;
        }
        
        return {
            id: variant.name.value,
            label: variant.name.displayValue + (variant.default_variant.value ? ` (Default)` : ''),
            checked: variant.default_variant.value
        };
    });


    api.setState('variants', variants);
    api.setState('stackInfo', stackInfo);
    api.setState('selectedVariant', selectedVariant);
}
