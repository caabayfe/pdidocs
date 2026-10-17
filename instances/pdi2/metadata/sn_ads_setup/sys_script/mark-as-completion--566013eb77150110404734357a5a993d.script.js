(function executeRule(current, previous) {

    var data = {
		
        active_setup_type: current.active_setup_type.getDisplayValue(),
        sys_scope: current.guidance && current.guidance.sys_scope.getDisplayValue(),
        sys_package: current.guidance && current.guidance.sys_package.getDisplayValue(),
        snc_created: current.guidance && current.guidance.snc_created.getDisplayValue(),
        setup_execution_type: current.guidance && current.guidance.setup_execution_type.getDisplayValue(),
        stream_name: 'mark_as_completion'
    };

    var controller = new SNHelpSetupAnalyticsController();
    controller.logData(controller.CATEGORY, controller.POINT, controller.ACTIVE_SETUP_TYPE_EVENT, data);

})(current, previous);
