/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    if (event.payload.name == "formLayoutConfig" && event.payload.previousValue) {
        api.setState("showLoader", false);

        let fields = api.data.form_2.form.fields;
        let mandatoryFieldEmpty = false;
        let mandatoryFields = {};
        let mandatoryFieldsValidation = {};

        if (!!fields) {
            for (let key in fields) {
                if (fields[key].dictionary.isMandatory) {
                    if (!fields[key].value) {
                        mandatoryFieldEmpty = true;
                        mandatoryFieldsValidation[fields[key].name] = true;
                    }
                    mandatoryFields[fields[key].name] = true;
                    api.emit('SET_FORM_FIELD_MANDATORY', {
                        'field': fields[key].name
                    });
                }
            }
            api.setState("mandatoryFields", mandatoryFields);
            api.setState("mandatoryFieldsValidation", mandatoryFieldsValidation);
        }

        if (mandatoryFieldEmpty) {
            api.emit('ACE_ACTION_PERFORMED', {
                eventName: 'SN_NS_ADMIN_DISABLE_NEXT'
            });
        }
    }
}
