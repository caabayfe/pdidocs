/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (!event.payload)
        return;
    
    const questionAnswerDetails = {...api.state.questionAnswerDetails};
    questionAnswerDetails.answer = event.payload.answer;
    let nextButtonState = {...api.state.nextButtonState};
    nextButtonState.isValid = !!questionAnswerDetails.answer;
    api.setState("nextButtonState", nextButtonState);
    api.setState("questionAnswerDetails", questionAnswerDetails);   
}
