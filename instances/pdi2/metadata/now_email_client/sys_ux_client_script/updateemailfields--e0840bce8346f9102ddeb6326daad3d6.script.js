/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const subject = event.payload.subject;
    const emailFields = api.state["emailFields"] || {};

    if(emailFields?.subject?.value === subject) { // Subject didn't change do nothing
        return;
    }

    api.setState("emailFields", {
        ...emailFields,
        "subject": {
            "name": "subject",
            "value": subject,
            "displayValue": subject,
        }
    });
}
