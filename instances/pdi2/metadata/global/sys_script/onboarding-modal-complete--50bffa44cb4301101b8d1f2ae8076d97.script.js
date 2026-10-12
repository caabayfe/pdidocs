(function executeRule(current, previous /*null when async*/ ) {

    var data = {
        name: current.guidance && current.guidance.name,
        snc_created: current.guidance && current.guidance.snc_created.toString(),
        sys_scope: current.guidance && current.guidance.sys_scope.getDisplayValue(),
        sys_package: current.guidance && current.guidance.sys_package.getDisplayValue()
    };
    var controller = new SNHelpAnalyticsController();
    controller.logData(controller.ADS_CATEGORY, controller.ADS_POINTS.helpModal, controller.EVENTS.modal.complete, data);

})(current, previous);
