
			/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const iconVal = event.payload.value;

    if (iconVal.sysId) {
        api.setState('componentImageIcon', iconVal);
        return;
    }

    if (iconVal) {
        api.setState('componentIcon', iconVal);
        api.setState('componentImageIcon', null);
    }
}
