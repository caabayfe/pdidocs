(function executeRule(current, previous /*null when async*/ ) {

    var data = {
        name: current.guidance.name.getDisplayValue(),
        type: current.guidance.type.getDisplayValue(),
        roles: current.guidance.roles.getDisplayValue(),
        sys_scope: current.guidance.sys_scope.getDisplayValue(),
        sys_package: current.guidance.sys_package.getDisplayValue(),
        setup_execution_type: current.guidance.setup_execution_type.getDisplayValue()
    };

    var controller = new SNHelpAnalyticsController();

    controller.logData(controller.CATEGORY, controller.POINT, controller.EVENTS.setup.usageFrequency, data);

})(current, previous);
