/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    //validate IP address
    const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    const ipv6Pattern = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

    const {
        fieldPayload
    } = api.state;
    var value = event.name === "NOW_INPUT#INPUT" ? event.payload.fieldValue : event.payload.value;

    if(fieldPayload.mandatory && (value == null || value == '')) {
        api.setState("invalidIpAlert", [{"content" : await helpers.translate("{0} is a mandatory field and must be poulated", [fieldPayload.label]), "status":"critical" }]);
        api.setState("invalid", true);
    } else {
        if (!ipv4Pattern.test(value) && !ipv6Pattern.test(value)) {
            api.setState("invalid", true);
            var alertContent = await helpers.translate("{0} is not a valid IP address", [value]);
            api.setState("invalidIpAlert", [{"content" : alertContent, "status":"critical" }]);
            value = null;
        } else {
            api.setState("invalidIpAlert", []);
            api.setState("invalid", false);
        } 
    }    
    
    var emitObj = {
        "field" : fieldPayload.element,
        "value" : value
    };

    api.emit("MCC_FIELD_UPDATED", emitObj);
}
