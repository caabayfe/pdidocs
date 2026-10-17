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

    const tableName = customExpProps.previewFields[0].value["append-to-payload"].table;
    const sysId = customExpProps.previewFields[0].value["append-to-payload"].sys_id;

    if (sysId)
    {
        api.setState('sysId', sysId);
    }

    api.setState('table', tableName);


    let previewFields = [];
    let contextTable = '';
    let description = '';
    let closeNotes = '';
    let state='';
    // Extract preview fields and context table.
    // Preview fields decide which fields to show in the card.
    Object.keys(customExpProps.previewFields).forEach(function(key, index) {
        if (customExpProps.previewFields[key].name == "context_task.sys_class_name") { // don't show Context table name on guidance.
            contextTable = customExpProps.previewFields[key].value.value;
            api.setState('taskTable', contextTable);
        }
        else if (customExpProps.previewFields[key].name == "incident.state" ) {
             state = customExpProps.previewFields[key].value.internal_value;
             api.setState('state', state);
             return;
        }
        else if (customExpProps.previewFields[key].name == "incident.description" ) {
            description = customExpProps.previewFields[key].value.value;
            return;
        }
        else if (customExpProps.previewFields[key].name == "incident.close_notes") {
            closeNotes=customExpProps.previewFields[key].value.value;
            return;
        }
        else {
            previewFields.push(customExpProps.previewFields[key]);
        }
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

    const line1 = previewFields;
    api.setState('line1', line1);
    const line2 = [];
    const line2Value = {};
    line2Value.value = {};
    if (contextTable == "Incident" && (state == '6' || state == '7') && closeNotes != undefined) {
            line2Value.value.type = "string";
            line2Value.value.value = closeNotes;
            line2[0] = line2Value;
        }
    else if (description != undefined){
            line2Value.value.type = "string";
            line2Value.value.value = description;
            line2[0] = line2Value;
        }

    api.setState('line2', line2);

}
