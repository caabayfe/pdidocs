/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (!event.payload || event.payload.index == null && event.payload.answer)
        return;
    let questionAnswerDetails = [...api.state.questionAnswerDetails];
    questionAnswerDetails[event.payload.index].answer = event.payload.answer;
    api.setState("questionAnswerDetails", questionAnswerDetails);
    let nextButtonState = {...api.state.nextButtonState};
    for (let i = 0; i < questionAnswerDetails.length; i++) {
        if(!questionAnswerDetails[i].answer) {
            nextButtonState.isValid = false;
            api.setState("nextButtonState", nextButtonState);
            return;
        }
    }
    nextButtonState.isValid = true;
    api.setState("nextButtonState", nextButtonState);
}
