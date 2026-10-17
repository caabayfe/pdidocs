/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const {
        fieldPayload
    } = api.state;
    var value = event.name === "NOW_INPUT#INPUT" ? event.payload.fieldValue : event.payload.value;

    var regex = /^-?\d+$/; //int regex
    var alertContent = "";
    if (fieldPayload.mandatory && (value == null || value == '')) {
        alertContent = await helpers.translate("{0} is a mandatory field and must be populated", [fieldPayload.label]);
    } else {
        if (fieldPayload.type == "integer") {
            alertContent = await helpers.translate("Could not parse {0} as an integer", [value]);
        } else if (fieldPayload.type == "decimal" || fieldPayload.type == "float") {
            regex = /^-?\d*\.?\d+$/; //double regex
            alertContent = await helpers.translate("Could not parse {0} as a {1}", [value, fieldPayload.type]);
        }
    }
    
    var invalidAlert = [];
    var invalid = false;
    if(!regex.test(value)) {
        invalid = true;
        invalidAlert = [{"content" : alertContent, "status":"critical" }];
        value = null;
    }
    api.setState("invalidIntAlert", invalidAlert);
    api.setState("invalid", invalid);

    var emitObj = {
        "field" : fieldPayload.element,
        "value" : value
    };

    api.emit("MCC_FIELD_UPDATED", emitObj);
}
