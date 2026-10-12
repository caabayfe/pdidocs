/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    var isAISEnabled = api.state.isAISEnabled;
    var applyAIS = api.state.applyAIS;
    var mandatoryFields = {
        'Training language': api.state.isTLEmpty,
        'Prediction fields': api.state.isPFEmpty
    };
    var emptyFields = [];
    var aisLinkText = {
    "label": await helpers.translate("request AI Search."),
    "href": "now/conversation/settings/virtual-agent"
    };

     // Throw error if not all mandatory fields are filled out
    if (mandatoryFields['Training language'] === 'true' || mandatoryFields['Prediction fields'] === 'true') {
        for (var key in mandatoryFields){
            if (mandatoryFields[key] === 'true') {
                emptyFields.push(key);
            }
        }
        helpers.translate('Please fill out the following mandatory field(s): {0}', emptyFields).then((translatedText) => {
            api.setState('errorMessage', translatedText);
        });
        api.setState('hideAlert', false);
    }

    // Throw error if no active language configuration for the IAR configuration
    else if (api.data.look_up_language_configs.results.length == 0) {
        helpers.translate('This Auto-Resolution configuration needs at least one active machine learning model for any language. Please set any language configuration record to active after successfully training the model.').then((translatedText) => {
            api.setState('errorMessage', translatedText);
        });
        api.setState('hideAlert', false);
    }

    // Throw error if at least one intent topic map is active but VA response channel is inactive
    else if (api.data.look_up_active_intents.results.length > 0 && api.data.look_up_va.results.length == 0) {
        helpers.translate('The Virtual Agent response channel must be active.').then((translatedText) => {
            api.setState('errorMessage', translatedText);
        });
        api.setState('hideAlert', false);
    }

    // Throw error if AIS is not enabled but Apply AIS is true
    else if (isAISEnabled === 'false' && applyAIS === 'true') {
        helpers.translate('AI Search is not currently configured on this instance. Submit your configuration again after you ').then((translatedText) => {
            api.setState('errorMessage', translatedText);
        });
        api.setState('aisLinkText', aisLinkText);
        api.setState('hideAlert', false);
    }

    // Throw error if Apply AIS is on but no response channels are active
    else if (applyAIS === 'true' && api.data.look_up_active_intents.results.length == 0 && api.data.look_up_response_channels.results.length == 0) {
        helpers.translate('At least one response channel must be active.').then((translatedText) => {
            api.setState('errorMessage', translatedText);
        });
        api.setState('hideAlert', false);
    }

    // All BR's have been passed so enable IAR
    else {
        helpers.modal.open('custom_1');
        api.setState('hideModal', false);
    }
}
