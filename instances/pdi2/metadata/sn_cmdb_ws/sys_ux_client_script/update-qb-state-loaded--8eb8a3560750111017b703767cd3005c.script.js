/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState('userQuestion', event.payload.userQuestion);
    api.setState('nlqQueryLogId', event.payload.nlqLogSysId);
    api.setState('modifiedUtterance', event.payload.modifiedUtterance);
    api.setState('outputSource', event.payload.outputSource);
    
    const userName = api.context.session.user.userName.substring(0,10);
    const payload = {
        name: `NLQ - ${userName} : ${new Date().getTime().toString()}`,
        source: "NLQ",
        query: JSON.stringify(event.payload.queryBuilderData),
        description: event.payload.userQuestion,
        dependencies: ""
    };
    api.setState('nlqQbResult', JSON.stringify(payload));
}
