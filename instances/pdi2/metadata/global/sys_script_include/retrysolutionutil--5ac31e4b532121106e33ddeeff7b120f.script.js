var RetrySolutionUtil = Class.create();
RetrySolutionUtil.prototype = {
    initialize: function() {},
    STATE: 'state',
    UPDATE_STATE: 'update_state',
    SYS_UPDATED_ON: 'sys_updated_on',
    SYS_CREATED_ON: 'sys_created_on',
    TOKEN_HASH: 'token_hash',
    PROGRESS: 'progress',
    PROGRESS_TRACKER: 'progress_tracker',
    WORKER_ID: 'worker_id',
    ACTIVE: 'active',
    VERSION: 'version',
    WORKER: 'worker',
    GLIDE: 'glide',
    WAITING_FOR_TRAINING_STATE: 'waiting_for_training',
    RETRY_STATE: 'retry',
    RUNNING_CLASSIFICATION: 'running_classification',
    RUNNING_CLUSTERING: 'running_clustering',
    TRAINING_SOLUTION: 'training_solution',
    SOLUTION_COMPLETE_STATE: 'solution_complete',
    SOLUTION_CANCELLED_STATE: 'solution_cancelled',
    SOLUTION_ERROR_STATE: 'solution_error',
    TIMED_OUT: 'timed_out',
    UNAUTHORIZED: 'unauthorized',
    EMPTY: '',
    NOT_IN: 'NOT IN',
    ML_CAPABILITY_DEFINITION_BASE_TABLE: 'ml_capability_definition_base',
    ML_CAPABILITY_DEFINITION_TABLE: 'ml_capability_definition',
    ML_SOLUTION: 'ml_solution',
    TRAINER_RESPONSE_TIMEOUT_PROPERTY: 'glide.platform_ml.trainer_response_timeout_threshold',
    TRAINING_TIMEOUT_PROPERTY: 'glide.platform_ml.training_timeout',
    TRAINING_RETRY_LIMIT_PROPERTY: 'glide.platform_ml.training.retry.limit',
    JOB_STATE_WINDOW_HOURS: 'glide.platform_ml.status_api.time_window',
    DATA_ANALYSIS_UPDATER: 'data_analysis_updater',
    DATA_ANALYSIS_TRAINER: 'data_analysis_trainer',
    CLUSTERING_TRAINER: 'clustering_trainer',
    CLUSTERING_UPDATER: 'clustering_updater',
    WORKFLOW_CLUSTERING_TRAINER: 'workflow_clustering_trainer',
    WORKFLOW_CLUSTERING_UPDATER: 'workflow_clustering_updater',
    JOB_REQUEST_COUNT_LIMIT: 40,

    retrySolutions: function() {
        var timeoutDuration = gs.getProperty(this.TRAINER_RESPONSE_TIMEOUT_PROPERTY, -1);
        var waitingTimeoutDuration = gs.getProperty(this.TRAINING_TIMEOUT_PROPERTY, -1);
        var result = null;
        var jobSubmissionResult = null;
        var solutionIds = null;
		// Timed out is also a terminal state. We do not pick the trainings that we marked as timed-out in previous run. This can result in duplicate solution records.
        var terminalStates = [this.SOLUTION_CANCELLED_STATE, this.SOLUTION_COMPLETE_STATE, this.SOLUTION_ERROR_STATE, this.TIMED_OUT];

        var solution = new GlideRecord(this.ML_SOLUTION);
        var stateQuery = solution.addQuery(this.STATE, this.NOT_IN, terminalStates);
        stateQuery.addOrCondition(this.UPDATE_STATE, this.NOT_IN, terminalStates);
        solution.query();
        solutionIds = this.getSolutionIds();
        //Create a copy of solutionIds to avoid mutating the original array
        var solutionIdsCopy = solutionIds.slice();
        result = this.fetchJobStatesForSolutionIds(solutionIdsCopy);
        solutionIdsCopy = solutionIds.slice();
        jobSubmissionResult = this.fetchJobSubmissionResultFromScheduler(solutionIdsCopy);
        while (solution.next()) {
            try {
                if (new MLGroupbyUtils().isChildGroupbySol(solution))
                    continue;
            } catch (e) {
                gs.error("Exception faced while trying to check if the solution is a ChildGroupbySol for solution :" + solution.getUniqueValue());
            }
            
            var isUpdateJob = this.isUpdateTraining(solution);
            var timeSinceUpdate = this.calculateTimeSinceUpdate(solution);

            if (this.getState(solution, isUpdateJob) == this.WAITING_FOR_TRAINING_STATE) {
                if (!this.isJobSubmitted(jobSubmissionResult, solution.getUniqueValue()))
                    this.cancelUnsubmittedJobAndRetry(solution, isUpdateJob);

                this.handleWaitingForTrainingState(waitingTimeoutDuration, timeSinceUpdate, solution, isUpdateJob, result, terminalStates);
            } else { // Solution has state (or update_state) other than waiting_for_training
                if ((timeoutDuration != -1 && timeSinceUpdate >= timeoutDuration) || this.getState(solution, isUpdateJob) == this.RETRY_STATE) {
                    var lastUpdated = this.getLastUpdatedTime(solution);
                    if (isUpdateJob)
                        gs.log("Training update for solution definition " + solution.solution_definition + " timed out - sys_id: " + solution.sys_id + ", update_state: " + solution.update_state + ", created time: " + solution.sys_created_on + ", last updated time: " + lastUpdated + ", calculated time since last update: " + new GlideDuration(timeSinceUpdate).getDurationValue());
                    else
                        gs.log("Training for solution definition " + solution.solution_definition + " timed out - sys_id: " + solution.sys_id + ", state: " + solution.state + ", created time: " + solution.sys_created_on + ", last updated time: " + lastUpdated + ", calculated time since last update: " + new GlideDuration(timeSinceUpdate).getDurationValue());
                    this.cancelAndRetry(solution, isUpdateJob);
                }
            }
        }
    },

    handleWaitingForTrainingState: function(waitingTimeoutDuration, timeSinceUpdate, solution, isUpdateJob, result, terminalStates) {
        var jobStateFromScheduler = this.getJobStatus(result, solution.getUniqueValue());
        var currentSolutionState = this.EMPTY;

        if (jobStateFromScheduler == null || jobStateFromScheduler == this.EMPTY || jobStateFromScheduler == this.WAITING_FOR_TRAINING_STATE) {
            if (waitingTimeoutDuration != -1 && timeSinceUpdate > waitingTimeoutDuration) {
                // check if the job is assigned to a trainer - If not assigned yet .. cancel it and retry.
                    if (!this.isJobSubmitted(result, solution.getUniqueValue())) {
                        this.cancelAndRetry(solution, isUpdateJob);
                    }
                // For Last retry attempt alone - we should not consider waiting timeout duration. This is to honor exceptional cases where scheduler is flooded with trainings and not responding 
                if (!this.isLastRetry(solution, isUpdateJob)) {
                    currentSolutionState = this.getSolutionState(solution.getUniqueValue(), isUpdateJob);
                    if (currentSolutionState == this.WAITING_FOR_TRAINING_STATE) {
                        this.cancelAndRetry(solution, isUpdateJob);
                    }
                }
            }
        } else if (terminalStates.includes(jobStateFromScheduler)) {
            currentSolutionState = this.getSolutionState(solution.getUniqueValue(), isUpdateJob);
            if (currentSolutionState == this.WAITING_FOR_TRAINING_STATE) {
                // set the state of solution to Timed out and perform retry
                this.setState(solution, isUpdateJob, this.TIMED_OUT);
                this.performRetry(solution, isUpdateJob);
            }
        } else {
            currentSolutionState = this.getSolutionState(solution.getUniqueValue(), isUpdateJob);
            if (currentSolutionState == this.WAITING_FOR_TRAINING_STATE)
                this.checkAndUpdateStateOnSolution(solution, jobStateFromScheduler, isUpdateJob);
        }
    },

    isLastRetry: function(solution, isUpdateJob) {
        var retryLimit = this.getRetryLimit();
        if (isUpdateJob)
            return this.isLastRetryUpdateTraining(solution, retryLimit);
        else
            return this.isLastRetryTraining(solution, retryLimit);
    },

    isLastRetryTraining: function(solution, retryLimit) {
        var solutionDefinition = new GlideRecord(this.ML_CAPABILITY_DEFINITION_BASE_TABLE);
        solutionDefinition.get(solution.ml_capability_definition);

        var failedAttempts = this.getFailedAttempts(solutionDefinition);
        // If the failed attempts is equal to retryLimit- it means the current execution is the last retry.

        if (retryLimit == failedAttempts)
            return true;

        return false;
    },

    isLastRetryUpdateTraining: function(solution, retryLimit) {
        var failedUpdateAttempts = this.getFailedUpdateAttempts(solution);
        if (failedUpdateAttempts == retryLimit)
            return true;
        return false;
    },
    getSolutionState: function(solutionSysId, isUpdateJob) {
        var solutionGR = new GlideRecord(this.ML_SOLUTION);
        solutionGR.get(solutionSysId);
        if (solutionGR.isValid()) {
            if (isUpdateJob)
                return solutionGR.getValue(this.UPDATE_STATE);
            else
                return solutionGR.getValue(this.STATE);
        }
        return this.EMPTY;
    },

    getState: function(solution, isUpdateJob) {
        if (isUpdateJob)
            return solution.getValue(this.UPDATE_STATE);

        return solution.getValue(this.STATE);
    },
    setState: function(solution, isUpdateJob, state) {
        if (isUpdateJob) {
            gs.info("Update state of solution :" + solution.getUniqueValue() + "is updated to " + state);
            solution.setValue(this.UPDATE_STATE, state);
        }
    else {
            gs.info("State of solution :" + solution.getUniqueValue() + "is updated to " + state);
            solution.setValue(this.STATE, state);
        }
        solution.update();
    },

    isUpdateTraining: function(solution) {
        if (solution.update_state == this.EMPTY)
            return false;

        return true;
    },

    getLastUpdatedTime: function(solution) {
        //Compare progress tracker and solution updated times and pick latest time
        var trackerLastUpdated = solution.progress_tracker.sys_updated_on;
        var solutionLastUpdated = solution.getValue(this.SYS_UPDATED_ON);
        if (!GlideStringUtil.nil(trackerLastUpdated) && !GlideStringUtil.nil(solutionLastUpdated)) {
            if (trackerLastUpdated > solutionLastUpdated)
                return new GlideDateTime(trackerLastUpdated);
            else
                return new GlideDateTime(solutionLastUpdated);
        }
        if (GlideStringUtil.nil(trackerLastUpdated))
            return new GlideDateTime(solutionLastUpdated);

        if (GlideStringUtil.nil(solutionLastUpdated))
            return new GlideDateTime(trackerLastUpdated);
    },

    calculateTimeSinceUpdate: function(solution) {
        var currentTime = new GlideDateTime();
        var lastUpdated = this.getLastUpdatedTime(solution);
        return currentTime.getNumericValue() - lastUpdated.getNumericValue();
    },

    // Incase of unsubmitted retries - we have to cancel them and retry. But, ensure that retry count is not effected.
    cancelUnsubmittedJobAndRetry: function(solution, isUpdateJob) {
        if (isUpdateJob) {
            this.setStateToCancelled(solution.getUniqueValue(), isUpdateJob);
            this.submitUpdateJob(solution);
            this.reduceRetryCount(solution);
        } else {
            //setting state to cancelled ensuring that retry count calculation is not effected
            this.setStateToCancelled(solution.getUniqueValue(), isUpdateJob);
            this.retryTraining(solution);
        }
    },

    setStateToCancelled: function(solutionId, isUpdateJob) {
        var gr = new GlideRecord(this.ML_SOLUTION);
        if (gr.get(solutionId)) {
            isUpdateJob ? gr.update_state = this.SOLUTION_CANCELLED_STATE : gr.state = this.SOLUTION_CANCELLED_STATE;
            gr.update();
        }
    },

    reduceRetryCount: function(solutionId) {
        var solutionGR = new GlideRecord(this.ML_SOLUTION);
        if (!solutionGR.get(solutionId))
            return;
        var config = {};
        if (solutionGR.update_config != this.EMPTY && solutionGR.update_config != undefined)
            config = JSON.parse(config);

        if (config.retry_count == undefined)
            return;

        if (config.retry_count == 0) {
            delete config.retry_count;
        } else {
            config.retry_count = config.retry_count - 1;
        }
        solutionGR.update_config = JSON.stringify(config);
        solutionGR.update();
    },

    cancelAndRetry: function(solution, isUpdateJob) {
        if (isUpdateJob) {
            this.cancelUpdateTraining(solution);
            this.retryUpdateTraining(solution);
        } else {
            this.cancelTraining(solution);
            this.retryTraining(solution);
        }
    },

    cancelTraining: function(solution) {
        new sn_ml.TrainingRequest().cancelTraining(solution.getUniqueValue());
        solution.setValue(this.STATE, this.TIMED_OUT);
        solution.update();
    },

    retryTraining: function(solution) {
        var solutionDefinition = new GlideRecord(this.ML_CAPABILITY_DEFINITION_BASE_TABLE);
        solutionDefinition.get(solution.ml_capability_definition);
		// Failed Attempts include the initial submission also. So reducing count by 1 for failedRetryAttempts
        var failedRetryAttempts = this.getFailedAttempts(solutionDefinition) - 1;
        var trainingRetryLimit = this.getRetryLimit();
        if (failedRetryAttempts < trainingRetryLimit)
            this.startNewServiceRequest(solution, failedRetryAttempts, solutionDefinition, trainingRetryLimit);
        else
            gs.log("Training for solution definition " + solutionDefinition.getUniqueValue() + " has hit the max number of retries and timed out");
    },

    performRetry: function(solution, isUpdateJob) {
        if (isUpdateJob)
            this.retryUpdateTraining(solution);
        else
            this.retryTraining(solution);
    },

    getRetryLimit: function() {
        return gs.getProperty(this.TRAINING_RETRY_LIMIT_PROPERTY, 3);
    },

    cancelUpdateTraining: function(solution) {
        new sn_ml.TrainingRequest().cancelUpdateJob(solution.sys_id);
        solution.setValue(this.UPDATE_STATE, this.TIMED_OUT);
        solution.update();
    },

    retryUpdateTraining: function(solution) {
        //retry_count starts with 0 for initial submission. It increases with every retry
        var failedRetryAttempts = this.getFailedUpdateAttempts(solution);
        var trainingRetryLimit = this.getRetryLimit();
        if (failedRetryAttempts < trainingRetryLimit)
            this.submitUpdateJob(solution);
        else
            gs.log("Update training for solution  " + solution.getUniqueValue() + " has hit the max number of retries and timed out");
    },

    submitUpdateJob: function(solution) {
        var capability = solution.capability;
        var solutionName = solution.solution_name;
        var mlSolution = null;
        var solutionVersion = null;
        var updateConfig = null;
        if (capability == this.DATA_ANALYSIS_UPDATER || capability == this.DATA_ANALYSIS_TRAINER)
            mlSolution = sn_ml.DataAnalysisStore.get(solutionName);
        else if (capability == this.CLUSTERING_TRAINER || capability == this.CLUSTERING_UPDATER || capability == this.WORKFLOW_CLUSTERING_TRAINER || capability == this.WORKFLOW_CLUSTERING_UPDATER)
            mlSolution = sn_ml.ClusteringSolutionStore.get(solutionName);

        solutionVersion = mlSolution.getActiveVersion();
        updateConfig = JSON.parse(solution.update_config);
        solutionVersion.submitUpdateJob(updateConfig);
    },

    getJobStatus: function(result, solutionId) {
        if (result == null || result.length == 0)
            return this.EMPTY;

        var i = 0;
        for (i = 0; i < result.length; i++) {
            if (result[i].solution_id == solutionId) {
                //running_classification and running_clustering are not ml_solution states. returning training_solution insted
                if (result[i].state == this.RUNNING_CLASSIFICATION || result[i].state == this.RUNNING_CLUSTERING)
                    return this.TRAINING_SOLUTION;
                if (this.isValidState(result[i].state))
                    return result[i].state;
                return null;
            }
        }
        return this.EMPTY;
    },

    isJobSubmitted: function(result, solutionId) {
        if (result == null || result.length == 0)
            return false;

        var i = 0;
        for (i = 0; i < result.length; i++) {
            if (result[i].solution_id == solutionId) {
                return true;
            }
        }
        return false;
    },

    isValidState: function(state) {
        var validStates = ["fetching_files_for_training", "preparing_data", "retry", "solution_cancelled", "solution_complete", "solution_error", "solution_error_missing_artifacts", "timed_out", "training_request_received", "training_solution", "unauthorized", "uploading_solution", "waiting_for_training"];
        return validStates.includes(state);
    },

    checkAndUpdateStateOnSolution: function(solution, jobStateFromScheduler, isUpdateJob) {
        if (jobStateFromScheduler != null) {
            if (isUpdateJob) {
                solution.setValue(this.UPDATE_STATE, jobStateFromScheduler);
                gs.info("Setting update_state of solution " + solution.getUniqueValue + " to " + jobStateFromScheduler);
            } else {
                solution.setValue(this.STATE, jobStateFromScheduler);
                gs.info("Setting state of solution " + solution.getUniqueValue + " to " + jobStateFromScheduler);
            }
            solution.update();
        }
    },

    getSolutionIds: function() {
        var solution = new GlideRecord(this.ML_SOLUTION);
        var stateQuery = solution.addQuery(this.STATE, this.WAITING_FOR_TRAINING_STATE);
        stateQuery.addOrCondition(this.UPDATE_STATE, this.WAITING_FOR_TRAINING_STATE);
        solution.query();
        var solutionIds = [];
        var index = 0;
        while (solution.next()) {
            solutionIds[index++] = solution.getUniqueValue();
        }
        return solutionIds;
    },

    fetchJobStatesFromScheduler: function() {
        var solutionIds = this.getSolutionIds();
        if (solutionIds.length != 0)
            return this.fetchJobStatesForSolutionIds(solutionIds);
    },

    fetchJobStatesForSolutionIds: function(solutionIds) {
        if (solutionIds.length == 0)
            return [];

        var response = [];
        try {
            if (solutionIds.length <= this.JOB_REQUEST_COUNT_LIMIT) {
                response = new sn_ml.TrainingRequest().getTrainingJobsState(this.WORKER, this.EMPTY, solutionIds.toString()).getBody();
                return JSON.parse(response).result;
            } else {
                while (solutionIds.length != 0) {
                    var solutionIdForCurrentRequest = this.getSolutionIdsForCurrentRequest(solutionIds);
                    var apiResponse = new sn_ml.TrainingRequest().getTrainingJobsState(this.WORKER, this.EMPTY, solutionIdForCurrentRequest.toString()).getBody();
                    var partialResponse = JSON.parse(apiResponse).result;
                    response = response.concat(partialResponse);
                }
                return response;
            }
        } catch (e) {
            gs.error("Unable to fetch Job states from getTrainingJobsState API for solution Ids." + solutionIds + "Exception details : " + e);
        }
    },

    fetchJobSubmissionResultFromScheduler: function(solutionIds) {
        if (solutionIds.length == 0)
            return [];

        var response = [];
        try {
            if (solutionIds.length <= this.JOB_REQUEST_COUNT_LIMIT) {
                response = new sn_ml.TrainingRequest().getTrainingJobsState(this.GLIDE, this.EMPTY, solutionIds.toString()).getBody();
                return JSON.parse(response).result;
            } else {
                while (solutionIds.length != 0) {
                    var solutionIdForCurrentRequest = this.getSolutionIdsForCurrentRequest(solutionIds);
                    var apiResponse = new sn_ml.TrainingRequest().getTrainingJobsState(this.GLIDE, this.EMPTY, solutionIdForCurrentRequest.toString()).getBody();
                    var partialResponse = JSON.parse(apiResponse).result;
                    response = response.concat(partialResponse);
                }
                return response;
            }
        } catch (e) {
            gs.error("Unable to fetch Job submission result from getTrainingJobsState API for solution Ids." + solutionIds + "Exception details : " + e);
        }
    },

    getSolutionIdsForCurrentRequest: function(solutionIds) {
        if (solutionIds.length == 0)
            return [];
        else if (solutionIds.length <= this.JOB_REQUEST_COUNT_LIMIT)
            return this.extractItems(solutionIds, solutionIds.length);
        else
            return this.extractItems(solutionIds, this.JOB_REQUEST_COUNT_LIMIT);
    },
    extractItems: function(solutionIds, count) {
        var extractedIds = [];
        while (count > 0) {
            extractedIds.push(solutionIds.pop());
            count--;
        }
        return extractedIds;
    },

    getFailedAttempts: function(solutionDefinition) {
        var trainingRetryLimit = this.getRetryLimit();
        var gr = new GlideRecord(this.ML_SOLUTION);
        gr.addQuery(this.ML_CAPABILITY_DEFINITION_TABLE, solutionDefinition.getUniqueValue());
        gr.orderByDesc(this.SYS_CREATED_ON);
        gr.setLimit(trainingRetryLimit + 1);
        gr.query();
        var count = 0;

        while (gr.next() && trainingRetryLimit-- >= 0) {
            if (gr.getValue(this.STATE) == this.TIMED_OUT || gr.getValue(this.STATE) == this.RETRY_STATE)
                count++;
        }
        return count;
    },

    getFailedUpdateAttempts: function(solution) {
        var updateConfig = JSON.parse(solution.update_config);
        if (updateConfig.retry_count == undefined)
            return 0;
        return updateConfig.retry_count;
    },

    startNewServiceRequest: function(solution, failedRetryAttempts, solutionDefinition, trainingRetryLimit) {
        var token = GlideSecureRandomUtil.getSecureRandomString(32);

        var newSolutionId = this.insertNewSolution(solution, token);
        if (newSolutionId == this.EMPTY || newSolutionId == null) {
            gs.print("Could not create new solution for solution definition " + solutionDefinition.getUniqueValue());
            return;
        }

        var newSolution = new GlideRecord(this.ML_SOLUTION);
        newSolution.get(newSolutionId);

        gs.print("Attempt number " + (failedRetryAttempts + 1) + " to train for the solution definition: " + solutionDefinition.getUniqueValue());
        var response = new sn_ml.TrainingRequest(solutionDefinition).postServiceRequest(newSolutionId, token);
        if (failedRetryAttempts > trainingRetryLimit) {
            newSolution.setValue(this.STATE, this.TIMED_OUT);
            newSolution.setValue(this.TOKEN_HASH, this.EMPTY);
            gs.log("Training for solution definition " + solutionDefinition.getUniqueValue() + " has hit the max number of retries and timed out");
        } else if (!gs.nil(response) && response.getStatusCode() === 401) {
            newSolution.setValue(this.STATE, this.UNAUTHORIZED);
            newSolution.setValue(this.TOKEN_HASH, this.EMPTY);
        } else if (!gs.nil(response) && response.getStatusCode() === 200) {
            newSolution.setValue(this.STATE, this.WAITING_FOR_TRAINING_STATE);
        } else {
            newSolution.setValue(this.STATE, this.RETRY_STATE);
            newSolution.setValue(this.TOKEN_HASH, this.EMPTY);
        }
        newSolution.update();
    },

    insertNewSolution: function(solution, token) {
        var version = sn_ml.MLRecordUtil.getNextSolutionVersion(solution.getValue(this.ML_CAPABILITY_DEFINITION_TABLE));
        if (version < 0)
            return "";

        var newSolution = new GlideRecord(this.ML_SOLUTION);
        newSolution.initialize();
        var elements = solution.getFields();
        for (var i = 0; i < elements.size(); i++) {
            var element = elements.get(i);
            var elementName = element.getName();
            if (elementName != this.PROGRESS && elementName != this.PROGRESS_TRACKER && elementName != this.WORKER_ID && elementName != this.ACTIVE) {
                newSolution.setValue(element.getName(), element.getValue());
            }
        }
        newSolution.setValue(this.TOKEN_HASH, new GlideDigest().md5_digest(token));
        newSolution.setValue(this.VERSION, version);
        return newSolution.insert();
    },
    type: 'RetrySolutionUtil'
};
