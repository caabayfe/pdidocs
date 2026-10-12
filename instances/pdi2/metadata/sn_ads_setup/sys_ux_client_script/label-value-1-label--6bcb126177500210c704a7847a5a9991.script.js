/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const {sys_id, setup_id, table, selectedStage, selectedActivity} = api.context.props; 
  return "Welcome to Playbook !!Chosen stage id = " + selectedStage + " , chosen task id is " +  selectedActivity+ " .";
}
