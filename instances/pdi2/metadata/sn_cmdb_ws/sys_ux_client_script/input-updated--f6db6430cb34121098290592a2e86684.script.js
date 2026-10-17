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
    if(event.elementId === "date_picker_wrapper") {
        api.setState("dateInvalid", (event.payload.date) ? false: true);
    } 

    if(fieldPayload.mandatory && (value == null || value == '')) {
        api.setState("mandatoryFieldAlert", [{"content" : await helpers.translate("{0} is a mandatory field and must be populated", fieldPayload.label), "status":"critical" }]);
        api.setState("invalid", true);
    } else {
        api.setState("mandatoryFieldAlert", []);
        api.setState("invalid", false);
    }

    var emitObj = {
        "field" : fieldPayload.element,
        "value" : value
    };
 
    if (event.elementId === "ref_typeahead_preset" || event.elementId === "choice_select") {
        var label = event.payload.item.label;
        let invalidRefAlert = [{"content" : await helpers.translate("Invalid {0} value entered for reference field", fieldPayload.label), "status" : "critical"}];
        let invalidChoiceAlert = [{"content" : await helpers.translate("Invalid {0} value entered for choice field", fieldPayload.label), "status" : "critical"}];
        if (value == null && label != null && label != "") {
            api.setState("invalid", true);
            if (event.elementId === "ref_typeahead_preset") {
                api.setState("invalidRefAlert", invalidRefAlert);
            } else {
                api.setState("invalidRefAlert", invalidChoiceAlert);
            }
        } else if (event.elementId === "choice_select" && (value == "" || value == null)) {
            api.setState("invalidRefAlert", invalidChoiceAlert);
            api.setState("invalid", true);
            emitObj.displayValue = label;
        } else {
            api.setState("invalidRefAlert", []);
            api.setState("invalid", false);
            emitObj.displayValue = label;
        }
    }

    if((event.elementId === "date_picker_wrapper" && event.payload.date) || event.elementId != "date_picker_wrapper") {
        //only emit the event if the value is valid
        api.emit("MCC_FIELD_UPDATED", emitObj);
    }
    
}
