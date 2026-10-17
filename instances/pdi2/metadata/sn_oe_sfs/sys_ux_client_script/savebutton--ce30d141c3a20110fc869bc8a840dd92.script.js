/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    var recordId = api.context.props.recordId;
    var description = api.state.description;
    var value = api.state.value;

    if (value == null || value == ""){
        api.setState("emptyField",true);
    }

    else{
        const templateFields = `description=${description}^value=${value}`;

        api.data.update_record_1.execute({
            table: "sys_properties",
            recordId: recordId,
            templateFields: templateFields
        });
    }
}
