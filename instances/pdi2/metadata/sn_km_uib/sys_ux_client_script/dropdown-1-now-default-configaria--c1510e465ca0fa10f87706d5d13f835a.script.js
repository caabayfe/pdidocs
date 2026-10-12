/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({
    api
}) {
    let choices = api.data.load_feedback_reason_options_1.output.choices;
    
    let selectedChoiceId = api.state.selectedReason[0];
    let selectedChoice = choices.find(choice => choice.id == selectedChoiceId);
    let value = "Reason " + selectedChoice.label + ", Select to choose other available reasons for the feedback";

    return {
        "aria-label": value
    };
}
