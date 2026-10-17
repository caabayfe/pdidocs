var MLAgentZeroAggreationAPI = Class.create();
MLAgentZeroAggreationAPI.prototype = {
    initialize: function(frequency) {
        // initialize Aggregation API constants
        this.CONTEXT_TABLE = 'sys_cs_auto_resolution_context';
        this.CONFIGURATION_LANGUAGE_TABLE = 'sys_cs_auto_resolution_configuration_language';
        this.AGGREGATION_TABLE = 'ml_agent_zero_aggregated_data';
        this.ML_PREDICTOR_RESULTS_TABLE = 'ml_predictor_results';
        this.SYS_CREATED_ON = 'sys_created_on';
        this.SYS_CLASS_NAME = 'sys_class_name';
        this.SIMULATION = 'sys_cs_auto_resolution_sim_context';
        this.TRAINING_LANGUAGE = 'training_language';
        this.LANGUAGE_CODE = 'task_creation_language_code';
        this.NOTIFICATION_STATE = 'notification_state';
        this.TASK = 'task';
        this.TASK_RESOLVED = 'task_resolved';
        this.ACCEPTED = 'accepted';
        this.DECLINED = 'declined';
        this.NLU_INTENT = 'nlu_intent';
        this.A0_UNSUPPORTED = 'AgentZeroUnsupported';
        this.INTENT_TOPIC_STATE = 'intent_topic_state';
        this.INTENT_WITH_TOPIC = 'intent_with_topic';
        this.INTENT_WITHOUT_TOPIC = 'intent_without_topic';
        this.INTENT_STATE_TOPIC_REASON = 'reason';
        this.UNSUPPORTED_INTENT = 'Unsupported intent';
        this.SOURCE_SYS_ID = 'source_sys_id';
        this.RESOLVED = 'resolved';
        this.NOT_RESOLVED = 'not_resolved';
        this.ALL = 'all';
        this.CONFIDENCE_SCORES = 'confidence_scores';
        this.AVERAGE = 'average';
        this.MEDIAN = 'median';
        this.MIN = 'min';
        this.MAX = 'max';
        this.COUNT = 'count';
        this.BIN_COUNTS = 'bin_counts';
        this.PREDICTED_CONFIDENCE = 'predicted_confidence';
        this.LANGUAGE = 'language';
        this.ACCEPTANCES = 'acceptances';
        this.CORRECT = 'correct';
        this.COVERAGE = 'coverage';
        this.TOPIC_COVERAGE = 'topic_coverage';
        this.WITHOUT_TOPIC = 'without_topic';
        this.RESOLUTIONS = 'resolutions';
        this.ROWS = 'rows';
        this.SOLUTION_METRICS = 'solution_metrics';
        this.START = 'start';
        this.END = 'end';
        this.DAYS_AGO_END = 1;
        this.DELETION_MONTHS = 12;
        this.useMonthly = false;
        this.INTENT = "nlu_intent";
        this.ML_SOLUTION_NAME = "ml_solution_name";
        this.ML_PARENT_SOLUTION_NAME = "ml_parent_solution_name";
        this.ML_SOLUTION_VERSION = "ml_solution_version";
        this.ML_PARENT_SOLUTION_VERSION = "ml_parent_solution_version";
        this.CAPABILITY_VALUE = "capability.value";
        this.SOLUTION_NAME = "solution_name";
        this.CAPABILITY_DEFINITION_BASE_TABLE = "ml_capability_definition_base";
        this.ML_SOLUTION_TABLE = "ml_solution";
        this.WORKFLOW_TRAINER = "workflow_trainer";
        this.AGENT_ZERO_TRAINER = "agent_zero_trainer";
        this.SOLUTION_PROPERTIES = "solution_properties";
        this.SCHEDULING_INFO = "schedulingInfo";
        this.USE_CASE = "useCase";
        this.AGENT_ZERO_WORKFLOW = "AgentZeroWorkflow";
        this.LANGUAGE_CODE = "task_creation_language_code";
        this.SOLUTION_NAME_LIST = "solutionNameList";
        this.LANGUAGE_X = "language_x";
        this.COMPOSITE = "composite";
        this.TEMPLATES = "templates";
        this.TEMPLATE_CONFIG = "templateConfig";
        this.SERVICES = "services";
        this.SERVICE_NAME = "serviceName";
        this.SERVICE_CONFIG = "serviceConfig";
        this.AUTO_RESOLUTION_PREDICTION_TABLE = "sys_cs_auto_resolution_prediction";
        this.AUTO_RESOLUTION_PREDICTION_OUTPUT_TABLE = "sys_cs_auto_resolution_prediction_output";
        this.AR_CONTEXT = "ar_context";
        this.PREDICTION = "prediction";
        this.SERVICE_MODEL_USED = "service_model_used";
        this.SERVICE_MODEL_SOLUTION_NAME = "service_model_solution_name";
        this.SERVICE_MODEL_SOLUTION_VERSION = "service_model_solution_version";
        this.SERVICE_CONFIG = "serviceConfig";
        this.SOLUTION_NAME_KEY = "solutionName";
        this.NLU = "NLU";
        this.AGENT_ZERO = "AgentZero";
        this.ALL_RECORDS = "All";
        this.OPTION = "options";
        this.CUSTOM_INTENTS = "customIntents";
        this.ACTIVE = "active";
        this.SOLUTION_VERSION = "version";
        this.SEPARATOR_CHAR = "|";
        this.ACTIVITIES = "activities";
        this.ACTIVITY_ID = "activityId";
        this.AGENT_ZERO_WORKFLOW_FIELD = "agent_zero_workflow";
        this.ACTION = "action";
        this.BOUND_SOLUTION_CONFIG = "boundSolutionConfig";
        this.METRIC_VERSION = "Vancouver 1.0";
        this.TASK_TYPE = "taskType";
        this.BINDINGS = "bindings";
        this.SCORE = "score";
        this.ITSM = "ITSM";
        this.TUNING_DETAILS = "tuningDetails";
        this.IS_SELF_TUNED = "isSelfTuned";
        this.IS_TUNED = "isTuned";

        // set frequency based on scheduled job
        try {
            this.FREQUENCY = parseInt(frequency);
            if (!this.FREQUENCY || this.FREQUENCY < 1) {
                throw 'Frequency ' + this.FREQUENCY + ' ';
            }
        } catch (error) {
            gs.info('ML Agent Zero Aggregation API: Error parsing frequency = ' + error);
            this.FREQUENCY = 7; // use default of 7 days
        }
        gs.info('ML Agent Zero Aggregation API: Input frequency = ' + frequency + ' days, Using frequency = ' + this.FREQUENCY + ' days');
    },

    /**
     * @function aggregateQualityMetricsPerIntent
     * @description generate quality metrics per intent for selftuning, 
     */
    generateQualityMetricsPerIntent: function(intents, iarResolvedPerIntent, acceptedPerIntent) {
        var qualityMetricsPerIntent = {};
        var len = intents.length;
        // for each intent of intents                
        for (var i = 0; i < len; i++) {
            var intent = intents[i];

            // calculate quality metrics for the intent
            tp = iarResolvedPerIntent[intent];
            fp = acceptedPerIntent[intent] - iarResolvedPerIntent[intent];

            qualityMetricsPerIntent[intent] = {};
            qualityMetricsPerIntent[intent]["tp"] = tp;
            qualityMetricsPerIntent[intent]["fp"] = fp;
        }
        return qualityMetricsPerIntent;
    },

    /**
     * @function aggregateRecords
     * @description Aggregate IAR context records into quality metrics and write to aggregation table. 
     * @returns {object} quality metrics and a list of workflow solution names for self-tuning
     */
    aggregateRecords: function() {
        // skip aggregation if required tables are missing
        if (!this.haveRequiredTables()) {
            gs.info('ML Agent Zero Aggregation API: Skipping aggregation because required tables are missing');
            return;
        }
        // skip aggregation if glide.platform_ml.disable_agent_zero_aggregation_api is true
        var disableAggregationApi = gs.getProperty('glide.platform_ml.disable_agent_zero_quality_metrics', false);
        if (disableAggregationApi === 'true') {
            gs.info('ML Agent Zero Aggregation API: Skipping aggregation because glide.platform_ml.disable_agent_zero_quality_metrics = true');
            return;
        }
        // getSolutionVersionsFromContextTable will be updated for the LanguageX
        var parentSolutionVersions = this.getSolutionVersionsFromContextTable();

        if (this.useMonthly) {
            gs.info('ML Agent Zero Aggregation API: Using monthly date queries');
        } else {
            gs.info('ML Agent Zero Aggregation API: Using daily date queries');
        }

        // aggregate workflow solution versions at Auto-Resolution Prediction Output level
        this.aggregateAgentZeroWorkflow(parentSolutionVersions);

        var returnObj = {};
        var solutionNameList = [];
        gs.info('The number of solution versions:' + parentSolutionVersions.length);

        for (var v = 0; v < parentSolutionVersions.length; v++) {
            // query context records within time frame for each solution version
            var solutionName = parentSolutionVersions[v][0];
            var solutionVersion = parentSolutionVersions[v][1];
            var language = parentSolutionVersions[v][2];

            // get Agent Zero workflow solution name from Agent Zero LanguageX solution
            var agentZeroSolutionName = this.getAgentZeroSolutionName(solutionName);
            // need to include agent zero solution names for the self-tuning 
            // add Agent Zero solution name to a list for the selftuning
            if (!this.isInclude(agentZeroSolutionName, solutionNameList)) {
                solutionNameList.push(agentZeroSolutionName);
            }

            // model_used gives the used service model of the given sys_id
            // that map is utilized when aggregating records for different levels
            var solutionMap = {};
            solutionMap = this.createSolutionMap(solutionName, solutionVersion);

            // aggragate records in two levels, NLU and ALL
            if (this.isNluSolutionDefined(solutionName)) {
                this.aggregateSolutionVersion(solutionName, solutionVersion, language, solutionMap, this.NLU, returnObj);
            }
            returnObj = this.aggregateSolutionVersion(solutionName, solutionVersion, language, solutionMap, this.ALL_RECORDS, returnObj);
        }

        returnObj[this.SOLUTION_NAME_LIST] = {};
        gs.info("Solution List:");
        gs.info(solutionNameList);

        returnObj[this.SOLUTION_NAME_LIST] = solutionNameList;
        return returnObj;
    },

    /**
     * 

     * 
     * @function getSolutionParentMap
     * 
     * @description Creates a mapping of child solution names to their corresponding parent solution names
     * @param solutionVersions {array} - include parent solution name, version and language
     * @returns solutionMap {object} - An object where keys are child solution names obtained from the getAgentZeroSolutionName method, and values are their corresponding parent solution info
     *
     */
    getSolutionParentMap: function(solutionVersions) {
        var parentSolutionMap = {};
        for (var i = 0; i < solutionVersions.length; i++) {
            var parentSolutionName = solutionVersions[i][0];
            var parentSolutionVersion = solutionVersions[i][1];
            var parentSolutionLanguage = solutionVersions[i][2];
            var solutionName = this.getAgentZeroSolutionName(parentSolutionName);
            parentSolutionMap[solutionName] = {
                parentSolutionName: parentSolutionName,
                parentSolutionVersion: parentSolutionVersion,
                parentSolutionLanguage: parentSolutionLanguage
            };
        }
        return parentSolutionMap;
    },

    /**
     * @function aggregateAgentZeroWorkflow
     * 
     * @description Aggregate IAR context records for Agent Zero workflow solution into quality metrics
     * Different aggregation method is provided for workflow solutions to perform self-tuning correctly
     * Agent Zero workflow solution can be re-trained between specified (one week default) aggregation interval, 
     * however sub-solution version is not available in the context table. 
     * @param {Array} parentSolutionVersions - inlcudes solution's parent name, version and language info
     */
    aggregateAgentZeroWorkflow: function(parentSolutionVersions) {
        var service = "AgentZero";
        var parentSolutionName = "";
        var parentSolutionVersion = "";
        var parentSolutionLanguage = "";
        // the map is created to get prediction model's solution name and version
        // for each record in the contex

        var solutionMap = this.createAutoResolutionPredictionOutputsMap();
        var solutionVersions = this.getSolutionVersionsFromAutoResolutionPredictionOutputsTable(service);
        var parentSolutionMap = this.getSolutionParentMap(parentSolutionVersions);
        for (var v = 0; v < solutionVersions.length; v++) {
            var solutionName = solutionVersions[v][0];
            var solutionVersion = solutionVersions[v][1];
            // the solution language will be the same as parent's solution language
            // therefore it is not included

            // check each record and context table and filter for each workflow solution version
            var gr = new GlideRecord(this.CONTEXT_TABLE);
            this.addDateQueries(gr);
            gr.addQuery(this.SYS_CLASS_NAME, '!=', this.SIMULATION);
            gr.query();
            gs.info('ML Agent Zero Aggregation API: Solution Name: ' + solutionName + ' Solution Version: ' + solutionVersion + ', Language: ' + parentSolutionLanguage + ', Encoded query used: ' + gr.getEncodedQuery());
            var metricData = this.initializeMetricData();
            while (gr.next()) {
                var sys_id = gr.getUniqueValue();

                // check glide record's corresponding sub-solution name and version from the map
                if (solutionMap[sys_id]['serviceModelSolutionName'] !== solutionName || solutionMap[sys_id]['serviceModelSolutionVersion'] !== solutionVersion) {
                    continue;
                }
                // the rest of the quality metric calculation is the same as parent solution aggregation
                metricData = this.countMetrics(metricData, gr, solutionMap);
            }
            var qualityMetrics = this.calculateMetrics(metricData);
            // get previous accumulator
            var accumulatorObj = {};
            var solutionMetricObj = {};
            // find current accumulator of the solution if exists
            var aggRecord = new GlideRecord(this.AGGREGATION_TABLE);
            aggRecord.addQuery(this.ML_SOLUTION_NAME, solutionName);
            aggRecord.orderByDesc("sys_created_on");
            aggRecord.setLimit(1);
            aggRecord.query();
            var count = 0;
            if (aggRecord.next()) {
                solutionMetricObj = JSON.parse(aggRecord.getValue(this.SOLUTION_METRICS));
                // solution metrics includes the accumulator key
                accumulatorObj = solutionMetricObj["accumulator"];
                count++;
            }
            // if there is no previous record, then create a new accumulator key and initiliaze it
            if (accumulatorObj == null || count == 0) {
                var len = metricData["intents"].length;
                for (var i = 0; i < len; i++) {
                    var currIntent = metricData["intents"][i];
                    // initiliaze the accumulator
                    accumulatorObj[currIntent] = {};
                    accumulatorObj[currIntent]["tp"] = 0;
                    accumulatorObj[currIntent]["fp"] = 0;
                }
            }
            var solutionMetrics = qualityMetrics["solutionMetrics"];
            solutionMetrics["accumulator"] = {};
            solutionMetrics["accumulator"] = accumulatorObj;
            solutionMetrics["qualityMetricsPerIntent"] = {};
            solutionMetrics["qualityMetricsPerIntent"] = this.generateQualityMetricsPerIntent(metricData["intents"], metricData["iarResolvedPerIntent"], metricData["acceptedPerIntent"]);

            parentSolutionName = parentSolutionMap[solutionName].parentSolutionName;
            parentSolutionVersion = parentSolutionMap[solutionName].parentSolutionVersion;
            parentSolutionLanguage = parentSolutionMap[solutionName].parentSolutionLanguage;

            // add source information to differentiate different level of logs
            var source = {};
            source["model"] = this.AGENT_ZERO;
            source["taskType"] = this.getAgentZeroTaskType(parentSolutionName);
            source["metricVersion"] = this.METRIC_VERSION;
            var tuning = this.getAgentZeroTuningDetails(parentSolutionName);

            // add tuning details in the solution properties if any
            if (tuning.hasOwnProperty("isTuned")) {
                source["isTuned"] = tuning.isTuned;
            }
            if (tuning.hasOwnProperty("tuningDetails")) {
                source["tuningDetails"] = tuning.tuningDetails;
            }
            if (tuning.hasOwnProperty("isSelfTuned")) {
                source["isSelfTuned"] = tuning.isSelfTuned;
            }
            solutionMetrics["source"] = source;

            // write records to aggregation table
            this.writeRecords(solutionName, parentSolutionName, solutionVersion, parentSolutionVersion, parentSolutionLanguage, qualityMetrics["start"], qualityMetrics["end"], qualityMetrics["acceptances"], qualityMetrics["correct"], qualityMetrics["coverage"], qualityMetrics["topicCoverage"], qualityMetrics["withoutTopic"], qualityMetrics["resolutions"], qualityMetrics["rows"], JSON.stringify(solutionMetrics));
        }
    },
    /**
     * @function countMetrics
     * @description aggregate data for the quality metrics
     * @param metricData {object} - aggregated data for quality metrics
     * @param gr {GlideRecord} - Glide record from the context table
     * @returns {object} - aggregated data for the quality metric calculation
     *
     */
    countMetrics: function(metricData, gr, solutionMap) {
        var resolved = this.NOT_RESOLVED;
        // check if notification_state is accepted or declined
        var notificationState = gr.getValue(this.NOTIFICATION_STATE);
        var intent = gr.getValue(this.NLU_INTENT);
        var intentTopicState = gr.getValue(this.INTENT_TOPIC_STATE);

        if (notificationState === this.ACCEPTED) {
            // increment accepted count
            metricData["accepted"]++;
            // increment accepted count for the intent
            if (!gs.nil(intent) && !gs.nil(intent.trim()) && this.isInclude(intent, metricData["intents"])) {
                metricData["acceptedPerIntent"][intent]++;
            }
            if (gr.getDisplayValue(this.TASK_RESOLVED) === "true") {
                // increment IAR Resolved if notification_state==accepted && task_resolved==true
                metricData["iarResolved"]++;
                // inrement IAR Resolved for the intent
                if (!gs.nil(intent) && !gs.nil(intent.trim()) && this.isInclude(intent, metricData["intents"])) {
                    metricData["iarResolvedPerIntent"][intent]++;
                }
                resolved = this.RESOLVED;
            }
        } else if (notificationState === this.DECLINED) {
            // increment declined count
            metricData["declined"]++;
        }
        // check if intent matched supported topic
        if (intentTopicState === this.INTENT_WITH_TOPIC) {
            // increment supported Topic count for intents with topics
            metricData["supportedTopic"]++;
        } else if (intentTopicState === this.INTENT_WITHOUT_TOPIC) {
            // increment intents without topic count
            metricData["intentWithoutTopic"]++;
        }
        // increment total row count
        metricData["rows"]++;

        // check supported intents and store prediction confidences

        if (!gs.nil(intent) && !gs.nil(intent.trim())) {
            intent = intent.trim();
            // check if supported intent returned
            if (!intent.includes(this.A0_UNSUPPORTED)) {
                // add intent to the intents if it has not already added.
                if (!this.isInclude(intent, metricData["intents"])) {
                    // initialize iarResolved and accepted counters per intent
                    metricData["iarResolvedPerIntent"][intent] = 0;
                    metricData["acceptedPerIntent"][intent] = 0;
                    metricData["intents"].push(intent);
                }
                // increment supported count for intents with topics
                metricData["supported"]++;
            }
            // store prediction confidences
            // get predicted confidence for task from prediction results table
            var predictedConfidence = solutionMap[gr.getUniqueValue()]['score'];

            if (!gs.nil(predictedConfidence)) {
                // add map for predicted intent in resolved/not_resolved map
                if (!(intent in metricData["predictionConfidences"][resolved])) {
                    var intentConfidencesResolved = {};
                    intentConfidencesResolved[this.CONFIDENCE_SCORES] = [];
                    metricData["predictionConfidences"][resolved][intent] = intentConfidencesResolved;
                }
                // add map for all in resolved/not_resolved map
                if (!(this.ALL in metricData["predictionConfidences"][resolved])) {
                    var allConfidencesResolved = {};
                    allConfidencesResolved[this.CONFIDENCE_SCORES] = [];
                    metricData["predictionConfidences"][resolved][this.ALL] = allConfidencesResolved;
                }
                // add map for predicted intent in all map
                if (!(intent in metricData["predictionConfidences"][this.ALL])) {
                    var allIntentConfidences = {};
                    metricData["predictionConfidences"][this.CONFIDENCE_SCORES] = [];
                    metricData["predictionConfidences"][this.ALL][intent] = allIntentConfidences;
                }
                // add map for all in all map
                if (!(this.ALL in metricData["predictionConfidences"][this.ALL])) {
                    var allConfidences = {};
                    allConfidences[this.CONFIDENCE_SCORES] = [];
                    metricData["predictionConfidences"][this.ALL][this.ALL] = allConfidences;
                }
                // add confidence to intent map in resolved/not_resolved
                metricData["predictionConfidences"][resolved][intent][this.CONFIDENCE_SCORES].push(predictedConfidence);
                // add confidence to all map in resolved/not_resolved
                metricData["predictionConfidences"][resolved][this.ALL][this.CONFIDENCE_SCORES].push(predictedConfidence);
                // add confidence to intent map in all
                metricData["predictionConfidences"][this.ALL][intent][this.CONFIDENCE_SCORES].push(predictedConfidence);
                // add confidence to all map in all
                metricData["predictionConfidences"][this.ALL][this.ALL][this.CONFIDENCE_SCORES].push(predictedConfidence);
            }
        }
        return metricData;
    },
    /**
     * @function calculateMetrics
     * @description Calculate quality metrics
     * @param metricData {object} - aggregated data for quality metrics
     * @returns {object} - includes quality metrics
     *
     */
    calculateMetrics: function(metricData) {
        var dates = this.getStartEndDates();
        var start = dates[this.START];
        var end = dates[this.END];
        var acceptances = 0;
        var correct = 0;
        var coverage = 0;
        var topicCoverage = 0;
        var withoutTopic = 0;
        var resolutions = 0;
        var solutionMetrics = {};
        solutionMetrics[this.CONFIDENCE_SCORES] = this.getConfidenceScores(metricData["predictionConfidences"]);
        if (metricData["rows"] > 0) {
            // calculate quality metrics for language
            var acceptedDeclined = metricData["accepted"] + metricData["declined"];
            acceptances = this.isNumber((metricData["accepted"] * 1.0) / acceptedDeclined);
            correct = this.isNumber((metricData["iarResolved"] * 1.0) / acceptedDeclined);
            coverage = this.isNumber((metricData["supported"] * 1.0) / metricData["rows"]);
            topicCoverage = this.isNumber((metricData["supportedTopic"] * 1.0) / metricData["rows"]);
            withoutTopic = this.isNumber((metricData["intentWithoutTopic"] * 1.0) / metricData["rows"]);
            resolutions = this.isNumber((metricData["iarResolved"] * 1.0) / metricData["rows"]);
        }
        var qualityMetrics = {};
        qualityMetrics["acceptances"] = acceptances;
        qualityMetrics["correct"] = correct;
        qualityMetrics["coverage"] = coverage;
        qualityMetrics["topicCoverage"] = topicCoverage;
        qualityMetrics["withoutTopic"] = withoutTopic;
        qualityMetrics["resolutions"] = resolutions;
        qualityMetrics["start"] = start;
        qualityMetrics["end"] = end;
        qualityMetrics["rows"] = metricData["rows"];
        qualityMetrics["solutionMetrics"] = solutionMetrics;
        return qualityMetrics;
    },
    /**
     * @function initializeMetricData
     * @description creates and initialize data object
     * @returns {object} - includes quality metrics initlialized data for the aggregation
     *
     */
    initializeMetricData: function() {
        var metricData = {};
        metricData["accepted"] = 0;
        metricData["declined"] = 0;
        metricData["supported"] = 0;
        metricData["supportedTopic"] = 0;
        metricData["intentWithoutTopic"] = 0;
        metricData["iarResolved"] = 0;
        metricData["rows"] = 0;

        metricData["iarResolvedPerIntent"] = {};
        metricData["acceptedPerIntent"] = {};
        metricData["intents"] = [];

        metricData["predictionConfidences"] = {}
        metricData["predictionConfidences"][this.RESOLVED] = {};
        metricData["predictionConfidences"][this.NOT_RESOLVED] = {};
        metricData["predictionConfidences"][this.ALL] = {};
        return metricData;
    },
    /**
     * @function haveRequiredTables
     * @description Returns whether instance has required tables for aggregation
     * @returns {boolean} - are all required tables are available
     *
     */
    haveRequiredTables: function() {
        return GlideTableDescriptor.isValid(this.CONTEXT_TABLE) &&
            GlideTableDescriptor.isValid(this.AGGREGATION_TABLE) &&
            GlideTableDescriptor.isValid(this.CONFIGURATION_LANGUAGE_TABLE) &&
            GlideTableDescriptor.isValid(this.AUTO_RESOLUTION_PREDICTION_TABLE) &&
            GlideTableDescriptor.isValid(this.AUTO_RESOLUTION_PREDICTION_OUTPUT_TABLE);
    },
    /**
     * @function aggregateSolutionVersion
     * @description Aggregate quality metrics in diffent scopes
     * @param solutionName {string} - parent solution name
     * @param solutionVersion {string} - parent solution version
     * @param language {string} - solution lanaguage
     * @param solutionMap {array} - sys_id --> ModelUsed map 
     * @param scope {string} - service scope of the aggregation 
     * @param returnObj {object} - accumulated output
     * @returns {object} updated returnObj
     * 
     */
    aggregateSolutionVersion: function(solutionName, solutionVersion, language, solutionMap, scope, returnObj) {
        var parentSolutionName = solutionName;
        var parentSolutionVersion = solutionVersion;
        var gr = new GlideRecord(this.CONTEXT_TABLE);
        this.addDateQueries(gr);
        gr.addQuery(this.SYS_CLASS_NAME, '!=', this.SIMULATION);
        gr.addQuery(this.ML_SOLUTION_NAME, solutionName);
        gr.addQuery(this.ML_SOLUTION_VERSION, solutionVersion);
        gr.query();
        gs.info('ML Agent Zero Aggregation API: Solution Name: ' + solutionName + ' Solution Version: ' + solutionVersion + ', Language: ' + language + ', Encoded query used: ' + gr.getEncodedQuery());
        var metricData = this.initializeMetricData();

        while (gr.next()) {
            var sys_id = gr.getUniqueValue();
            if (scope != this.ALL_RECORDS && solutionMap[sys_id]['serviceModelUsed'] != scope) {
                continue;
            }
            metricData = this.countMetrics(metricData, gr, solutionMap);
        }
        var qualityMetrics = this.calculateMetrics(metricData);
        var solutionMetrics = qualityMetrics["solutionMetrics"];
        // add source information to differentiate diffent level of logs
        var source = {};
        source["model"] = this.ALL_RECORDS;
        source["taskType"] = this.getAgentZeroTaskType(parentSolutionName);
        source["metricVersion"] = this.METRIC_VERSION;

        if (scope === this.NLU) {
            // get all concatenated NLU solution names
            solutionName = this.getNLUSolutionNames(parentSolutionName);
            solutionVersion = this.getNLUSolutionVersions(parentSolutionName);
            source["model"] = this.NLU;
        }

        solutionMetrics["source"] = source;
        // write records to aggregation table
        this.writeRecords(solutionName, parentSolutionName, solutionVersion, parentSolutionVersion, language, qualityMetrics["start"], qualityMetrics["end"], qualityMetrics["acceptances"], qualityMetrics["correct"], qualityMetrics["coverage"], qualityMetrics["topicCoverage"], qualityMetrics["withoutTopic"], qualityMetrics["resolutions"], qualityMetrics["rows"], JSON.stringify(solutionMetrics));

        // log quality metrics for language
        gs.info('ML Agent Zero Aggregation API: Solution Name: ' + solutionName + ', Solution Version: ' + solutionVersion + ', Start: ' + qualityMetrics["start"] + ', End: ' + qualityMetrics["end"] + ', Acceptances: ' + qualityMetrics["acceptances"] + ', Correct: ' + qualityMetrics["correct"] + ', Coverage: ' + qualityMetrics["coverage"] + ', Topic coverage: ' + qualityMetrics["topicCoverage"] + ', Without topic: ' + qualityMetrics["withoutTopic"] + ', Resolutions: ' + qualityMetrics["resolutions"] + ', Rows: ' + qualityMetrics["rows"] + ', Solution metrics: ' + JSON.stringify(solutionMetrics));
        // return quality metrics as map
        if (scope != this.ALL_RECORDS) {
            if (returnObj[this.ML_SOLUTION_NAME] == null)
                returnObj[this.ML_SOLUTION_NAME] = {};
            returnObj[this.ML_SOLUTION_NAME][this.ML_SOLUTION_VERSION] = {};
            returnObj[this.ML_SOLUTION_NAME][this.ML_SOLUTION_VERSION][this.LANGUAGE] = language;
            returnObj[this.ML_SOLUTION_NAME][this.ML_SOLUTION_VERSION][this.START] = metricData["start"];
            returnObj[this.ML_SOLUTION_NAME][this.ML_SOLUTION_VERSION][this.END] = metricData["end"];
            returnObj[this.ML_SOLUTION_NAME][this.ML_SOLUTION_VERSION][this.ACCEPTANCES] = metricData["acceptances"];
            returnObj[this.ML_SOLUTION_NAME][this.ML_SOLUTION_VERSION][this.CORRECT] = metricData["correct"];
            returnObj[this.ML_SOLUTION_NAME][this.ML_SOLUTION_VERSION][this.COVERAGE] = metricData["coverage"];
            returnObj[this.ML_SOLUTION_NAME][this.ML_SOLUTION_VERSION][this.TOPIC_COVERAGE] = metricData["topicCoverage"];
            returnObj[this.ML_SOLUTION_NAME][this.ML_SOLUTION_VERSION][this.WITHOUT_TOPIC] = metricData["withoutTopic"];
            returnObj[this.ML_SOLUTION_NAME][this.ML_SOLUTION_VERSION][this.RESOLUTIONS] = metricData["resolutions"];
            returnObj[this.ML_SOLUTION_NAME][this.ML_SOLUTION_VERSION][this.ROWS] = metricData["rows"];
            returnObj[this.ML_SOLUTION_NAME][this.ML_SOLUTION_VERSION][this.SOLUTION_METRICS] = solutionMetrics;
        }
        return returnObj;
    },
    /**
     * @function createSolutionMap
     * @description creates a sys_id model_used map
     * @param solutionName {string} - parent solution name
     * @param solutionVersion {string} - parent solution version
     * @returns {array} sys_id model_used map
     *
     */
    createSolutionMap: function(solutionName, solutionVersion) {
        // generate sys_id - solution map
        var solutionMap = {};
        var gr = new GlideRecord(this.CONTEXT_TABLE);
        this.addDateQueries(gr);
        gr.addQuery(this.SYS_CLASS_NAME, '!=', this.SIMULATION);
        gr.addQuery(this.ML_SOLUTION_NAME, solutionName);
        gr.addQuery(this.ML_SOLUTION_VERSION, solutionVersion);
        gr.query();
        while (gr.next()) {
            var contextSysId = gr.getUniqueValue();
            // ar_context keeps the corresponding record of sys_id in the context table
            var gr_res_pred = new GlideRecord(this.AUTO_RESOLUTION_PREDICTION_TABLE);
            gr_res_pred.addQuery(this.AR_CONTEXT, contextSysId);
            gr_res_pred.query();
            if (gr_res_pred.next()) {
                var resPredSysId = gr_res_pred.getUniqueValue();
                // using the sys_id, query prediction field to get serviceModelUsed
                var gr_res_pred_out = new GlideRecord(this.AUTO_RESOLUTION_PREDICTION_OUTPUT_TABLE);
                gr_res_pred_out.addQuery(this.PREDICTION, resPredSysId);
                gr_res_pred_out.query();
                if (gr_res_pred_out.next()) {
                    var serviceModelUsed = gr_res_pred_out.getValue(this.SERVICE_MODEL_USED);
                    var score = gr_res_pred_out.getValue(this.SCORE);
                    var solutionMapObject = {};
                    solutionMapObject['serviceModelUsed'] = serviceModelUsed;
                    solutionMapObject['score'] = score;
                    solutionMap[contextSysId] = solutionMapObject;
                }
            }
        }
        return solutionMap;
    },
    /**
     * @function createSolutionMap
     * @description creates a sys_id model_used map
     * @returns {array} sys_id model's info map
     *
     */
    createAutoResolutionPredictionOutputsMap: function() {
        var solutionMap = {};
        var gr = new GlideRecord(this.CONTEXT_TABLE);
        this.addDateQueries(gr);
        gr.addQuery(this.SYS_CLASS_NAME, '!=', this.SIMULATION);
        gr.query();
        while (gr.next()) {
            var contextSysId = gr.getUniqueValue();
            // ar_context keeps the corresponding record of sys_id in the context table
            var gr_res_pred = new GlideRecord(this.AUTO_RESOLUTION_PREDICTION_TABLE);
            gr_res_pred.addQuery(this.AR_CONTEXT, contextSysId);
            gr_res_pred.query();
            if (gr_res_pred.next()) {
                var resPredSysId = gr_res_pred.getUniqueValue();
                // using the sys_id, query prediction field to get serviceModelUsed
                var gr_res_pred_out = new GlideRecord(this.AUTO_RESOLUTION_PREDICTION_OUTPUT_TABLE);
                gr_res_pred_out.addQuery(this.PREDICTION, resPredSysId);
                gr_res_pred_out.query();
                if (gr_res_pred_out.next()) {
                    var solutionMapObject = {};
                    solutionMapObject['serviceModelUsed'] = gr_res_pred_out.getValue(this.SERVICE_MODEL_USED);
                    solutionMapObject['score'] = gr_res_pred_out.getValue(this.SCORE);
                    solutionMapObject['serviceModelSolutionName'] = gr_res_pred_out.getValue(this.SERVICE_MODEL_SOLUTION_NAME);
                    solutionMapObject['serviceModelSolutionVersion'] = gr_res_pred_out.getValue(this.SERVICE_MODEL_SOLUTION_VERSION);
                    solutionMap[contextSysId] = solutionMapObject;
                }
            }
        }
        return solutionMap;
    },
    /**
     * @function getAgentZeroSolutionName
     * @description Get Agent Zero workflow solution name for a given Agent Zero parent solution name
     * @param parentSolutionName {string} - parent solution name
     * @returns {string} Agent Zero workflow solution name
     *
     */
    getAgentZeroSolutionName: function(parentSolutionName) {
        var solutionName = "";
        var gr = new GlideRecord(this.CAPABILITY_DEFINITION_BASE_TABLE);
        gr.addQuery(this.SOLUTION_NAME, parentSolutionName);
        gr.addQuery(this.CAPABILITY_VALUE, this.COMPOSITE);
        gr.addQuery(this.ACTIVE, true);
        gr.query();
        if (gr.next()) {
            var solutionProperties = JSON.parse(gr.getValue(this.SOLUTION_PROPERTIES));

            var activityArrray = solutionProperties[this.ACTIVITIES];
            gs.info(activityArrray.length);
            for (var i = 0; i < activityArrray.length; i++) {
                var obj = activityArrray[i];
                if (obj.hasOwnProperty(this.ACTIVITY_ID)) {
                    if (obj[this.ACTIVITY_ID] === this.AGENT_ZERO_WORKFLOW_FIELD) {
                        solutionName = obj[this.ACTION][this.BOUND_SOLUTION_CONFIG][this.SOLUTION_NAME_KEY];
                    }
                }
            }
        }
        return solutionName;
    },
    /**
     * @function getNLUSolutionNames
     * @description Get concatenated NLU solution names for a given Agent Zero LanguageX solution name
     * @param parentSolutionName {string} - parent solution name
     * @returns {string} NLU solution names concatenated with the | separator 
     *
     */
    getNLUSolutionNames: function(parentSolutionName) {
        var solutionName = "";
        var gr = new GlideRecord(this.CAPABILITY_DEFINITION_BASE_TABLE);
        gr.addQuery(this.SOLUTION_NAME, parentSolutionName);
        gr.addQuery(this.CAPABILITY_VALUE, this.COMPOSITE);
        gr.addQuery(this.ACTIVE, true);
        gr.query();
        if (gr.next()) {
            var solutionProperties = JSON.parse(gr.getValue(this.SOLUTION_PROPERTIES));

            if (solutionProperties.hasOwnProperty(this.BINDINGS)) {
                var nluSolutionNames = solutionProperties[this.BINDINGS];
                for (var i = 0; i < nluSolutionNames.length; i++) {
                    solutionName = solutionName + nluSolutionNames[i][this.SOLUTION_NAME_KEY];
                    if (i != nluSolutionNames.length - 1) {
                        solutionName = solutionName + this.SEPARATOR_CHAR;
                    }
                }
            }
        }
        return solutionName;
    },
    /**
     * @function getNLUSolutionVersion
     * @description Get concatenated NLU solution versions for a given Agent Zero Composite solution name
     * @param parentSolutionName {string} - parent solution name
     * @returns {string} NLU solution versions concatenated with the | separator 
     *
     */
    getNLUSolutionVersions: function(parentSolutionName) {
        var versions = "";
        var gr = new GlideRecord(this.CAPABILITY_DEFINITION_BASE_TABLE);
        gr.addQuery(this.SOLUTION_NAME, parentSolutionName);
        gr.addQuery(this.CAPABILITY_VALUE, this.COMPOSITE);
        gr.addQuery(this.ACTIVE, true);
        gr.query();
        if (gr.next()) {
            var solutionProperties = JSON.parse(gr.getValue(this.SOLUTION_PROPERTIES));

            if (solutionProperties.hasOwnProperty(this.BINDINGS)) {
                var nluSolutionNames = solutionProperties[this.BINDINGS];
                for (var i = 0; i < nluSolutionNames.length; i++) {
                    var solutionName = nluSolutionNames[i][this.SOLUTION_NAME_KEY];
                    versions = versions + this.getActiveVersionNumber(solutionName);
                    if (i != nluSolutionNames.length - 1) {
                        versions = versions + this.SEPARATOR_CHAR;
                    }
                }
            }
        }
        return versions;
    },
    /**
     * @function getLanguages
     * @description Get unique languages from IAR configuration language and context tables.
     * @returns {array} array of unique language codes, empty array if not found
     *
     */
    getLanguages: function() {
        var configurationLanguages = this.getLanguagesFromConfigurationTable();
        var contextLanguages = this.getLanguagesFromContextTable();
        var languages = configurationLanguages.concat(contextLanguages);
        var languagesDict = {};
        for (var i = 0; i < languages.length; i++) {
            languagesDict[languages[i]] = i;
        }
        return Object.keys(languagesDict);
    },
    /**
     * @function getLanguagesFromConfigurationTable
     * @description Get unique languages from IAR configuration language table.
     * @returns {array} array of unique language codes, empty array if not found
     *
     */
    getLanguagesFromConfigurationTable: function() {
        var uniqueLanguages = [];
        var gr = new GlideRecord(this.CONFIGURATION_LANGUAGE_TABLE);
        gr.addActiveQuery();
        gr.query();
        while (gr.next()) {
            uniqueLanguages.push(gr.getDisplayValue(this.TRAINING_LANGUAGE));
        }
        return uniqueLanguages;
    },
    /**
     * @function getSolutionVersionsFromAutoResolutionPredictionOutputsTable
     * @description Get unique solution versions from IAR Auto-Resolution Prediction Output table
     * @param service {string} - service model used: either AgentZero or NLU
     * @returns {array} array of unique solution name and versions
     *
     */
    getSolutionVersionsFromAutoResolutionPredictionOutputsTable: function(service) {
        var uniqueSolutionVersions = [];
        var groupingAttributeSolutionName = this.SERVICE_MODEL_SOLUTION_NAME;
        var groupingAttributeSolutionVersion = this.SERVICE_MODEL_SOLUTION_VERSION;

        var ga = new GlideAggregate(this.AUTO_RESOLUTION_PREDICTION_OUTPUT_TABLE);

        ga.addAggregate('COUNT');
        this.addDateQueries(ga);
        ga.addQuery(this.SERVICE_MODEL_USED, service);
        ga.groupBy(groupingAttributeSolutionName);
        ga.groupBy(groupingAttributeSolutionVersion);
        ga.addHaving('COUNT', '>', '0'); // get only values where count is more than 1
        ga.query();
        gs.info('ML Agent Zero Aggregation API: getSolutionVersionsFromAutoResolutionPredictionOutputsTable(): Encoded query used: ' + ga.getEncodedQuery());
        while (ga.next()) {
            var entry = [ga.getDisplayValue(groupingAttributeSolutionName), ga.getDisplayValue(groupingAttributeSolutionVersion)];
            uniqueSolutionVersions.push(entry); // add the value to the array       
        }
        var len = uniqueSolutionVersions.length;
        for (var i = 0; i < len; i++) {
            gs.info("Agent Zero Workflow Solution Name: " + uniqueSolutionVersions[i][0] + " ,Version: " + uniqueSolutionVersions[i][1]);
        }
        return uniqueSolutionVersions;
    },
    /**
     * @function getSolutionVersionsFromContextTable
     * @description Get unique solution versions from IAR context table.
     * @returns {array} array of unique language codes, empty array if not found
     *
     */
    getSolutionVersionsFromContextTable: function() {
        var uniqueSolutionVersions = [];
        var groupingAttributeSolutionName = this.ML_SOLUTION_NAME;
        var groupingAttributeSolutionVersion = this.ML_SOLUTION_VERSION;
        var groupingAttributeSolutionLanguage = this.LANGUAGE_CODE;

        var ga = new GlideAggregate(this.CONTEXT_TABLE);
        ga.addAggregate('COUNT');
        this.addDateQueries(ga);
        ga.addQuery(this.SYS_CLASS_NAME, '!=', this.SIMULATION);
        ga.groupBy(groupingAttributeSolutionName);
        ga.groupBy(groupingAttributeSolutionVersion);
        ga.groupBy(groupingAttributeSolutionLanguage);
        ga.addHaving('COUNT', '>', '0'); // get only values where count is more than 1
        ga.query();
        gs.info('ML Agent Zero Aggregation API: getSolutionVersionsFromContextTable(): Encoded query used: ' + ga.getEncodedQuery());
        while (ga.next()) {
            // check if the row is for a unique value and not for an overall count
            if (this.isAggregateSolution(ga.getDisplayValue(groupingAttributeSolutionName))) {
                var entry = [ga.getDisplayValue(groupingAttributeSolutionName), ga.getDisplayValue(groupingAttributeSolutionVersion), ga.getDisplayValue(groupingAttributeSolutionLanguage)];
                uniqueSolutionVersions.push(entry); // add the value to the array
            }
        }
        var len = uniqueSolutionVersions.length;
        for (var i = 0; i < len; i++) {
            gs.info("Solution name: " + uniqueSolutionVersions[i][0] + " ,Version: " + uniqueSolutionVersions[i][1] + " ,Language: " + uniqueSolutionVersions[i][2]);
        }
        return uniqueSolutionVersions;
    },
    /**
     * @function getAgentZeroTuningDetails
     * @description Gets tuning detail of the given parent solution name
     * @param parentSolutionName {string} - composite solution name
     * @returns {string} tuningDetails
     *
     */
    getAgentZeroTuningDetails: function(parentSolutionName) {
        var tuning = {};
        var agentZeroSolutionName = this.getAgentZeroSolutionName(parentSolutionName);
        var gr = new GlideRecord(this.ML_SOLUTION_TABLE);
        gr.addQuery(this.SOLUTION_NAME, agentZeroSolutionName);
        gr.addQuery(this.ACTIVE, true);
        gr.query();
        if (gr.next()) {
            var solutionProperties = JSON.parse(gr.getValue(this.SOLUTION_PROPERTIES));

            if (solutionProperties.hasOwnProperty(this.IS_TUNED)) {
                tuning[this.IS_TUNED] = solutionProperties[this.IS_TUNED];
            }
            if (solutionProperties.hasOwnProperty(this.TUNING_DETAILS)) {
                tuning[this.TUNING_DETAILS] = solutionProperties[this.TUNING_DETAILS];
            }
            if (solutionProperties.hasOwnProperty(this.IS_SELF_TUNED)) {
                tuning[this.IS_SELF_TUNED] = solutionProperties[this.IS_SELF_TUNED];
            }
        }
        return tuning;
    },
    /**
     * @function getAgentZeroTaskType
     * @description Gets the task type of the given composite solution name
     * @param parentSolutionName {string} - composite solution name
     * @returns {string} task type, either ITSM or HR
     *
     */
    getAgentZeroTaskType: function(parentSolutionName) {
        var agentZeroSolutionName = this.getAgentZeroSolutionName(parentSolutionName);
        var taskType = "";
        var gr = new GlideRecord(this.CAPABILITY_DEFINITION_BASE_TABLE);
        gr.addQuery(this.SOLUTION_NAME, agentZeroSolutionName);
        gr.query();
        if (gr.next()) {
            var solutionProperties = JSON.parse(gr.getValue(this.SOLUTION_PROPERTIES));
            try {
                taskType = solutionProperties['taskType'];

            } catch (e) {
                gs.info("An error occurred when getting task type: " + e.message);
                taskType = "ITSM";
            }
        }
        return taskType;
    },
    /**
     * @function writeRecords
     * @description Write quality metrics for a language to aggregation table
     * @param solutionName {string} - name of the A0 solution
     * @param solutionVersion {string} - version of the A0 solution
     * @param language {string} - language of the A0 solution
     * @param start {string} - start date of context records
     * @param end {string} - end date of context records
     * @param acceptances {float} - % of acceptances out of all accepts and declines
     * @param correct {float} - % of resolutions out of all accepts and declines
     * @param coverage {float} - calculated coverage
     * @param topicCoverage {float} - calculated topic coverage
     * @param withoutTopic {float} - % of incidents that have intent without topic
     * @param resolutions {integer} - % of resolutions out of all rows
     * @param rows {integer} - # of rows in aggregation batch
     * @param solutionMetrics {string} - json of selftuning metrics
     * @param
     * 
     */
    writeRecords: function(solutionName, parentSolutionName, solutionVersion, parentSolutionVersion, language, start, end, acceptances, correct, coverage, topicCoverage, withoutTopic, resolutions, rows, solutionMetrics) {
        var gr = new GlideRecord(this.AGGREGATION_TABLE);
        gr.initialize();
        gr.setValue(this.ML_SOLUTION_NAME, solutionName);
        gr.setValue(this.ML_PARENT_SOLUTION_NAME, parentSolutionName);
        gr.setValue(this.ML_SOLUTION_VERSION, solutionVersion);
        gr.setValue(this.ML_PARENT_SOLUTION_VERSION, parentSolutionVersion);
        gr.setValue(this.LANGUAGE, language);
        gr.setValue(this.START, start);
        gr.setValue(this.END, end);
        gr.setValue(this.ACCEPTANCES, acceptances);
        gr.setValue(this.CORRECT, correct);
        gr.setValue(this.COVERAGE, coverage);
        gr.setValue(this.TOPIC_COVERAGE, topicCoverage);
        gr.setValue(this.WITHOUT_TOPIC, withoutTopic);
        gr.setValue(this.RESOLUTIONS, resolutions);
        gr.setValue(this.ROWS, rows);
        gr.setValue(this.SOLUTION_METRICS, solutionMetrics);
        gr.insert();
    },
    /**
     * @function isNumber
     * @description Checks if value is a number. If it isn't, return -1.
     * @param value - var to check if it's a number
     *
     */
    isNumber: function(value) {
        if (isNaN(value)) {
            return -1;
        }
        return value;
    },
    /**
     * @function useMonthly
     * @description Setter for useMonthly var, to use last month as time range
     * for querying and aggregating context records
     * @param useMonthly - boolean value to use monthly or not
     *
     */
    setUseMonthly: function(useMonthly) {
        this.useMonthly = useMonthly;
    },
    /**
     * @function addDateQueries
     * @description Add date queries to glideObject
     * @param glideObject - glideRecord or glideAggregate to add queries to
     *
     */
    addDateQueries: function(glideObject) {
        var dates = this.getStartEndDates();
        glideObject.addQuery(this.SYS_CREATED_ON, '>=', dates[this.START]);
        glideObject.addQuery(this.SYS_CREATED_ON, '<=', dates[this.END]);
    },
    /**
     * @function getStartEndDates
     * @description Get start and end dates, either daily or monthly, for querying context records
     *
     */
    getStartEndDates: function() {
        var dates = {};
        if (this.useMonthly) {
            dates[this.START] = gs.beginningOfLastMonth();
            dates[this.END] = gs.endOfLastMonth();
        } else {
            dates[this.START] = gs.daysAgoStart(this.FREQUENCY);
            dates[this.END] = gs.daysAgoEnd(this.DAYS_AGO_END);
        }
        return dates;
    },
    /**
     * @function getConfidenceScores
     * @description Get conifdience score metrics for each confidence groups (resolved, not_resolved, all)
     * @param predictionConfidences - map of prediction confidences for each group
     *
     */
    getConfidenceScores: function(predictionConfidences) {
        var confidenceScores = {};
        confidenceScores[this.RESOLVED] = this.computeConfidenceMetrics(predictionConfidences[this.RESOLVED]);
        confidenceScores[this.NOT_RESOLVED] = this.computeConfidenceMetrics(predictionConfidences[this.NOT_RESOLVED]);
        confidenceScores[this.ALL] = this.computeConfidenceMetrics(predictionConfidences[this.ALL]);
        return confidenceScores;
    },
    /**
     * @function computeConfidenceMetrics
     * @description Compute metrics for a confidence groups (either resolved, not_resolved, or all)
     * @param intentConfidenceMaps - map of prediction confidences for a group
     *
     */
    computeConfidenceMetrics: function(intentConfidenceMaps) {
        // return empty map if intentConfidenceMaps is null or has no keys
        if (gs.nil(intentConfidenceMaps)) {
            return {};
        }
        var confidenceMetrics = {};
        var intentKeys = Object.keys(intentConfidenceMaps);
        for (var i = 0; i < intentKeys.length; i++) {
            var intentKey = intentKeys[i];
            var intentMap = intentConfidenceMaps[intentKey];
            if (!(this.CONFIDENCE_SCORES in intentMap) || gs.nil(intentMap[this.CONFIDENCE_SCORES])) {
                continue;
            }
            // compute confidence metrics using confidence array
            var intentConfidenceMetrics = {};
            var intentConfidences = intentMap[this.CONFIDENCE_SCORES];
            intentConfidences = intentConfidences.map(parseFloat);
            intentConfidenceMetrics[this.AVERAGE] = this.computeAverage(intentConfidences);
            intentConfidenceMetrics[this.MEDIAN] = this.computeMedian(intentConfidences, true);
            intentConfidenceMetrics[this.MIN] = this.findMin(intentConfidences, false);
            intentConfidenceMetrics[this.MAX] = this.findMax(intentConfidences, false);
            intentConfidenceMetrics[this.COUNT] = intentConfidences.length;
            intentConfidenceMetrics[this.BIN_COUNTS] = this.computeBinCounts(intentConfidences);
            confidenceMetrics[intentKey] = intentConfidenceMetrics;
        }
        return confidenceMetrics;
    },
    /**
     * @function computeAverage
     * @description Compute average of array of values
     * @param values - array of numbers
     *
     */
    computeAverage: function(values) {
        if (gs.nil(values) || values.length == 0) return;
        var average = values.reduce(function(p, c) {
            return p + c;
        }) / values.length;
        return parseFloat(average.toFixed(2));
    },
    /**
     * @function computeMedian
     * @description Compute median of array of values
     * @param values - array of numbers
     * @param sort - boolean to sort array
     *
     */
    computeMedian: function(values, sort) {
        if (gs.nil(values) || values.length == 0) return;
        if (sort) this.sort(values);
        var half = Math.floor(values.length / 2);
        if (values.length % 2)
            return values[half];
        else
            return ((values[half - 1] + values[half]) / 2.0).toFixed(2);
    },
    /**
     * @function findMin
     * @description Find minimum of array of values
     * @param values - array of numbers
     * @param sort - boolean to sort array
     *
     */
    findMin: function(values, sort) {
        if (gs.nil(values) || values.length == 0) return;
        if (sort) this.sort(values);
        return values[0];
    },
    /**
     * @function findMax
     * @description Find maximum of array of values
     * @param values - array of numbers
     * @param sort - boolean to sort array
     *
     */
    findMax: function(values, sort) {
        if (gs.nil(values) || values.length == 0) return;
        if (sort) this.sort(values);
        return values[values.length - 1];
    },
    /**
     * @function sort
     * @description Sort array of values in increasing order
     * @param values - array of numbers
     * 
     */
    sort: function(values) {
        values.sort(function(a, b) {
            return a - b;
        });
    },
    /**(
     * @function computeBinCounts
     * @description Compute bin counts (10 bins) for confidence scores
     * @param values - array of numbers
     * 
     */
    computeBinCounts: function(values) {
        var numBins = 10;
        var binCounts = [];
        for (var i = 0; i < numBins; i++) {
            binCounts.push(0);
        }
        for (var j = 0; j < values.length; j++) {
            var bin = Math.floor(values[j] * 100 / numBins);
            binCounts[bin]++;
        }
        return binCounts;
    },
    /**(
     * @function isInclude
     * @description returns true if the val includes in the array, returns false if not
     * @param an array, a value
     * 
     */
    isInclude: function(val, array) {
        var len = array.length;
        for (var i = 0; i < len; i++) {
            if (array[i] == val)
                return true;
        }
        return false;
    },
    /**
     * @function isAggregateSolution
     * @description check if the solution's capability is Agent Zero composite 
     * @param solutionName {string} - parent solution name
     * @returns {bool}
     * 
     */
    isAggregateSolution: function(solutionName) {
        var gr = new GlideRecord(this.CAPABILITY_DEFINITION_BASE_TABLE);
        gr.addQuery(this.SOLUTION_NAME, solutionName);
        gr.addQuery(this.CAPABILITY_VALUE, this.COMPOSITE);
        gr.query();
        if (gr.next()) {
            var solutionProperties = JSON.parse(gr.getValue(this.SOLUTION_PROPERTIES));

            var activityArrray = solutionProperties[this.ACTIVITIES];
            gs.info(activityArrray.length);
            for (var i = 0; i < activityArrray.length; i++) {
                var obj = activityArrray[i];
                if (obj.hasOwnProperty(this.ACTIVITY_ID)) {
                    if (obj[this.ACTIVITY_ID] === this.AGENT_ZERO_WORKFLOW_FIELD) {
                        return true;
                    }
                }
            }
        }
        return false;
    },

    /**
     * @function isNluSolutionDefined
     * @description checks if any NLU solution is defined in the composite solution 
     * @param parentSolutionName {string} - composite solution name
     * @returns {boolean} true if any NLU solution is defined in the composition, false otherwise
     * 
     */
    isNluSolutionDefined: function(parentSolutionName) {
        var nluSolutions = [];
        var gr = new GlideRecord(this.CAPABILITY_DEFINITION_BASE_TABLE);
        gr.addQuery(this.SOLUTION_NAME, parentSolutionName);
        gr.addQuery(this.CAPABILITY_VALUE, this.COMPOSITE);
        gr.addQuery(this.ACTIVE, true);
        gr.query();
        if (gr.next()) {
            var solutionProperties = JSON.parse(gr.getValue(this.SOLUTION_PROPERTIES));
            // check if the custom intents are defined in the option field
            if (solutionProperties.hasOwnProperty(this.BINDINGS)) {
                nluSolutions = solutionProperties[this.BINDINGS];
                if (nluSolutions.length > 0 && nluSolutions[0].solutionName !== null) {
                    return true;
                }
            } else {
                // no nlu solution is defined
                return false;
            }

            if (solutionProperties.hasOwnProperty(this.OPTION) && solutionProperties[this.OPTION].hasOwnProperty(this.CUSTOM_INTENTS)) {
                nluSolutions = solutionProperties[this.OPTION][this.CUSTOM_INTENTS];
            } else {
                // no nlu solution is defined
                return false;
            }
        }
        // if at least one nlu solution is specified, return true
        if (nluSolutions.length > 0)
            return true;
        return false;
    },
    /**
     * @function getActiveVersionNumber
     * @description returns version number of the active solution
     * @param solutionName {string} - solution name
     * @returns {string} solution version
     * 
     */
    getActiveVersionNumber: function(solutionName) {
        var solutionVersion = 1;
        var gr = new GlideRecord(this.ML_SOLUTION_TABLE);
        gr.addQuery(this.SOLUTION_NAME, solutionName);
        gr.addQuery(this.ACTIVE, true);
        gr.query();
        if (gr.next()) {
            solutionVersion = gr.getValue(this.SOLUTION_VERSION);
        }
        return solutionVersion;
    },

    /**
     * @function cleanAggregatedDataTable
     * @description clean old records in the aggregation table
     * 
     */
    cleanAggregatedDataTable: function() {
        // skip records deletion if disabled
        var disableAggregationApi = gs.getProperty('glide.platform_ml.disable_agent_zero_quality_metrics', false);
        var disableRecordsDeletion = gs.getProperty('glide.platform_ml.disable_agent_zero_quality_metrics_deletion', false);
        if (disableAggregationApi === 'true' || disableRecordsDeletion === 'true') {
            gs.info('ML Agent Zero Aggregation API: Skipping aggregation records deletion because it is disabled');
            return;
        }
        // set deletion months using default value or system property
        try {
            var deletionMonths = parseInt(gs.getProperty('glide.platform_ml.disable_agent_zero_quality_metrics_deletion_months', this.DELETION_MONTHS));
            if (!deletionMonths || deletionMonths < 1) {
                throw 'Deletion months ' + deletionMonths;
            }
            this.DELETION_MONTHS = deletionMonths;
        } catch (error) {
            gs.info('ML Agent Zero Aggregation API: Error parsing months for aggregation records deletion = ' + error);
        }
        gs.info('ML Agent Zero Aggregation API: Deletion months = ' + this.DELETION_MONTHS);
        // delete records created older than x months ago
        var gr = new GlideRecord(this.AGGREGATION_TABLE);
        gr.addQuery(this.SYS_CREATED_ON, '<=', gs.monthsAgo(this.DELETION_MONTHS));
        gr.query();
        var deletedRowCount = gr.getRowCount();
        gs.info('ML Agent Zero Aggregation API: Deleting ' + deletedRowCount + ' rows from ' + this.AGGREGATION_TABLE + ' table');
        if (deletedRowCount > 0) {
            gr.deleteMultiple();
        }
    },
    type: 'MLAgentZeroAggreationAPI'
};
