/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const FORM_ICONS = {
        LOCKED : {
            "statuses": [
                {
                    "type": "icon",
                    "icon": "lock-outline"
                }
            ],
            "disabled": true
        }, 
        EDITING : { 
            "statuses": [
                {
                    "type": "icon",
                    "icon": "circle-semi-check-outline"
                }
            ],
            "disabled": false
        }, 
        DONE: {
            "statuses": [
                {
                    "type": "icon",
                    "icon": "circle-check-outline"
                }
            ],
            "disabled": false
        }
    };    
}
