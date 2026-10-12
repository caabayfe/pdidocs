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
    // console.log("data",api.data.look_up_upgrade_session.results[0]);
    if (api.data.look_up_upgrade_session.results[0] && (
        api.data.look_up_upgrade_session.results[0].environment.value.toLowerCase() === "production" ||
        api.data.look_up_upgrade_session.results[0].process_upgrade_plan_execution_tracker.value != null
    )){
        api.setState("isProcessingClicked", true);
        if(api.data.look_up_upgrade_session.results[0].process_upgrade_plan_execution_tracker.value != null){
            api.setState("columnData", api.state.disabledColumnData);
            if(api.state.activityState === "IN_PROGRESS"){
                api.setState("isProcessing",true);

                // refresh start_processing_upgrade_plan_1
                api.setState("processParams", {
                    "upgrade_plan_sysid": api.context.props.experienceProperties.upgrade_plan_sysid.value,
                    "upgrade_session_id": api.context.props.experienceProperties.upgrade_session_id.value,
                    "first_load": true
                });
            }

            
        }
    }
}
