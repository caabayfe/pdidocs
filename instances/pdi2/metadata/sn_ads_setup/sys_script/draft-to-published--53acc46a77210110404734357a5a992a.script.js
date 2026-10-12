(function executeRule(current, previous) {

    var controller = new SNHelpSetupAnalyticsController();
    var categoriesCount = -1,
        tasksCount = -1;

    var processDefinitionId = current.process_definition;

    try {
        var laneAgg = new GlideAggregate('sys_pd_lane');
        laneAgg.addQuery('process_definition', processDefinitionId);
        laneAgg.addAggregate('COUNT');
        laneAgg.query();
        while (laneAgg.next()) {
            categoriesCount = laneAgg.getAggregate('COUNT');
        }

        var activityAgg = new GlideAggregate('sys_pd_activity');
        activityAgg.addQuery('process_definition', processDefinitionId);
        activityAgg.addAggregate('COUNT');
        activityAgg.query();
        while (activityAgg.next()) {
            tasksCount = activityAgg.getAggregate('COUNT');
        }

        if (categoriesCount == -1 || tasksCount == -1) {
            return;
        }

        var data = {
            no_of_categories: controller.rangeConversionToTenSizeBatches(categoriesCount),
            no_of_tasks: controller.rangeConversionToTenSizeBatches(tasksCount),
            snc_created: current.snc_created.getDisplayValue(),
            sys_scope: current.sys_scope.getDisplayValue(),
            sys_package: current.sys_package.getDisplayValue(),
            setup_execution_type: current.setup_execution_type.getDisplayValue(),
            stream_name: "draft_to_published"
        };

        controller.logData(controller.CATEGORY, controller.POINT, "draft_to_published", data);

    } catch (err) {
        gs.info("GCF: error failed while fetching process");
    }



})(current, previous);
