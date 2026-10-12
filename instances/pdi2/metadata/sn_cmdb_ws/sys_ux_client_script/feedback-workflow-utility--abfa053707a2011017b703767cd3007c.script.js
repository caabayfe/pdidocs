/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    /**
     * Utilizing the feedback workflow json object, get the next state of the workflow given the current
     * feedback card view. Works for back, next, and submit buttons
     */
    const currentFeedbackCardView = api.state.feedback_current_view;
    let nextFeedbackCardView;
    if (event.elementId) {
        if (event.elementId.startsWith('next') || event.elementId.startsWith('submit')) {
            nextFeedbackCardView = api.state.feedback_sentiment == 'positive' ? 
                api.state.feedback_workflow[currentFeedbackCardView].positive.next : 
                api.state.feedback_workflow[currentFeedbackCardView].negative.next;
        } else if (event.elementId.startsWith('back')) {
            nextFeedbackCardView = api.state.feedback_sentiment == 'positive' ? 
                api.state.feedback_workflow[currentFeedbackCardView].positive.back : 
                api.state.feedback_workflow[currentFeedbackCardView].negative.back;
        }
    }
    api.setState('feedback_current_view', nextFeedbackCardView ? nextFeedbackCardView : currentFeedbackCardView);
}
