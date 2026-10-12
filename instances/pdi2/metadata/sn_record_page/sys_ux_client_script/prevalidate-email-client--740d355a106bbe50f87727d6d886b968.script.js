/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    await imports['now_email_client.EmailValidationActions']().prevalidate(api, event, helpers, [
        // Custom: [private] email to external recipients → combines into modal
        function(draftRecord, api, helpers, payload) {
            if (draftRecord.subject && draftRecord.subject.toLowerCase().startsWith('[private]')) {
                var hasExternal = draftRecord.to?.some(
                    function(toObj) { return !toObj.recipientSource && !toObj.recipientSourceTable; }
                );
                if (hasExternal) {
                    return {
                        heading: 'Send to external recipients?',
                        message: 'This email is marked as [private] but has external recipients.'
                    };
                }
            }
            return null;
        }
    ]);
}
