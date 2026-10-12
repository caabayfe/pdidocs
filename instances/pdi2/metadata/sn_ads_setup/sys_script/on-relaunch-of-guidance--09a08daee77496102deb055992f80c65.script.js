(function executeRule(current, previous) {

    if (previous) {
        const prevContextEmpty = gs.nil(previous.getValue('interaction_context'));
        if (!prevContextEmpty) {
            var data = {
                sys_scope: current.guidance && current.guidance.sys_scope.getDisplayValue(),
                sys_package: current.guidance && current.guidance.sys_package.getDisplayValue(),
                snc_created: current.guidance && current.guidance.snc_created.getDisplayValue(),
                setup_execution_type: current.guidance && current.guidance.setup_execution_type.getDisplayValue(),
                stream_name: "on_relaunch_of_guidance"
            };
            var controller = new SNHelpSetupAnalyticsController();
            controller.logData(controller.CATEGORY, controller.POINT, controller.SETUP_START_TASK_COMPLETION_EVENT, data);
        }
    }
})(current, previous);
