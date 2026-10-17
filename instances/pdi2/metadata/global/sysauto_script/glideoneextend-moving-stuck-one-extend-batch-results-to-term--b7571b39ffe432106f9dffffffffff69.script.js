(function() {
    var defaultTimeoutInMins = 1440;
    var STALE_THRESHOLD_MINUTES = parseInt(gs.getProperty("com.glide.oneextend.batch_result_cancellation_timeout_minutes",defaultTimeoutInMins));
    if (isNaN(STALE_THRESHOLD_MINUTES) || STALE_THRESHOLD_MINUTES < 1) STALE_THRESHOLD_MINUTES = defaultTimeoutInMins;
    var currentDateTime = new GlideDateTime();
    currentDateTime.subtract(STALE_THRESHOLD_MINUTES * 60 * 1000); // Subtract threshold minutes
    try {
        // update for all in_progress eval runs without any batch results or tasks for more than staleThresholdMinutes since it's updation
        updateInProgressEvalRunsWithoutResultsOrTasks();

        // get the plan invocation ids for which the batch run tasks are in progress for more than threshold minutes
        var inProgressPlanInvs = getInProgressPlanInvocations();
        if (inProgressPlanInvs.length == 0) {
            return;
        }

        // Cancelling the plan invocations for which alteast one feature invocation is stuck in processing for more than maximum of threshold and timeout
        var cancelledPlanInvocations = cancelStalePlanInvocations(inProgressPlanInvs);
        if (cancelledPlanInvocations.length == 0) {
            return;
        }

        // cancelling the batch_results 
        cancelBatchResults(cancelledPlanInvocations);

        // getting the unique batch run tasks and batch runs of cancelled batch results
        var result = getBatchRunAndTasksToCancel([], []);
        var batchRunTasksToCancel = result.batchRunTasksToCancel || [];
        var batchRunsToCheck = result.batchRunsToCheck || [];

        // cancelling the batch run tasks
        cancelBatchRunTasks(batchRunTasksToCancel);

        // Update the batch run status based on the batch run tasks status.
        updateBatchRunStatus(batchRunsToCheck);
    } catch (e) {
        gs.error("Error occurred while moving the stuck executions to terminal state in scheduled job" + e);
        throw e;
    }

    function getInProgressPlanInvocations() {
        var inProgressPlanInvs = [];
        var batchResultGa = new GlideAggregate('sys_one_extend_batch_result');
        batchResultGa.addQuery("batch_run_task.status", "in_progress");
        batchResultGa.addQuery("batch_run_task.sys_updated_on", '<', currentDateTime);
        batchResultGa.setGroup(false);
        batchResultGa.addAggregate('GROUP_CONCAT_DISTINCT', 'plan_invocation');
        batchResultGa.query();
        if (batchResultGa.next()) {
            sysIds = batchResultGa.getAggregate('GROUP_CONCAT_DISTINCT', 'plan_invocation');
            inProgressPlanInvs = sysIds.length > 0 ? sysIds.split(",") : [];
        }
        return inProgressPlanInvs;
    }

    function cancelStalePlanInvocations(inProgressPlanInvs) {
        var cancelledPlanInvocations = [];
        var processedInvocationsMap = {};
        var featureInvGr = new GlideRecord('one_api_service_plan_feature_invocation');
        featureInvGr.addQuery("service_plan_invocation", "IN", inProgressPlanInvs);
        featureInvGr.addQuery("status", "processing");
        featureInvGr.query();
        while (featureInvGr.next()) {
            var planInvocationId = featureInvGr.getValue("service_plan_invocation");
            if (processedInvocationsMap.hasOwnProperty(planInvocationId)) {
                continue; // already processed and considered for cancellation
            }
            var timeoutSeconds = parseInt(featureInvGr.getValue("timeout_sec"), 10);
            if (isNaN(timeoutSeconds)) timeoutSeconds = 0;

            var effectiveTimeout = Math.max(timeoutSeconds, STALE_THRESHOLD_MINUTES * 60);
            var updatedTime = new GlideDateTime(featureInvGr.getValue("sys_updated_on"));

            var threshold = new GlideDateTime();
            threshold.subtract(effectiveTimeout * 1000);
            if (updatedTime < threshold) {
                sn_one_extend.OneExtendUtil.cancelPlanInvocation(planInvocationId);
                cancelledPlanInvocations.push(planInvocationId);
                processedInvocationsMap[planInvocationId] = true;
            }
        }
        return cancelledPlanInvocations;
    }

    function cancelBatchResults(cancelledPlanInvocations) {
        batchResultGr = new GlideRecord('sys_one_extend_batch_result');
        batchResultGr.addQuery("status", '!=', 'cancelled');
        batchResultGr.addQuery('plan_invocation', "IN", cancelledPlanInvocations);
        batchResultGr.query();
        batchResultGr.setValue('status', 'cancelled');
        batchResultGr.updateMultiple();
    }

    function getBatchRunAndTasksToCancel(batchRunTasksToCancel, batchRunsToCheck) {
        batchResultGa = new GlideAggregate('sys_one_extend_batch_result');
        batchResultGa.addQuery('plan_invocation', "IN", cancelledPlanInvocations);
        batchResultGa.setGroup(false);
        batchResultGa.addAggregate('GROUP_CONCAT_DISTINCT', 'batch_run_task.sys_id');
        batchResultGa.addAggregate('GROUP_CONCAT_DISTINCT', 'batch_run.sys_id');
        batchResultGa.query();
        while (batchResultGa.next()) {
            sysIds = batchResultGa.getAggregate('GROUP_CONCAT_DISTINCT', 'batch_run_task.sys_id');
            batchRunSysIds = batchResultGa.getAggregate('GROUP_CONCAT_DISTINCT', 'batch_run.sys_id');
            batchRunTasksToCancel = sysIds.length > 0 ? sysIds.split(",") : [];
            batchRunsToCheck = batchRunSysIds.length > 0 ? batchRunSysIds.split(",") : [];
        }
        var result = {
            batchRunTasksToCancel: batchRunTasksToCancel,
            batchRunsToCheck: batchRunsToCheck
        };
        return result;
    }

    function cancelBatchRunTasks(batchRunTasksToCancel) {
        var batchRunTaskGr = new GlideRecord('sys_one_extend_batch_run_task');
        batchRunTaskGr.addQuery("status", '!=', 'cancelled');
        batchRunTaskGr.addQuery('sys_id', 'IN', batchRunTasksToCancel);
        batchRunTaskGr.query();
        batchRunTaskGr.setValue('status', 'cancelled');
        batchRunTaskGr.updateMultiple();
    }

    function updateBatchRunStatus(batchRunsToCheck) {
        for (index = 0; index < batchRunsToCheck.length; index++) {
            var batchRun = batchRunsToCheck[index];
            var batchRunTaskStatusMap = {};
            var batchRunTaskGa = new GlideAggregate("sys_one_extend_batch_run_task");
            batchRunTaskGa.addQuery("batch_run", batchRun);
            batchRunTaskGa.groupBy("status");
            batchRunTaskGa.addAggregate('COUNT');
            batchRunTaskGa.query();
            while (batchRunTaskGa.next()) {
                var status = batchRunTaskGa.getValue("status");
                batchRunTaskStatusMap[status] = batchRunTaskGa.getAggregate("COUNT");
            }
            var batchRunStatus = determineBatchRunStatus(batchRunTaskStatusMap);
            var batchRunGr = new GlideRecord("sys_one_extend_batch_run");
            batchRunGr.addQuery("sys_id", batchRun);
            batchRunGr.query();
            if (batchRunGr.next()) {
                batchRunGr.setValue("status", batchRunStatus);
                batchRunGr.update();
            }
        }
    }

    function updateInProgressEvalRunsWithoutResultsOrTasks() {
        var batchRunGr = new GlideRecord("sys_one_extend_batch_run");
        batchRunGr.addQuery("status", "in_progress");
        batchRunGr.addQuery("run_type", "eval_run");
        batchRunGr.addQuery("sys_updated_on", '<', currentDateTime);
        batchRunGr.query();
        while (batchRunGr.next()) {
            var batchResultGA = new GlideAggregate("sys_one_extend_batch_result");
            batchResultGA.addQuery("batch_run", batchRunGr.getUniqueValue());
            batchResultGA.addAggregate("COUNT");
            batchResultGA.query();
            var batchResultCount = 0;
            if (batchResultGA.next()) {
                batchResultCount = parseInt(batchResultGA.getAggregate("COUNT"), 10);
            }
            var batchRunTaskGA = new GlideAggregate("sys_one_extend_batch_run_task");
            batchRunTaskGA.addQuery("batch_run", batchRunGr.getUniqueValue());
            batchRunTaskGA.addAggregate("COUNT");
            batchRunTaskGA.query();
            var batchRunTaskCount = 0;
            if (batchRunTaskGA.next()) {
                batchRunTaskCount = parseInt(batchRunTaskGA.getAggregate("COUNT"), 10);
            }
            if (batchResultCount == 0 && batchRunTaskCount == 0) {
                batchRunGr.setValue("status", "completed");
                batchRunGr.update();
            } else if (batchResultCount > 0 && batchRunTaskCount == 0) {
                var inProgressPlanInvocations = getInProgressPlanInvocationsWithoutTasks(batchRunGr.getUniqueValue());
                var cancelledPlanInvocations = cancelStalePlanInvocations(inProgressPlanInvocations);
                cancelBatchResults(cancelledPlanInvocations);
                updateBatchRunStatusWithoutTasks(batchRunGr);
            }
        }
    }

    function determineBatchRunStatus(statusMap) {
        var statuses = Object.keys(statusMap);
        // if all the batch run tasks associated with a batch run are in cancelled state
        if (statuses.length === 1 && statuses[0] === 'cancelled' && statusMap['cancelled'] > 1) {
            return 'cancelled';
        }

        // if all the batch run tasks are in terminal states
        var draftCount = statusMap['draft'] || 0;
        var inProgressCount = statusMap['in_progress'] || 0;
        if (draftCount === 0 && inProgressCount === 0) {
            return 'completed';
        }
        return 'in_progress';
    }

    function getInProgressPlanInvocationsWithoutTasks(batchRunId) {
        var inProgressPlanInvs = [];
        var batchResultGa = new GlideAggregate('sys_one_extend_batch_result');
        batchResultGa.addQuery("status", "in_progress");
        batchResultGa.addQuery("batch_run", batchRunId);
        batchResultGa.addQuery("sys_updated_on", '<', currentDateTime);
        batchResultGa.setGroup(false);
        batchResultGa.addAggregate('GROUP_CONCAT_DISTINCT', 'plan_invocation');
        batchResultGa.query();
        if (batchResultGa.next()) {
            sysIds = batchResultGa.getAggregate('GROUP_CONCAT_DISTINCT', 'plan_invocation');
            inProgressPlanInvs = sysIds.length > 0 ? sysIds.split(",") : [];
        }
        return inProgressPlanInvs;
    }

    function updateBatchRunStatusWithoutTasks(batchRunGr) {
        var batchResultGA = new GlideAggregate("sys_one_extend_batch_result");
        batchResultGA.addQuery("batch_run", batchRunGr.getUniqueValue());
        batchResultGA.addAggregate("COUNT", "status");
        batchResultGA.query();
        var statusMap = {};
        while (batchResultGA.next()) {
            statusMap[batchResultGA.getValue("status")] = batchResultGA.getAggregate("COUNT", "status");
        }
        var status = determineBatchRunStatus(statusMap);
        batchRunGr.setValue("status", status);
        batchRunGr.update();
    }

})();
