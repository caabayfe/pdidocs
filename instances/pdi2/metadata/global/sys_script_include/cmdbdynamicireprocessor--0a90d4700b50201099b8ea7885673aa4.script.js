var CMDBDynamicIREProcessor = Class.create();
CMDBDynamicIREProcessor.prototype = {

    // The size of batches to be processed before maximum_records is reached.
    batchSize: 1000,

    // Add this property to sys_properties type=string value=info/debug/warn/error.
    // Then filter logs where source contains CMDBDynamicIREProcessor.
    _LOG_PROPERTY: "glide.identification_engine.ire_dynamic.log.level",

    // Tables
    _CMDB_DYNAMIC_IRE_MATCH: 'cmdb_dynamic_ire_match',
    _CMDB_DYNAMIC_IRE_FILTER_CONDITION: 'cmdb_dynamic_ire_filter_condition',
    _CMDB_DYNAMIC_IRE_FEATURE: 'cmdb_dynamic_ire_feature',
    _CMDB_DYNAMIC_IRE_FEATURE_SET: 'cmdb_dynamic_ire_feature_set',
    _CMDB_DYNAMIC_IRE_MODEL: 'cmdb_dynamic_ire_model',
    _CMDB_CI: "cmdb_ci",

    // Tables filter for reference to cmdb tables.
    filteredTables: ['ecc_event', 'discovery_log', 'cmdb_metric', 'u_eal_submission'],

    // Columns filtered as not relevant for viewing.
    filteredColumns: ['sys_domain_path', 'sys_class_path'],

    initialize: function(logProperty) {
        // The count of inserts into this._CMDB_DYNAMIC_IRE_MATCH
        this.matchCount = 0;

        // Feature set update records
        this.featureSetUpdateCount = 0;

        if (JSUtil.nil(logProperty))
            logProperty = this._LOG_PROPERTY;

        this.log = new GSLog(logProperty, this.type);
        // this.log.disableDatabaseLogs();

        this._mlInterface = new global.CMDBDynamicIREMLInterface();
    },

    /*
     * Calculate the feature score. 1=equals, 0=not equal, -1 null or empty string. For the
     * selected cmdb_dynamic_match records.
     *
     * @param modelId the model. cmdb_dymanic_model.sys_id
     * @param matchFilterJSON a filter to pick the match records. {
    "expected_match": [0, 1], // 0 = NoMatch, 1 = Match, 2 = Not Processed, 3 = Analyze
    "reviewed": true,
    "processed_time_from": "2020-04-19 20:35:41",
    "processed_time_to": "2020-04-19 20:35:41"
}
	 *
     * @return feature {message: "", processed_records: "", updated_records: "", processed_time: "", feature_count: ""}
     */

    applyFeatures: function(modelId, matchFilterJSON) {
        var filterMatchObj = {
            expected_match: [0, 1],
            reviewed: true,
            processed_time_from: '',
            processed_time_to: ''
        };

        if (!gs.nil(matchFilterJSON))
            filterMatchObj = JSON.parse(matchFilterJSON);

        var expectedMatch = [];
        if (filterMatchObj.hasOwnProperty('expected_match'))
            expectedMatch = filterMatchObj.expected_match;

        var swComplete = new GlideStopWatch();
        var lastProccessId = '';
        var complete = false;
        var processedRecCount = 0;
        this.featureSetUpdateCount = 0;

        var featuresJSON = this.getFeatures(modelId);

        var feature = {
            message: '',
            processed_records: processedRecCount,
            updated_records: this.featureSetUpdateCount,
            processed_time: 0,
            feature_count: 0
        };

        if (gs.nil(featuresJSON)) {
            var message = this.formatMessage("Completed job CMDBDynamicIREProcessor::applyFeatures no active features defined for model Id: {0}", [modelId]);
            this.log.logInfo(message);
            feature.message = message;
            return feature;
        }

        feature.feature_count = Object.keys(featuresJSON).length;
        var matchGr = new GlideRecord(this._CMDB_DYNAMIC_IRE_MATCH);

        // Only process matched record based on the filters.
        if (expectedMatch.length > 0)
            matchGr.addQuery('expected_match', 'IN', expectedMatch.toString());

        if (filterMatchObj.hasOwnProperty('reviewed'))
            matchGr.addQuery('reviewed', filterMatchObj.reviewed);

        if (filterMatchObj.hasOwnProperty('processed_time_from') && filterMatchObj.hasOwnProperty('processed_time_to')) {
            if (!gs.nil(filterMatchObj.processed_time_from))
                matchGr.addQuery('processed_time', '>=', new GlideDateTime(filterMatchObj.processed_time_from));
            if (!gs.nil(filterMatchObj.processed_time_to))
                matchGr.addQuery('processed_time', '<=', new GlideDateTime(filterMatchObj.processed_time_to));
        }

        matchGr.query();
        totalCount = matchGr.getRowCount();
        while (!complete) {
            var sw = new GlideStopWatch();
            complete = true;
            if (!gs.nil(lastProccessId))
                matchGr.addQuery('sys_id', '>', lastProccessId);

            // NOTE limit must be set BEFORE order by
            matchGr.setLimit(this.batchSize);
            matchGr.orderBy('sys_id');
            matchGr.query();

            while (matchGr.next()) {

                var ci1Gr = new GlideRecord(matchGr.getValue('class_ci_1'));
                if (!ci1Gr.get(matchGr.getValue('ci_1'))) {
                    this.log.logErr(this.formatMessage("CMDBDynamicIREProcessor::applyFeatures CI1 not found: {0}", [matchGr.getValue('ci_1')]));
                    continue;
                }

                var ci2Gr = new GlideRecord(matchGr.getValue('class_ci_2'));
                if (!ci2Gr.get(matchGr.getValue('ci_2'))) {
                    this.log.logErr(this.formatMessage("CMDBDynamicIREProcessor::applyFeatures CI2 not found: {0}", [matchGr.getValue('ci_2')]));
                    continue;
                }

                var featuresScores = [];
                var featureRef = null;

                for (var key in featuresJSON) {
                    var featureObj = featuresJSON[key];
                    var columns = featureObj.attributes.split(',');

                    // Get the feature columns and values for each CI.

                    var columnValuesJSON = {};

                    if (gs.nil(featureObj.reference_field)) {
                        columnValuesJSON.ci1 = this._getFieldColumnsAndValues(columns, ci1Gr);
                        columnValuesJSON.ci2 = this._getFieldColumnsAndValues(columns, ci2Gr);
                    } else {
                        columnValuesJSON.ci1 = this._getReferenceFeatureColumnsAndValues(featureObj, columns, ci1Gr);
                        columnValuesJSON.ci2 = this._getReferenceFeatureColumnsAndValues(featureObj, columns, ci2Gr);
                    }

                    this.log.logDebug(this.formatMessage("Processing job CMDBDynamicIREProcessor::applyFeatures \nMatch Id: {0}\nFeature: {1}\nFeature Scores: {2}\nCI Data: {3}", [matchGr.getUniqueValue(), JSON.stringify(featureObj), JSON.stringify(featuresScores), JSON.stringify(columnValuesJSON)]));

                    featuresScores.push({
                        feature: key,
                        score: this.calculateFeatureScore(featureObj, featuresScores, columnValuesJSON)
                    });
                }

                if (featuresScores.length > 0)
                    featureRef = this.createFeatureSetRecord(matchGr.getValue('expected_match'), featuresScores);

                //update the reference back on to the cmdb_dynamic_match table.
                if (!gs.nil(featureRef)) {
                    matchGr.setValue('feature_record', featureRef);
                    updated = matchGr.update();
                    if (gs.nil(updated)) {
                        this.log.logErr(this.formatMessage("CMDBDynamicIREProcessor::applyFeatures updating the reference back on {0}", [this._CMDB_DYNAMIC_IRE_MATCH]));
                    }
                }

                lastProccessId = matchGr.getUniqueValue();
                processedRecCount++;

                if (processedRecCount === totalCount) {
                    complete = true;
                    break;
                }

                complete = false;
            }

            sw.stop();
            this.log.logDebug(this.formatMessage("Processing job CMDBDynamicIREProcessor::applyFeatures Processed {0} match records out of {1}. Duration: {2} (sec).", [processedRecCount.toString(), totalCount, sw.getTime() / 1000]));

        }

        swComplete.stop();

        var completeMessage = this.formatMessage("Completed job CMDBDynamicIREProcessor::applyFeatures Processed {0} CI's where expected match is {1}. Duration: {2} (sec).", [processedRecCount.toString(), expectedMatch.toString(), swComplete.getTime() / 1000]);
        this.log.logInfo(completeMessage);

        feature.message = completeMessage;
        feature.processed_records = processedRecCount;
        feature.updated_records = this.featureSetUpdateCount;
        feature.processed_time = swComplete.getTime() / 1000;

        return JSON.stringify(feature);
    },

    /*
     * Find CI's that have a common filter pattern i.e. name or serial_nuber or mac_address match.
     *
     * @param modelId the model. cmdb_dymanic_model.sys_id
     * @return feature {message: "", maximum_records: "", processed_records: "", match_records: "", reference_filter: "", processed_time: ""}
     */

    applyFilterConditions: function(modelId) {
        var result = [];
        var filter = {};

        var modelGr = new GlideRecord(this._CMDB_DYNAMIC_IRE_MODEL);
        if (!modelGr.get(modelId)) {
            filter.message = this.formatMessage("Completed job CMDBDynamicIREProcessor::applyFilterConditions Model not found Id {0}", [modelId]);
            this.log.logInfo(filter.message);
            result.push(filter);
            return result;
        }

        var baseClass = modelGr.getValue('cmdb_class');
        var baseClassTableTree = j2js(new TableUtils(baseClass).getTableExtensions());
        baseClassTableTree.push(baseClass);

        var maxRecords = 0;
        if (!gs.nil(modelGr.getValue("maximum_records")))
            maxRecords = parseInt(modelGr.getValue('maximum_records'));

        if (0 != maxRecords && this.batchSize > maxRecords)
            this.batchSize = maxRecords;

        // get the filters for this table.
        var filterCondGr = new GlideRecord(this._CMDB_DYNAMIC_IRE_FILTER_CONDITION);
        filterCondGr.addQuery('dynamic_model', modelId);
        filterCondGr.addQuery('active', true);
        filterCondGr.orderBy('order');
        filterCondGr.query();

        if (0 == filterCondGr.getRowCount()) {
            filter.message = this.formatMessage("Completed job CMDBDynamicIREProcessor::applyFilterConditions no filters defined in table: {0} for model Id: {1}", [this._CMDB_DYNAMIC_IRE_FILTER_CONDITION, modelId]);
            this.log.logInfo(filter.message);
            result.push(filter);
            return result;
        }

        while (filterCondGr.next()) {

            this.log.logInfo("Started job CMDBDynamicIREProcessor::applyFilterConditions for filter");
            this.matchCount = 0;

            var maxFilteredRecords = 0;
            if (!gs.nil(filterCondGr.getValue("maximum_records")))
                maxFilteredRecords = parseInt(filterCondGr.getValue('maximum_records'));

            var referenceField = filterCondGr.getValue('reference_field');

            var filterClass = filterCondGr.getValue('cmdb_class');
            var filterClasses = j2js(new TableUtils(filterClass).getTableExtensions());
            filterClasses.push(filterClass);

            var staticCondition = filterCondGr.getValue("static_condition");
            var dynamicCondition = filterCondGr.getValue("dynamic_condition");
            var condition = staticCondition;

            if (!gs.nil(dynamicCondition))
                condition = dynamicCondition.replace('EQ', staticCondition);

            var dynamicConditionColumns = this._getColumnFromQuery(dynamicCondition);

            if (gs.nil(referenceField)) {
                filter = this._processFilterCMDBItems(maxFilteredRecords, maxRecords, filterClasses, staticCondition, condition, dynamicConditionColumns, modelId);
            } else {
                filter = this._processFilterReferenceItems(maxFilteredRecords, maxRecords, baseClassTableTree, staticCondition, condition, dynamicConditionColumns, filterClass, referenceField, modelId);
            }

            result.push(filter);
        }

        return JSON.stringify(result);
    },

    getFeatures: function(modelId) {
        var featureGr = new GlideRecord(this._CMDB_DYNAMIC_IRE_FEATURE);
        featureGr.addQuery('filter_condition.dynamic_model', modelId);
        featureGr.addQuery('filter_condition.active', true);
        featureGr.addNotNullQuery('attributes');
        featureGr.addActiveQuery();
        featureGr.orderBy('filter_condition.order');
        featureGr.orderBy('order');
        featureGr.query();

        if (0 == featureGr.getRowCount())
            return null;

        var idx = 0;
        var features = {};
        while (featureGr.next()) {
            var filterGr = this._safeGetRefRecord(featureGr, 'filter_condition');
            if (!filterGr)
                continue;
            features['feature_' + (++idx)] = {
                attributes: featureGr.getValue('attributes'),
                matching_algorithm: parseInt(featureGr.getValue('matching_algorithm')),
                weight: featureGr.getValue('weight'),
                model_id: filterGr.getValue('dymamic_model'),
                cmdb_class: filterGr.getValue('cmdb_class'),
                reference_field: filterGr.getValue('reference_field') || '',
                static_condition: filterGr.getValue('static_condition'),
                dynamic_condition: filterGr.getValue('dynamic_condition')
            };
        }

        return features;
    },

    createMatchRecord: function(ci_1, class_ci_1, ci_2, class_ci_2, referenceFilter, modelId) {

        if (gs.nil(ci_1) || gs.nil(ci_2) || ci_1 == ci_2)
            return false;

        var dynamicMatchGr = new GlideRecord(this._CMDB_DYNAMIC_IRE_MATCH);
        dynamicMatchGr.addQuery('cmdb_ci_1', ci_1)
            .addOrCondition('cmdb_ci_2', ci_1);
        dynamicMatchGr.addQuery('cmdb_ci_1', ci_2)
            .addOrCondition('cmdb_ci_2', ci_2);
        dynamicMatchGr.query();

        if (dynamicMatchGr.next()) {
            // getDisplayValue returns string true/false
            var refFilter = dynamicMatchGr.getDisplayValue('reference_filter');

            // Dont reset if this was already found with a reference filter
            if ('true' !== refFilter) {
                dynamicMatchGr.setValue('reference_filter', referenceFilter);

                if (!dynamicMatchGr.update())
                    this.log.logErr(this.formatMessage("CMDBDynamicIREProcessor::createMatchRecord updating {0} ID: {1}", [this._CMDB_DYNAMIC_IRE_MATCH, dynamicMatchGr.getUniqueValue()]));
            }

            return false;
        }

        dynamicMatchGr.initialize();
        dynamicMatchGr.setValue('cmdb_ci_1', ci_1);
        dynamicMatchGr.setValue('ci_1', ci_1);
        dynamicMatchGr.setValue('class_ci_1', class_ci_1);
        dynamicMatchGr.setValue('cmdb_ci_2', ci_2);
        dynamicMatchGr.setValue('ci_2', ci_2);
        dynamicMatchGr.setValue('class_ci_2', class_ci_2);
        dynamicMatchGr.setValue('reference_filter', referenceFilter);
        dynamicMatchGr.setValue('model_id', modelId);
        dynamicMatchGr.setValue('expected_match', 2);

        if (!dynamicMatchGr.insert())
            this.log.logErr('CMDBDynamicIREProcessor::createMatchRecord inserting ' + this._CMDB_DYNAMIC_IRE_MATCH);

        this.matchCount++;
        return true;
    },

    createFeatureSetRecord: function(expectedMatch, features) {

        if (features.length == 0)
            return null;

        var newDynamicFeatureSetGr = new GlideRecord(this._CMDB_DYNAMIC_IRE_FEATURE_SET);
        newDynamicFeatureSetGr.initialize();
        newDynamicFeatureSetGr.setValue('label', expectedMatch);

        for (var j = 0; j < features.length; j++) {
            newDynamicFeatureSetGr.setValue(features[j].feature, features[j].score);
        }

        var dynamicFeatureSetId = newDynamicFeatureSetGr.insert();
        if (gs.nil(dynamicFeatureSetId)) {
            this.log.logErr(this.formatMessage("CMDBDynamicIREProcessor::createFeatureSetRecord  inserting {0}", [this._CMDB_DYNAMIC_IRE_FEATURE_SET]));
        }

        return dynamicFeatureSetId;
    },

    /*
     * Calculate the feature score. 1=equals, 0=not equal, -1 null or empty string.
     * @param featureObj the feature.
     * @param featuresScores {feature_1: <score>, feature_2: <score>, ...}
     * @param columnValuesJSON {ci1:  {column1: [value1, value2],column2: [value3, value4], ...},ci2: ...
     * @return int score.
     */

    calculateFeatureScore: function(featureObj, featuresScores, columnValuesJSON) {

        // Alorgrithm to calculate match Equals (0), Non Existing (1), Distance (2).
        var matchAlgorithm = parseInt(featureObj.matching_algorithm);
        var ci1ColValues = columnValuesJSON.ci1;
        var ci2ColValues = columnValuesJSON.ci2;

        // Score to be returned
        var score = 0;

        // The number of set pairs
        var keyCount = 0;

        var nonExisting = true;

        for (var key in ci1ColValues) {

            var ci1Values = ci1ColValues[key];
            var ci2Values = ci2ColValues[key];

            // If no values.
            if (ci1Values.length == 0 && ci2Values.length == 0) {
                continue;
            }
            nonExisting = false;

            // Calculate the Interset of 2 sets
            // i.e set1= [1,2,3,4] set2=[3,4,5,6,7] intersect = [1,2[3,4,3,4]5,6,7]
            // score = 4/set1.length + set2.length = 0.4444

            var matchedCount = 0;
            for (var i = 0; i < ci1Values.length; i++) {
                if (ci2Values.indexOf(ci1Values[i]) !== -1) {
                    // If it exists in both
                    matchedCount++;
                }
            }
            for (var j = 0; j < ci2Values.length; j++) {
                if (ci1Values.indexOf(ci2Values[j]) !== -1) {
                    // If it exists in both
                    matchedCount++;
                }
            }

            // matchAlgorithm === 0 i.e. Equals i.e. all values must be equal
            if (matchAlgorithm === 0 && (matchedCount !== (ci1Values.length + ci2Values.length))) {
                return 0;
            }

            keyCount++;

            score = score + (matchedCount / (ci1Values.length + ci2Values.length));
        }

        if (0 !== keyCount) {
            score = score / keyCount;
        }
        // Non Existing
        if (matchAlgorithm === 1) {
            if (nonExisting) {
                score = 1;
            } else {
                score = 0;
            }
        } else {
            if (nonExisting)
                score = -1;
        }

        // Score should always be less than equal to 1
        if (score > 1) {
            this.log.logErr(this.formatMessage("Processing job CMDBDynamicIREProcessor::calculateFeatureScore score greater than 1 \nScore: {0}\nFeature: {1}\n Previous Feature Scores: {2}\nCI Data: {3}", [score, JSON.stringify(featureObj), JSON.stringify(featuresScores), JSON.stringify(columnValuesJSON)]));
        }

        return score;
    },

    /*
     * The Levenshtein distance between two strings stringA, stringB (of length  |stringA| and |stringB| respectively)
     * is given by levenshteinDistance{stringA,stringB}(|stringA|,|stringB|)
     * Use to get a percent value
     * var levenshteinDistance = this.levenshteinDistance(stringA, stringB);
     * var bigger = Math.max(stringA.length, stringB.length);
     * var percent =  (bigger - levenshteinDistance) / bigger;
     *
     */

    levenshteinDistance: function(stringA, stringB) {
        if (gs.nil(stringA))
            stringA = '';

        if (gs.nil(stringB))
            stringB = '';

        if (stringA.length == 0) return stringB.length;
        if (stringB.length == 0) return stringA.length;

        var matrix = [];

        // increment along the first column of each row
        var i;
        for (i = 0; i <= stringB.length; i++) {
            matrix[i] = [i];
        }

        // increment each column in the first row
        var j;
        for (j = 0; j <= stringA.length; j++) {
            matrix[0][j] = j;
        }

        // Fill in the rest of the matrix
        for (i = 1; i <= stringB.length; i++) {
            for (j = 1; j <= stringA.length; j++) {
                if (stringB.charAt(i - 1) == stringA.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, // substitution
                        Math.min(matrix[i][j - 1] + 1, // insertion
                            matrix[i - 1][j] + 1)); // deletion
                }
            }
        }
        return matrix[stringB.length][stringA.length];
    },

    /*
     *
     * @param  matchJSON {"cmdb_dynamic_ire_match": [{"sys_id": "<value>","expected_match": "Match"},
     * {"sys_id": "<value>","expected_match": "value"}]}
     * @return matchJSON {"cmdb_dynamic_ire_match": [{"sys_id": "<value>","expected_match": "value", "updated": "true"},
     * {"sys_id": "<value>","expected_match": "value", "updated": "true"}]}.
     */

    updateMatchRecords: function(matchJSON) {

        try {

            matchJSON = JSON.parse(matchJSON);
            var matchRecs = matchJSON.cmdb_dynamic_ire_match;

            for (var i = 0; i < matchRecs.length; i++) {
                var matchGr = new GlideRecord(this._CMDB_DYNAMIC_IRE_MATCH);
                if (matchGr.get(matchRecs[i].sys_id)) {
                    matchGr.setValue('expected_match', matchRecs[i].expected_match);
                    if (matchGr.update()) {
                        matchRecs[i].updated = true;
                    } else {
                        matchRecs[i].updated = false;
                        this.log.logErr(this.formatMessage("CMDBDynamicIREProcessor::updateMatchRecords updating {0} ID: {1}", [this._CMDB_DYNAMIC_IRE_MATCH, matchGr.getUniqueValue()]));
                    }
                } else {
                    this.log.logErr(this.formatMessage("CMDBDynamicIREProcessor::updateMatchRecords updating {0} ID: {1}", [this._CMDB_DYNAMIC_IRE_MATCH, matchRecs[i].sys_id]));
                }
            }
            return JSON.stringify(matchJSON);

        } catch (ex) {
            this.log.logErr(this.formatMessage("CMDBDynamicIREProcessor::updateMatchRecords Parsing json msg: {0}", [ex]));
        }
    },

    /*
     *
     * @param  matchJSON {"cmdb_dynamic_ire_match": [{"sys_id": "<value>","expected_match": "value"},
     * {"sys_id": "<value>","expected_match": "value"}]}
     *
     * @return matchJSON {"columns": ["DynamicIREIT_89_9191","DynamicIREIT_89_9191"],"cmdb_ci_win_server": {"rows": [{"asset": ["YAH-0F4C-9191 - Unknown",""],"asset_tag": ["YAH-0F4C-9191","YAH-0F4C-9292"]} ]},"cmdb_serial_number": {"rows": [{"serial_number": ["4f-fc-cd-db-b1-919853","4f-fc-cd-db-b1-919855"],"serial_number_type": ["chassis","chassis"]},{"serial_number": ["4f-fc-cd-db-b1-919854","4f-fc-cd-db-b1-919854"],"serial_number_type": ["chassis","chassis"]},{"serial_number": ["","4f-fc-cd-db-b1-919853"],"serial_number_type": ["","chassis"]}]}}
     *
     */

    getMatchRecords: function(matchJSON, excludeNull) {
        try {

            matchJSON = JSON.parse(matchJSON);

            var matchRecs = matchJSON.cmdb_dynamic_ire_match;
            var items = {};
            var index = 0;

            for (var i = 0; i < matchRecs.length; i++) {

                var matchGr = new GlideRecord(this._CMDB_DYNAMIC_IRE_MATCH);

                if (matchGr.get(matchRecs[i].sys_id)) {

                    items = this._getCIItemColumnsAndValues((matchRecs.length * 2), index, items, matchGr.getValue('ci_1'), matchGr.getValue('class_ci_1'), excludeNull);
                    index++;
                    items = this._getCIItemColumnsAndValues((matchRecs.length * 2), index, items, matchGr.getValue('ci_2'), matchGr.getValue('class_ci_2'), excludeNull);
                    index++;

                } else {
                    this.log.logErr(this.formatMessage("CMDBDynamicIREProcessor::getMatchRecords Match record not found: {0}", [matchRecs[i].sys_id]));

                }
            }
            return JSON.stringify(items);

        } catch (ex) {
            this.log.logErr(this.formatMessage("CMDBDynamicIREProcessor::getMatchRecords Parsing json msg: {0}", [ex]));
        }
    },

    _getCIItemColumnsAndValues: function(ciCount, index, items, ciId, ciClass, excludeNull) {
        var ciGr = new GlideRecord(ciClass);
        if (!ciGr.get(ciId)) {
            this.log.logErr(this.formatMessage("CMDBDynamicIREProcessor::_getCIItemColumnsAndValues CI not found: {0}", [ciId]));
            return items;
        }

        var tableName = ciGr.getTableName();

        if (!items.hasOwnProperty('columns')) {
            items['columns'] = [ciGr.getValue('name')];
        } else {
            items['columns'].push(ciGr.getValue('name'));
        }
        var rownumber = 0;

        this._populateFieldsAndValues(excludeNull, ciCount, index, rownumber, tableName, items, ciGr);

        // Get hte reference tables for the features.
        var featureGr = new GlideRecord(this._CMDB_DYNAMIC_IRE_FEATURE);
        var filterJoinCondition = featureGr.addJoinQuery(this._CMDB_DYNAMIC_IRE_FILTER_CONDITION, 'filter_condition_id', 'sys_id');
        featureGr.addActiveQuery();
        featureGr.orderBy("order");
        featureGr.query();

        var referenceObjs = {};

        while (featureGr.next()) {

            // Get the reference tables and fields.

            // {"cmdb_ci_network_adapter": {"referenceField": "cmdb_ci","referenceFields": ["mac_address"]},
            //  "cmdb_serial_number": {"referenceField": "cmdb_ci","referenceFields": ["serial_number_type","serial_number"]}}

            if (!gs.nil(featureGr.filter_condition_id.reference_field)) {

                var className = featureGr.getValue('cmdb_class');
                var referenceObj = null;
                var referenceFields = [];

                for (var key in referenceObjs) {
                    if (className === key) {
                        referenceObj = referenceObjs[key];
                        referenceFields = referenceObj.referenceFields;
                        break;
                    }
                }

                if (gs.nil(referenceObj)) {
                    referenceObj = {};
                    referenceObj.referenceField = featureGr.filter_condition_id.reference_field;
                    referenceObj.referenceFields = referenceFields;
                    referenceObjs[featureGr.getValue('cmdb_class')] = referenceObj;
                }

                var attributes = featureGr.getValue('attributes');

                if (!gs.nil(attributes)) {
                    attributes = attributes.split(',');
                    for (var i = 0; i < attributes.length; i++) {
                        if (referenceFields.indexOf(attributes[i]) === -1) {
                            referenceFields.push(attributes[i]);
                        }
                    }
                }
            }
        }

        for (var table in referenceObjs) {

            var referenceItemObj = referenceObjs[table];

            var refGr = new GlideRecord(table);
            refGr.addQuery(referenceItemObj.referenceField, ciGr.getUniqueValue());
            refGr.query();
            rownumber = 0;

            while (refGr.next()) {
                this._populateFieldsAndValues(excludeNull, ciCount, index, rownumber, table, items, refGr);
                rownumber++;
            }
        }

        return items;
    },


    _populateFieldsAndValues: function(excludeNull, ciCount, index, rowNumber, tableName, items, gr) {

        var columns = new GlideRecordUtil().getFields(gr);
        columns = this._filterColumns(columns);
        columns.sort();

        var tableLabel = this._getClassLabel(tableName);

        if (!items.hasOwnProperty(tableLabel)) {
            items[tableLabel] = {
                rows: [{}]
            };
        }
        var row;
        var rows = items[tableLabel].rows;

        // Add a new row
        if (rowNumber >= rows.length) {
            row = {};
            rows.push(row);
        } else {
            row = rows[rowNumber];
        }

        // Add the column values for this row object.
        for (var i = 0; i < columns.length; i++) {

            var columnLabel = this._getColumnForTable(tableName, columns[i], true);
            if (!row.hasOwnProperty(columnLabel))
                row[columnLabel] = this._getEmptyRow(ciCount);

            row[columnLabel][index] = gr.getDisplayValue(columns[i]);

            // If the row is empty and its the last value to be added remove the element.
            if ((ciCount - 1) == index && this._isEmptyRow(row[columnLabel]) && excludeNull)
                delete row[columnLabel];

        }
    },

    _isEmptyRow: function(rowValues) {

        for (var i = 0; i < rowValues.length; i++) {
            if (!gs.nil(rowValues[i]))
                return false;
        }
        return true;
    },

    _getEmptyRow: function(ciCount) {
        var row = [];
        for (var i = 0; i < ciCount; i++) {
            row.push('');
        }
        return row;
    },

    _getFieldColumnsAndValues: function(columns, ciGr) {

        var columnObj = {};

        if (gs.nil(columns))
            return columnObj;

        columns.sort();

        for (var i = 0; i < columns.length; i++) {

            var value = this._getValueForColumn(columns[i], ciGr);

            if (gs.nil(value)) {
                columnObj[columns[i]] = [];
            } else {
                columnObj[columns[i]] = value;
            }
        }

        return columnObj;
    },

    _getValueForColumn: function(column, gr) {
        var fields = column.split('.');
        var currentGr = gr;
        var value;

        for (var j = 0; j < fields.length; j++) {

            var field = '' + fields[j];
            var ciObj = currentGr.getElement(field);

            if (gs.nil(ciObj)) {
                value = '';
                break;
            } else {
                if (j < fields.length - 1) {
                    currentGr = this._safeGetRefRecord(currentGr, field);
                    if (!currentGr) {
                        value = '';
                        break;
                    }
                } else {
                    value = [ciObj.getValue(field)];
                }
            }
        }

        return value;
    },
    /*
     *
     * @parm featureObj
     * @parm columns
     * @parm ciGr
     * @return {"serial_number_type":["chassis","chassis"],"serial_number":["4f-fc-cd-db-b1-919843","4f-fc-cd-db-b1-919844"]}
     */

    _getReferenceFeatureColumnsAndValues: function(featureObj, columns, ciGr) {


        var cmdbFeatureGr = new GlideRecord(featureObj.cmdb_class);

        cmdbFeatureGr.addQuery(featureObj.reference_field, ciGr.getUniqueValue());

        if (!gs.nil(featureObj.static_condition))
            cmdbFeatureGr.addEncodedQuery(featureObj.static_condition);

        cmdbFeatureGr.query();

        // Nothing found return empty column/values.
        var referencedObj;
        if (cmdbFeatureGr.getRowCount() > 0) {

            while (cmdbFeatureGr.next()) {

                var ciColValues = this._getFieldColumnsAndValues(columns, cmdbFeatureGr);
                if (gs.nil(referencedObj)) {
                    referencedObj = ciColValues;
                } else {
                    for (var key in referencedObj) {
                        var values = referencedObj[key];
                        values = values.concat(ciColValues[key]);
                        referencedObj[key] = values;
                    }
                }
            }
        } else {
            referencedObj = {};
            for (var i = 0; i < columns.length; i++) {
                referencedObj[columns[i]] = [];
            }

        }
        return referencedObj;

    },

    _getEncodedQueryCondition: function(columns, conditionQuery, itemGr) {

        var encodedQuery = '';

        if (gs.nil(conditionQuery))
            return encodedQuery;

        var conditionColumn = conditionQuery.split('^');

        var encodedQueryWildCard = '';
        for (var i = 0; i < conditionColumn.length; i++) {

            var conditionColumnWildCard = conditionColumn[i].split('?');

            encodedQueryWildCard = '';
            if (conditionColumnWildCard.length > 1) {
                for (var j = 0; j < conditionColumnWildCard.length; j++) {
                    var condition = conditionColumnWildCard[j];

                    if (gs.nil(condition))
                        continue;

                    for (var k = 0; k < columns.length; k++) {
                        if (condition.indexOf(columns[k]) !== -1 && (condition.split('.').length === columns[k].split('.').length)) {
                            var value = this._getValueForColumn(columns[k], itemGr);
                            if (!gs.nil(value)) {
                                encodedQueryWildCard = condition + value;
                            }
                        }
                    }
                }
            }

            if (gs.nil(encodedQueryWildCard)) {
                if (gs.nil(encodedQuery))
                    encodedQuery = encodedQuery + conditionColumn[i];
                else
                    encodedQuery = encodedQuery + '^' + conditionColumn[i];
            } else {
                if (gs.nil(encodedQuery))
                    encodedQuery = encodedQuery + encodedQueryWildCard;
                else
                    encodedQuery = encodedQuery + '^' + encodedQueryWildCard;
            }
        }
        return encodedQuery;
    },


    /**
     * Only gets tables which have data for that column.
     * Gets clazz and all tables that extend clazz +
     * reference tables of clazz and its extended from classes.
     */

    _getColumnsForLookupTable: function(clazz, column, referenceOnly) {
        var results = [];

        if (gs.nil(clazz) || gs.nil(column))
            return results;

        var tables = [];
        // Get all extended tables from clazz
        if (!referenceOnly) {
            tables = j2js(new TableUtils(clazz).getTableExtensions());
            tables.push(clazz);
        }

        // Get parent tables and ref tables for clazz
        var parentTables = j2js(new TableUtils(clazz).getTables());
        for (var k = 0; k < parentTables.length; k++) {
            // Add reference tables.
            var refTables = this._getReferencingTables(parentTables[k]);
            for (var l = 0; l < refTables.length; l++)
                tables.push(refTables[l]);
        }

        tables = this._filterTables(tables);

        for (var i = 0; i < tables.length; i++) {

            var columns = this._getTableColumns(tables[i]);
            for (var j = 0; j < columns.length; j++) {

                if (column == columns[j]) {
                    var entry = {};
                    entry.table = tables[i];
                    entry.column = columns[j];
                    results.push(entry);
                }
            }
        }
        return results;
    },

    train: function(tableName, featuresColumns, outputColumn, modelName, modelId) {
        var modelGr = new GlideRecord(this._CMDB_DYNAMIC_IRE_MODEL);
        if (!modelGr.get(modelId)) {
            var message = this.formatMessage("Completed job CMDBDynamicIREProcessor::train Model not found Id {0}", [modelId]);
            this.log.logErr(message);
            return {
                status: 'FAILURE'
            };
        }

        var solution = new sn_ml.ClassificationSolution({
            label: modelName,
            predictedFieldName: outputColumn,
            inputFieldNames: featuresColumns,
            dataset: new sn_ml.DatasetDefinition({
                tableName: tableName,
                fieldNames: featuresColumns.concat([outputColumn]),
                fieldDetails: featuresColumns.map(function(val) {
                    return {
                        name: val,
                        type: 'numeric'
                    };
                })
            })
        });

        var result = {
            status: 'SUCCESS',
            solutionName: sn_ml.ClassificationSolutionStore.add(solution)
        };

        var ver = solution.submitTrainingJob();
        result.solutionVersion = {
            versionNumber: ver.getVersionNumber(),
            status: JSON.parse(ver.getStatus())
        };

        modelGr.setValue('ml_model_name', result.solutionName);
        if (!modelGr.update()) {
            result.status = "FAILURE";
            this.log.logErr(this.formatMessage("CMDBDynamicIREProcessor::train msg: Unable to update {0} with the solutionName", [this._CMDB_DYNAMIC_IRE_MODEL]));
        }

        return JSON.stringify(result);
    },

    monitorStatus: function(solutionName) {
        var mlSolution = sn_ml.ClassificationSolutionStore.get(solutionName);
        var result = JSON.parse(mlSolution.getLatestVersion().getStatus());
        result.status = "SUCCESS";

        return JSON.stringify(result);
    },

    predict: function(tableName, solutionName, modelId, isComputeLocalPrediction) {
        var solution = sn_ml.ClassificationSolutionStore.get(solutionName).getActiveVersion();
        var weights = this._mlInterface.getModelMetaData(solutionName);
        weights = JSON.parse(weights).weights;
        var predictorBias = +weights['bias'];
        var predictorReverse = weights['rev'] == 'true';

        var swComplete = new GlideStopWatch();

        if (isComputeLocalPrediction) {
            var featuresJSON = this.getFeatures(modelId);
            if (gs.nil(featuresJSON)) {
                this.log.logErr(this.formatMessage("Completed job CMDBDynamicIREProcessor::predict no active features defined for model Id: {0}", [modelId]));
                return JSON.stringify({
                    status: 'FAILURE',
                    statusCode: 'no_active_features_present_make_sure_to_run_configure_model'
                });
            }
        }

        var lo = 0,
            batchSize = 50;
        var options = {
            apply_threshold: false
        };
        var inputGr = new GlideRecord(tableName);
        inputGr.orderBy('sys_id');
        inputGr.setLimit(batchSize);

        var lastSysId = null;
        do {
            var sw = new GlideStopWatch();

            if (lastSysId)
                inputGr.addQuery('sys_id', '>', lastSysId);

            //platform ml defect: this window line would be the preferred way. when this works remove references of "lastSysId" and related logic
            //inputGr.chooseWindow(lo, lo + batchSize);
            inputGr.query();

            if (!inputGr.hasNext())
                break;

            var results = isComputeLocalPrediction ?
                this._computeLocalPrediction(inputGr, featuresJSON, modelConfigInfoObject) :
                solution.predict(inputGr, options);

            var sysIds = Object.keys(JSON.parse(results));
            lastSysId = sysIds[sysIds.length - 1];

            this._updatePredictionAndProbability(results, isComputeLocalPrediction ? 0 : predictorBias, predictorReverse);
            lo += inputGr.getRowCount();

            sw.stop();
            this.log.logInfo(this.formatMessage("Completed job CMDBDynamicIREProcessor::predict. Processed {0} records of {1}. Duration: {2} (sec).", [inputGr.getRowCount(), lo, sw.getTime() / 1000]));
        } while (inputGr.getRowCount() == batchSize);


        swComplete.stop();
        this.log.logInfo(this.formatMessage("Completed job CMDBDynamicIREProcessor::predict. Processed {0} records. Duration: {2} (sec).", [lo, swComplete.getTime() / 1000]));

        return JSON.stringify({
            status: 'SUCCESS'
        });
    },

    /*
     * Fetch the weights of the trained model from ML platform tables and
     * update the cmdb_dynamic_ire_feature table with it for each of the features.
     * @param modelId The modelId for the specific class of the the CMDB class
     * @param mlSolutionName the soutionName for the final Solution to be used by IRE
     * @return {status: "SUCCESS"}"}
     */
    configureModel: function(modelId, mlSolutionName, options) {
        //verify that there is a model configured in the cmdb_dynamic_ire_model table
        var modelGr = new GlideRecord(this._CMDB_DYNAMIC_IRE_MODEL);
        if (!modelGr.get(modelId)) {
            this.log.logErr('Completed job CMDBDynamicIREProcessor::configureModel Model not found Id ' + modelId);
            return JSON.stringify({
                status: 'FAILURE',
                statusCode: 'model_not_found'
            });
        }

        //update the ml_model_name in the cmdb_dynamic_ire_model
        modelGr.setValue('ml_model_name', mlSolutionName);
        if (!modelGr.update()) {
            this.log.logErr('Completed job CMDBDynamicIREProcessor::configureModel Unable to update the model solutionName ' + mlSolutionName);
            return JSON.stringify({
                status: 'FAILURE',
                statusCode: 'unable_to_update_model_solution_name'
            });
        }

        var modelMetaData = this._mlInterface.getModelMetaData(mlSolutionName);
        if (!modelMetaData) {
            this.log.logErr('Comleted Job CMDBDynamicIREProcessor::configureModel Unable to configure the model, there was an exception while fetching the model metadata from the ml platfrom tables ' + modelMetaData);
            return JSON.stringify({
                status: 'FAILURE',
                statusCode: 'ml_meta_data_undefined_or_failure'
            });
        }

        var modelMetaDataObject = JSON.parse(modelMetaData);
        if (modelMetaDataObject.status === 'FAILURE') {
            this.log.logErr('Comleted Job CMDBDynamicIREProcessor::configureModel Unable to configure the model, there was an exception while fetching the model metadata from the ml platfrom tables ' + modelMetaData);
            return JSON.stringify({
                status: 'FAILURE',
                statusCode: 'ml_meta_data_undefined_or_failure'
            });
        }

        var modelObject = modelMetaDataObject.weights;
        if (!modelObject) {
            this.log.logErr('Completed Job CMDBDynamicIREProcessor::configureModel Unable to parse the response from the ML API for the model MetaData');
            return JSON.stringify({
                status: 'FAILURE',
                statusCode: 'unable_to_parse_ml_meta_data'
            });
        }

        var feature_count = modelObject.feature_count;
        if (feature_count === 0) {
            this.log.logErr(this.formatMessage("Completed Job CMDBDynamicIREProcessor::configureModel There are no features which made it to the model. Ensure that the training was successful and the ML model for solution name {0} is valid", [mlSolutionName]));
            return JSON.stringify({
                status: 'FAILURE',
                statusCode: 'no_features_found_in_model'
            });
        }

        var result = {
            status: 'SUCCESS'
        };

        var rev = modelObject['rev'] == 'true' ? -1 : 1;
        var featureGr = new GlideRecord(this._CMDB_DYNAMIC_IRE_FEATURE);
        featureGr.addQuery('filter_condition.dynamic_model', modelId);
        featureGr.addNotNullQuery('attributes');
        featureGr.orderBy('filter_condition.order');
        featureGr.orderBy('order');
        featureGr.query();
        var idx = 0;
        while (featureGr.next()) {
            var weight = modelObject['feature_' + (++idx)];
            if (gs.nil(weight)) {
                //feature did not make it into the model can set this feature in table to inactive
                featureGr.setValue('active', 'false');
                featureGr.setValue('weight', '');
            } else {
                featureGr.setValue('active', 'true');
                featureGr.setValue('weight', weight * rev);
            }

            if (!featureGr.update()) {
                this.log.logErrr('CMDBDynamicIREProcessor::configureModel Issue with updating the weight values for feature Id ' + featureGr.getUniqueValue());
                result.statusCode = "unable_to_update_feature_weight";
                result.status = "FAILURE";
            }
        }

        return JSON.stringify(result);
    },

    _computeLocalPrediction: function(gr, featuresJSON, modelConfigInfoObject) {
        if (!featuresJSON) {
            this.log.logErr("Completed job CMDBDynamicIREProcessor::_computeLocalPrediction no active features provided");
            return null;
        }

        if (!modelConfigInfoObject) {
            this.log.logErr("Completed job CMDBDynamicIREProcessor::_computeLocalPrediction no modelConfigInfoObject provided");
            return null;
        }

        var results = {};
        while (gr.next()) {
            //for each featureset row get each featureValue as defined in the model from the table
            var product = Object.keys(featuresJSON).reduce(function(acc, key) {
                return acc + (featuresJSON[key].weight * gr.getValue(featuresJSON[key].featureColumnName));
            }, 0);

            var probability = 1 / (1 + Math.exp(-product));
            var confidence = probability > 0.5 ? probability * 100 : (1 - probability) * 100;
            var predictedValue = (probability > 0.5) ? "1" : "0";
            //structure modeled for how prediction service returns it, so they can be processed the same way
            results[gr.getUniqueValue()] = [{
                confidence: confidence,
                predictedValue: predictedValue
            }];
        }

        return JSON.stringify(results);
    },

    /**
     * Get table column where the table has data.
     */

    _getTableColumns: function(clazz) {

        var columns = [];
        try {

            // If the table has no data it will not be added.
            var grCheck = new GlideRecord(clazz);
            grCheck.setLimit(1);
            grCheck.query();
            if (grCheck.next()) {
                var fields = new GlideRecordUtil().getFields(grCheck);
                var gr = new GlideRecord('sys_db_object');
                // CMDB tables
                var column = '';
                for (var j = 0; j < fields.length; j++) {
                    if (!gs.nil(grCheck.sys_class_name) && gr.get('name', grCheck.sys_class_name)) {
                        // Extended tables
                        column = this._getColumnForTable(gr.super_class.name, fields[j], false);
                        if (!gs.nil(column))
                            columns.push(column);
                        else {
                            column = this._getColumnForTable(grCheck.sys_class_name, fields[j], false);
                            if (!gs.nil(column))
                                columns.push(column);
                        }

                    } else {
                        //None CMDB tables
                        if (gr.get('name', clazz)) {
                            column = this._getColumnForTable(gr.name, fields[j], false);
                            if (!gs.nil(column))
                                columns.push(column);
                        }
                    }
                }
            }

        } catch (ex) {
            this.log.logInfo(this.formatMessage("Info: _getTableColumns for class: {0}. Msg: {1}", [clazz, ex]));
        }
        return columns;
    },

    _unBias: function(result, value, bias, rev) {
        value /= 100;
        value = Math.log(value / (1 - value));

        if ((!rev && result == 1) ||
            (rev && result == 0))
            bias *= -1;

        value += bias;
        return 100 / (1 + Math.exp(-1 * value));
    },

    _updatePredictionAndProbability: function(resultsJSON, unBias, rev) {
        var results = JSON.parse(resultsJSON);

        var matchGr = new GlideRecord(this._CMDB_DYNAMIC_IRE_MATCH);
        matchGr.addQuery('feature_record', 'IN', Object.keys(results));
        matchGr.query();

        while (matchGr.next()) {
            var key = matchGr.getValue('feature_record');
            var result = results[key];

            var prediction = parseInt(result[0].predictedValue);
            var probability = +result[0].confidence;

            if (unBias)
                probability = this._unBias(prediction, probability, unBias, rev);

            if (probability < 50) {
                probability = 100 - probability;
                prediction = prediction == 1 ? 0 : 1;
            }

            matchGr.setValue('prediction', prediction);
            matchGr.setValue('probability', probability);
            if (!matchGr.update())
                this.log.logErr(this.formatMessage("Error: _updatePredictionAndProbability - unable to update the match record for sys_id: {0}.", [key]));
        }
    },

    _getColumnForTable: function(className, field, columnLabel) {
        var dict = new GlideRecord('sys_dictionary');
        dict.addQuery('name', className);
        dict.addQuery('element', field);
        dict.addActiveQuery();
        dict.query();
        if (dict.next()) {
            if (columnLabel)
                return dict.column_label;
            else
                return dict.element;
        }
        return null;
    },

    _getReferenceTableForColumn: function(referenceTable, field) {

        var gr = new GlideAggregate('sys_dictionary');
        gr.addQuery('name', referenceTable);
        // exclude entries for duplicate_of field
        gr.addQuery('element', field);
        gr.addAggregate('count');
        gr.orderByAggregate('count');
        gr.groupBy('reference');
        gr.query();
        if (gr.next())
            return '' + gr.reference;

        return null;
    },

    _getLookupTables: function(className) {
        var map = {};
        var tables = j2js(new TableUtils(className).getTables());
        for (var i = 0; i < tables.length; i++) {
            var refTables = this._getReferencingTables(tables[i]);
            for (var j = 0; j < refTables.length; j++)
                map[refTables[j]] = '';
        }

        var result = [];
        result.push(className);
        for (var tab in map)
            if (tab != className)
                result.push(tab);

        result = this._filterTables(result);
        return result;
    },

    _getLookupTablesForClassManager: function(className) {
        var result = [];
        var lookupTables = this._getLookupTables(className);
        for (var i = 0; i < lookupTables.length; i++) {
            if (className == lookupTables[i])
                continue;
            var entry = {};
            entry.value = lookupTables[i];
            entry.name = this._getClassLabel(lookupTables[i]);
            result.push(entry);
        }
        return result;
    },

    _filterColumns: function(columns) {

        var filtered = [];
        for (var i = 0; i < columns.length; i++) {
            var tbl = columns[i];
            var j = 0;
            while (j < this.filteredColumns.length) {
                if (tbl.indexOf(this.filteredColumns[j]) !== -1)
                    break;
                j++;
            }
            // filter out tables meant for workflow
            if (tbl.startsWith('var__'))
                continue;

            if (j == this.filteredColumns.length)
                filtered.push(tbl);
        }
        return filtered;
    },

    _filterTables: function(tables) {

        var filtered = [];
        for (var i = 0; i < tables.length; i++) {
            var tbl = tables[i];
            var j = 0;
            while (j < this.filteredTables.length) {
                if (tbl.indexOf(this.filteredTables[j]) !== -1)
                    break;
                j++;
            }
            // filter out tables meant for workflow
            if (tbl.startsWith('var__'))
                continue;

            if (j == this.filteredTables.length)
                filtered.push(tbl);
        }
        return filtered;
    },

    _getReferencingTables: function(table) {
        var referencingTables = [];
        var gr = new GlideAggregate('sys_dictionary');
        gr.addQuery('reference', table);
        // exclude entries for duplicate_of field
        gr.addQuery('element', '!=', 'duplicate_of');
        gr.addAggregate('count');
        gr.orderByAggregate('count');
        gr.groupBy('name');
        gr.query();
        while (gr.next())
            referencingTables.push('' + gr.name);

        return referencingTables;
    },

    _getClassLabel: function(className) {
        var descriptor = GlideTableDescriptor.get(className);
        return descriptor.getLabel();
    },

    _processFilterCMDBItems: function(maxFilteredRecords, maxRecords, filterClasses, staticCondition, condition, dynamicConditionColumns, modelId) {

        var swComplete = new GlideStopWatch();
        var complete = false;
        var processedRecCount = 0;
        var lastProccessId = '';
        var filter = {};

        while (!complete && condition) {

            var sw = new GlideStopWatch();
            complete = true;

            var tableGr = new GlideRecord(this._CMDB_CI);
            tableGr.addQuery('sys_class_name', 'IN', filterClasses.toString());

            if (!gs.nil(lastProccessId))
                tableGr.addQuery('sys_id', '>', lastProccessId);

            if (!gs.nil(staticCondition))
                tableGr.addEncodedQuery(staticCondition);

            // NOTE limit must be set BEFORE order by
            tableGr.setLimit(this.batchSize);
            tableGr.orderBy('sys_id');
            tableGr.query();

            while (tableGr.next()) {
                lastProccessId = tableGr.getUniqueValue();

                var invalid = false;
                var filterCIsGr = new GlideRecord(tableGr.getValue('sys_class_name'));
                for (var idx in dynamicConditionColumns) {
                    if (!filterCIsGr.isValidField(dynamicConditionColumns[idx])) {
                        invalid = true;
                        break;
                    }
                }

                if (invalid)
                    continue;

                filterCIsGr.addQuery('sys_id', '!=', tableGr.getUniqueValue());

                // Get the encodedQuery with the wildcards substituted for actaul values.
                var encodedQuery = this._getEncodedQueryCondition(dynamicConditionColumns, condition, tableGr);
                if (encodedQuery)
                    filterCIsGr.addEncodedQuery(encodedQuery);
                else
                    continue;

                if (0 != maxFilteredRecords)
                    filterCIsGr.setLimit(maxFilteredRecords);

                filterCIsGr.query();
                while (filterCIsGr.next())
                    this.createMatchRecord(tableGr.getUniqueValue(), tableGr.getValue('sys_class_name'), filterCIsGr.getUniqueValue(), filterCIsGr.getTableName(), false, modelId);


                processedRecCount++;
                if (maxRecords != 0 && processedRecCount >= maxRecords) {
                    complete = true;
                    break;
                }

                complete = false;
            }

            if (0 != tableGr.getRowCount()) {
                sw.stop();
                this.log.logDebug(this.formatMessage("Processing job CMDBDynamicIREProcessor::applyFilterConditions for filter. Processed {0} CI's of {1}. Found {2} duplicates. Duration: {3} (sec).", [processedRecCount.toString(), maxRecords.toString(), this.matchCount.toString(), sw.getTime() / 1000]));
            }
        }

        swComplete.stop();

        var message = this.formatMessage("Completed job CMDBDynamicIREProcessor::applyFilterConditions for filter. Processed {0} CI's of {1}. Found {2} duplicates. Duration: {3} (sec).", [processedRecCount.toString(), maxRecords.toString(), this.matchCount.toString(), swComplete.getTime() / 1000]);

        filter.message = message;
        filter.maximum_records = maxRecords;
        filter.processed_records = processedRecCount;
        filter.match_records = this.matchCount;
        filter.reference_filter = false;
        filter.processed_time = swComplete.getTime() / 1000;
        this.log.logInfo(message);
        return filter;
    },

    _processFilterReferenceItems: function(maxFilteredRecords, maxRecords, baseClassCITree, staticCondition, condition, dynamicConditionColumns, filterClass, referenceField, modelId) {

        var swComplete = new GlideStopWatch();
        var complete = false;
        var processedRecCount = 0;
        var lastProccessId = '';
        var filter = {};

        while (!complete) {

            var sw = new GlideStopWatch();
            complete = true;

            var tableGr = new GlideRecord(filterClass);
            var cmdbClass = this._getReferenceTableForColumn(filterClass, referenceField);
            var joinCondition = tableGr.addJoinQuery(cmdbClass, referenceField, 'sys_id');
            joinCondition.addCondition('sys_class_name', 'IN', baseClassCITree.toString());

            if (!gs.nil(lastProccessId))
                tableGr.addQuery('sys_id', '>', lastProccessId);

            if (!gs.nil(staticCondition)) {
                tableGr.addEncodedQuery(staticCondition);
            }

            // NOTE limit must be set BEFORE order by
            tableGr.setLimit(this.batchSize);
            tableGr.orderBy('sys_id');
            tableGr.query();

            while (tableGr.next()) {

                // Apply the filter condition
                if (!gs.nil(condition)) {

                    var filterCIsGr = new GlideRecord(filterClass);
                    var filterJoinCondition = filterCIsGr.addJoinQuery(cmdbClass, referenceField, 'sys_id');
                    filterJoinCondition.addCondition('sys_class_name', 'IN', baseClassCITree.toString());

                    // Get the encodedQuery with the wildcards substituted for actaul values.
                    var encodedQuery = this._getEncodedQueryCondition(dynamicConditionColumns, condition, tableGr);
                    if (!gs.nil(encodedQuery))
                        filterCIsGr.addEncodedQuery(encodedQuery);

                    filterCIsGr.addQuery('sys_id', '!=', tableGr.getUniqueValue());

                    if (0 != maxFilteredRecords)
                        filterCIsGr.setLimit(maxFilteredRecords);

                    filterCIsGr.query();

                    while (filterCIsGr.next())
                        this.createMatchRecord(tableGr[referenceField], tableGr[referenceField].sys_class_name, filterCIsGr[referenceField], filterCIsGr[referenceField].sys_class_name, true, modelId);

                    lastProccessId = tableGr.getUniqueValue();
                    processedRecCount++;

                    if (maxRecords != 0 && processedRecCount >= maxRecords) {
                        complete = true;
                        break;
                    }

                    complete = false;
                }
            }
            if (0 != tableGr.getRowCount()) {
                sw.stop();
                this.log.logDebug(this.formatMessage("Processing job CMDBDynamicIREProcessor::applyFilterConditions for filter. Processed {0} CI's of {1}. Found {2} matches. Duration: {3} (sec).", [processedRecCount.toString(), maxRecords.toString(), this.matchCount.toString(), sw.getTime() / 1000]));
            }
        }

        swComplete.stop();

        var message = this.formatMessage("Completed job CMDBDynamicIREProcessor::applyFilterConditions for filter. Processed {0} CI's of {1}. Found {2} matches. Duration: {3} (sec).", [processedRecCount.toString(), maxRecords.toString(), this.matchCount.toString(), swComplete.getTime() / 1000]);

        filter.message = message;
        filter.maximum_records = maxRecords;
        filter.processed_records = processedRecCount;
        filter.match_records = this.matchCount;
        filter.reference_filter = true;
        filter.processed_time = swComplete.getTime() / 1000;
        this.log.logInfo(message);
        return filter;
    },

    _getColumnFromQuery: function(conditionQuery) {

        var columns = [];
        var conditionColumn = conditionQuery.split('^');

        for (var i = 0; i < conditionColumn.length; i++) {

            if (gs.nil(conditionColumn[i]))
                continue;

            var column = '';

            conditionColumn[i].replace(/[a-z_.]/g, function(m) {
                column = column + m;
            });
            if (!gs.nil(column))
                columns.push(column);

        }
        return columns;
    },

    _safeGetRefRecord: function(gr, referenceField) {
        var refTable = gr.getElement(referenceField).getReferenceTable();
        var refSysId = gr.getValue(referenceField);
        if (!refSysId || !refTable)
            return null;
        var refGr = new GlideRecord(refTable);
        if (!refGr.get(refSysId))
            return null;
        return refGr;
    },

    formatMessage: function(str, args) {
        this._replaceExpr = this._replaceExpr || [];

        for (var i = 0; i < args.length; i++) {
            if (i >= this._replaceExpr.length)
                this._replaceExpr[i] = new RegExp('\\{' + i + '\\}', 'gi');

            str = str.replace(this._replaceExpr[i], args[i]);
        }

        return str;
    },

    type: 'CMDBDynamicIREProcessor'
};
