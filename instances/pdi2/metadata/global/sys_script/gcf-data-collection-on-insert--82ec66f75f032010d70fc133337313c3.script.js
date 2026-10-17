(function executeRule(current, previous /*null when async*/ ) {
    var controller = new SNHelpAnalyticsController();
    var data = {
        type: current.type.getDisplayValue(),
        name: current.name.getDisplayValue(),
        sys_package: current.sys_package.getDisplayValue(),
        sys_scope: current.sys_scope.getDisplayValue(),
        roles: current.roles.getDisplayValue(),
        status: current.status.getDisplayValue(),
        setup_execution_type: current.setup_execution_type.getDisplayValue()
    };

    if (current.type == 'embedded_help') {
        // capturing required payload when guidance type is embedded help
        var payload = {
            name: current.name,
            sys_package: current.sys_package.getDisplayValue(),
            sys_scope: current.sys_scope.getDisplayValue(),
            context: current.context,
            application_route: current.app_route,
            route_params: current.route_params,
            snc_created: current.snc_created.toString()

        };
        controller.logData(controller.ADS_CATEGORY, controller.ADS_POINTS.helpCentre, controller.EVENTS.help_centre.newRecord, payload);
    }
    controller.logData(controller.CATEGORY, controller.POINT, controller.EVENTS.setup.newRecord, data);

})(current, previous);
