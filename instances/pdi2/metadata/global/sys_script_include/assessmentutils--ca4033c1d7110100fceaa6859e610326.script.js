var AssessmentUtils = Class.create();

AssessmentUtils.prototype = {
    DefaultMaxOrder: 100,

    initialize: function() {

    },

	/**
	* This is a function to generate all necessary m2m records between this category and its assessable records.
	* This function is usually called after the category's filter gets changed.
	*
	* @param {GlideRecord} grCat - A glide record of the category
	* @param {Boolean} isDomainPluginActive - True if domain plugin is active.
	* @return {Array} m2mCatAsbleArr - A list of sysids of 'asmt_m2m_category_assessment' associated with this category
	*/
	generateM2mCategoryAssessmentsIfNotExisted: function(grCat, isDomainPluginActive) {
		var m2mCatAsbleArr = [];

		if (grCat.table != '') {
			var totalNumOfAsbleRrd = 0;
			var aggrAsbleRrd = new GlideAggregate("asmt_assessable_record");
			aggrAsbleRrd.addQuery("metric_type", grCat.metric_type);
			aggrAsbleRrd.addAggregate('COUNT');
			aggrAsbleRrd.query();
			if (aggrAsbleRrd.next())
				totalNumOfAsbleRrd = aggrAsbleRrd.getAggregate('COUNT');

			// Here, we won't query source table until assessable records are generated for this assessment. This can improve the performance for new assessment category
			if (totalNumOfAsbleRrd > 0) {
				// Find all source records based on category's filter condition
				var sourceIds = [];
				var grSource = new GlideRecord(grCat.table);
				grSource.addEncodedQuery(grCat.filter);
				grSource.query();
				while(grSource.next()) {
					sourceIds.push(grSource.getUniqueValue());
				}

				var asbleRrdObj = {};// assessable record's sysid -> its domain
				var grAsbleRrd = new GlideRecord("asmt_assessable_record");
				grAsbleRrd.addQuery("metric_type", grCat.metric_type);
				grAsbleRrd.addQuery("source_id", "IN", sourceIds);
				grAsbleRrd.query();
				while (grAsbleRrd.next()) {
					if (isDomainPluginActive) {
						asbleRrdObj[grAsbleRrd.getUniqueValue()] = grAsbleRrd.sys_domain;
					} else {
						asbleRrdObj[grAsbleRrd.getUniqueValue()] = "global";
					}
				}

				for (var arId in asbleRrdObj) {
					var grM2mCatAsble = new GlideRecord("asmt_m2m_category_assessment");
					grM2mCatAsble.addQuery("category", grCat.getUniqueValue());
					grM2mCatAsble.addQuery("assessment_record", arId);
					grM2mCatAsble.query();
					if (!grM2mCatAsble.next()) {
						// Insert a new m2m record if not found
						grM2mCatAsble.initialize();
						grM2mCatAsble.assessment_record = arId;
						grM2mCatAsble.category = grCat.getUniqueValue();
						if (isDomainPluginActive) {
							grM2mCatAsble.sys_domain = asbleRrdObj[arId];
						}
						grM2mCatAsble.insert();
					}
					m2mCatAsbleArr.push(grM2mCatAsble.getUniqueValue());
				}
			}
		}
		return m2mCatAsbleArr;
	},

	/**
	* This is a function to remove old m2m records between this category and its assessable records.
	* This function is usually called after the category's filter gets changed.
	*
	* @param {GlideRecord} grCat - A glide record of the category (old and previous)
	* @param {Array} m2mCatAsbleArr - A list of current sysids of asmt_m2m_category_assessment for this category
	*/
	removeOldM2mCategoryAssessments: function(grCat, m2mCatAsbleArr) {
		var grM2mCatAsble = new GlideRecord("asmt_m2m_category_assessment");
		grM2mCatAsble.addQuery("category", grCat.getUniqueValue());
		grM2mCatAsble.addQuery("sys_id", "NOT IN", m2mCatAsbleArr);
		grM2mCatAsble.deleteMultiple();
	},

    // User can use UI actions on form only when they have admin role or when they are one of the survey owners.
    canUseUiAction: function(metricType) {
        if (gs.hasRole("survey_admin") || gs.hasRole("assessment_admin"))
            return true;

        if (gs.hasRole("survey_creator")) {
            if (metricType.isNewRecord())
                return true;
            var owners = metricType.getValue("survey_owners");
            if (!gs.nil(owners) && owners.indexOf(gs.getUserID()) !== -1)
                return true;
        }
        return false;
    },

    // Users can view scorecard UI page only when they have admin role or they are one of the survey owners.
    // Return type: boolean false or true
    canViewScoreCardPage: function(metricTypeId) {
        var metricType = new GlideRecord("asmt_metric_type");
        metricType.addQuery("sys_id", metricTypeId);
        metricType.query();
        if (metricType.next()) {
            if (gs.hasRole("survey_admin") || gs.hasRole("assessment_admin") || gs.hasRole("survey_reader"))
                return true;

            if (gs.hasRole("survey_creator")) {
                var owners = metricType.getValue("survey_owners");
                if (!gs.nil(owners) && owners.indexOf(gs.getUserID()) !== -1)
                    return true;
            }
        }
        return false;
    },

	getQueryCondition : function(current) {
		var ids = [];
		var metricId = current.getUniqueValue();
		var typeId = current.metric_type + '';
		var categoryId = current.category + '';
		var method = current.metric_type.evaluation_method;
		ids.push(current.getUniqueValue());
	
		this.getValidDependencyMetrics(typeId, metricId, ids);
		
		var encodedQuery = '';
		if (method != 'vdr_risk_asmt')
			encodedQuery = 'category=' + categoryId + '^sys_idNOT IN' + ids.join(',');
		else {
            var external_class = ['questionnaire_template', 'document_request_template', 'fourth_party_template'];
            var classification = current.metric_type.classification + '';
            var disableCrossCategoryDependencyQuery = 'metric_type=' + typeId + '^category=' + categoryId + '^sys_idNOT IN' + ids.join(',');
            var enableCrossCategoryDependencyQuery = 'metric_type=' + typeId + '^sys_idNOT IN' + ids.join(',');
            
            var isInternalAssessment = external_class.indexOf(classification) == -1;
            encodedQuery = isInternalAssessment ? disableCrossCategoryDependencyQuery : enableCrossCategoryDependencyQuery;
        }

		return encodedQuery;
	},
	
	getValidDependencyMetrics : function (typeId, metricId, ids) {
		var metric = new GlideRecord('asmt_metric');
		metric.addQuery('metric_type', typeId);
		metric.addQuery('depends_on', metricId);
		metric.query();
		
		while (metric.next()){
			ids.push(metric.getUniqueValue());
			this.getValidDependencyMetrics(typeId, metric.getUniqueValue(), ids);
		}
	},

    // Generating assessable records for a particular metric type
    generateAssessableRecords: function(asmtMetricTypeSysId) {
        var metricTypeRecord = this._getAsmtMetricTypeRecord(asmtMetricTypeSysId);
        (new SNC.AssessmentCreation()).createAssessableRecords(metricTypeRecord);
    },

    // publishing a metric type 
    publish: function(asmtMetricTypeSysId) {
        var metricTypeRecord = this._getAsmtMetricTypeRecord(asmtMetricTypeSysId);
        metricTypeRecord.publish_state = "published";
        metricTypeRecord.update();

    },

    // setting user field in a metric type.
    setUserField: function(asmtMetricTypeSysId, feild) {
        var metricTypeRecord = this._getAsmtMetricTypeRecord(asmtMetricTypeSysId);
        metricTypeRecord.user_field = feild;
        metricTypeRecord.update();
    },

    // reset user field in a metric type.
    resetUserField: function(asmtMetricTypeSysId) {
        var metricTypeRecord = this._getAsmtMetricTypeRecord(asmtMetricTypeSysId);
        metricTypeRecord.user_field = "";
        metricTypeRecord.update();
    },

    // setting user field in a metric type.
    getUserField: function(asmtMetricTypeSysId) {
        var metricTypeRecord = this._getAsmtMetricTypeRecord(asmtMetricTypeSysId);
        return metricTypeRecord.user_field;
    },

    // setting metric type condition filter.
    setMetricTypeCondition: function(asmtMetricTypeSysId, metricCondition) {
        var metricTypeRecord = this._getAsmtMetricTypeRecord(asmtMetricTypeSysId);
        metricTypeRecord.condition = metricCondition;
        metricTypeRecord.update();
    },

    // getting metric type condition filter.
    getMetricTypeCondition: function(asmtMetricTypeSysId) {
        var metricTypeRecord = this._getAsmtMetricTypeRecord(asmtMetricTypeSysId);
        return metricTypeRecord.condition;
    },

    //set enforce condition to true
    setEnforceConditionTrue: function(asmtMetricTypeSysId) {
        var metricTypeRecord = this._getAsmtMetricTypeRecord(asmtMetricTypeSysId);
        metricTypeRecord.enforce_condition = true;
        metricTypeRecord.update();
    },

    // populating all the assessable records in a metric category from its metric type
    pullAssessableRecords: function(metricType, metricCategory) {

        var assmtRecord = new GlideRecord('asmt_assessable_record');
        assmtRecord.addQuery('metric_type', metricType);
        assmtRecord.query();
        while (assmtRecord.next()) {
            var asmtm2m = new GlideRecord('asmt_m2m_category_assessment');
            this._addRecord(asmtm2m, assmtRecord, metricCategory);

        }
    },

    deleteMetricCategoryAssessableRecords: function(metricCategory) {
        var asmtm2m = new GlideRecord('asmt_m2m_category_assessment');
        asmtm2m.addQuery('category', metricCategory);
        asmtm2m.query();
        asmtm2m.deleteMultiple();
    },

    // get all the category users of a metric category
    getCategoryUsers: function(metricCategorySysId) {
        var users = [];
        var assmtRecord = new GlideRecord('asmt_m2m_category_user');
        assmtRecord.addQuery('metric_category', metricCategorySysId);
        assmtRecord.query();
        while (assmtRecord.next()) {
            users.push(assmtRecord.getValue('user'));
        }
        return users;
    },

    // deletes category user for a metric category
    deleteCategoryUsers: function(metricCategorySysId, users) {
        var grr = new GlideRecord('asmt_m2m_category_user');
        grr.addQuery('metric_category', metricCategorySysId);
        if (users) {
            grr.addQuery('user', 'IN', users);
        }
        grr.query();
        grr.deleteMultiple();
    },

    // helper function to add assessable record from metric type to metric category
    _addRecord: function(asmtm2m, assmtRecord, metricCategory) {
        asmtm2m.addQuery('assessment_record', assmtRecord.getUniqueValue());
        asmtm2m.addQuery('category', metricCategory);
        asmtm2m.query();
        if (asmtm2m.getRowCount() == 0) {
            asmtm2m.initialize();
            asmtm2m.assessment_record = assmtRecord.getUniqueValue();
            asmtm2m.category = metricCategory;
            asmtm2m.insert();
        }
    },

    // helper fuction for returning glide record on metric type table.
    _getAsmtMetricTypeRecord: function(asmtMetricTypeSysId) {
        var metricTypeRecord = new GlideRecord('asmt_metric_type');
        metricTypeRecord.get(asmtMetricTypeSysId);
        return metricTypeRecord;
    },

    // Remove specific stakeholder
    deleteStakeholder: function(assessableRecordId, categoryUserId) {
        var stakeholder = new GlideRecord("asmt_m2m_stakeholder");
        stakeholder.addQuery("assessment_record", assessableRecordId);
        stakeholder.addQuery("category_user", categoryUserId);
        stakeholder.query();
        if (stakeholder.next())
            stakeholder.deleteRecord();
    },

    // Return a GlideRecord obj of m2m category user based on given metric category id and user id
    getM2mCategoryUserByCategoryAndUser: function(metricCategoryId, userId) {
        var catUser = new GlideRecord("asmt_m2m_category_user");
        catUser.addQuery("metric_category", metricCategoryId);
        catUser.addQuery("user", userId);
        catUser.query();
        return catUser;
    },

    // Check if a category user has been used in other assessable records
    ifThisCategoryUserUsedInOtherAssessableRecord: function(metricCategoryId, categoryUserId, assessableRecordId) {
        var count = 0;
        var catAsmt = new GlideRecord("asmt_m2m_category_assessment");
        catAsmt.addQuery("category", metricCategoryId);
        catAsmt.addEncodedQuery("assessment_record.sys_id!=" + assessableRecordId);
        catAsmt.query();
        while (catAsmt.next()) {
            var stakeholder = this.getM2mStakeholderByAssessableRecordAndCategoryUser(catAsmt.assessment_record, categoryUserId);
            if (stakeholder.hasNext()) {
                count += 1;
                break;
            }
        }
        return count > 0;
    },

    // Get assessor from assessable record
    // Return a sys id of user
    getAssessorFromAssessableRecord: function(assessableRecordId, userField) {
        if (gs.nil(userField))
            return "";

        var ar = new GlideRecord("asmt_assessable_record");
        ar.get(assessableRecordId);

        var sourceTable = ar.getValue("source_table");
        var sourceId = ar.getValue("source_id");
        if (!sourceTable || !sourceId)
            return "";

        var source = new GlideRecord(sourceTable);
        source.get(sourceId);
        return source.getElement(userField).toString();
    },

    // This method is used to find a map between assessable records and assessors based on "User Field".
    // Key: the sys id of assessable records; Value: user sys id.
    getMapOfAssessableRecordsAndUsers: function(metricType) {
        var assbleRecordAndUser = {};

        if (gs.nil(metricType.user_field))
            return assbleRecordAndUser;

        var ar = new GlideRecord("asmt_assessable_record");
        ar.addQuery("metric_type", metricType.sys_id);
        ar.query();
        while (ar.next()) {
            var source = new GlideRecord(ar.source_table);
            source.get(ar.source_id);
            var user_id = source.getElement(metricType.user_field).toString();
            assbleRecordAndUser[ar.sys_id] = user_id;
        }
        return assbleRecordAndUser;
    },

    // Return a GlideRecord obj of metric category based on given metric type sys id.
    getMetricCategoryByType: function(metricTypeId) {
        var metricCategory = new GlideRecord("asmt_metric_category");
        metricCategory.addQuery("metric_type", metricTypeId);
        metricCategory.query();
        return metricCategory;
    },

    // Return a GlideRecord obj of m2m category assessment based on given metric category sys id.
    getM2mCategoryAssessmentByCategory: function(metricCategoryId) {
        var catAsmt = new GlideRecord("asmt_m2m_category_assessment");
        catAsmt.addQuery("category", metricCategoryId);
        catAsmt.query();
        return catAsmt;
    },

    // Return a GlideRecord obj of m2m category user based on given metric category id and user id
    getCategoryUserByCategoryAndUser: function(metricCategoryId, userId) {
        var catUser = new GlideRecord("asmt_m2m_category_user");
        catUser.addQuery("metric_category", metricCategoryId);
        catUser.addQuery("user", userId);
        catUser.query();
        return catUser;
    },

    // Return a GlideRecord obj of m2m stakeholder by given assessable record syd id and category user sys id.
    getM2mStakeholderByAssessableRecordAndCategoryUser: function(assessableRecordId, CategoryUserId) {
        var stakeholder = new GlideRecord("asmt_m2m_stakeholder");
        stakeholder.addQuery("assessment_record", assessableRecordId);
        stakeholder.addQuery("category_user", CategoryUserId);
        stakeholder.query();
        return stakeholder;
    },

    // Create category user by metric category is and user id
    createCategoryUser: function(metricCategoryId, userId) {
        var catUser = new GlideRecord("asmt_m2m_category_user");
        catUser.addQuery("metric_category", metricCategoryId);
        catUser.addQuery("user", userId);
        catUser.query();
        if (!catUser.next()) {
            catUser.initialize();
            catUser.setValue("metric_category", metricCategoryId);
            catUser.setValue("user", userId);
            catUser.insert();
        }
        return catUser;
    },

    setSessionLanguage: function(languageId) {
        // Check if this language is valid or not
        // English must be valid by default
        if (languageId != 'en') {
            var sysLangs = new GlideRecord("sys_language");
            sysLangs.addActiveQuery();
            sysLangs.addQuery("id", languageId);
            sysLangs.query();
            if (!sysLangs.hasNext())
                return false;
        }

        GlideSession.get().getUser().setPreference("user.language", languageId);
        return true;
    },

    getAssessment: function(metricTypeId) {

        var surveyInfo = {};

        //Read the metric type info
        var metricType = new GlideRecord('asmt_metric_type');
        metricType.addQuery('sys_id', metricTypeId);
        metricType.query();
        metricType.next();
        surveyInfo.name = metricType.getValue('name');
        surveyInfo.description = metricType.getValue('name');
        surveyInfo.surveyId = metricTypeId;
        surveyInfo.assignToUsers = this.getAssignToUsers(metricTypeId);


        // Read all the metrics(questions)
        var metrics = [];
        var metricInfo = new GlideRecord('asmt_metric');
        metricInfo.addQuery('metric_type', metricTypeId);
        metricInfo.orderBy('order');
        metricInfo.query();

        while (metricInfo.next()) {
            var metric = {};
            metric.name = metricInfo.getValue('name');
            metric.datatype = metricInfo.getValue('datatype');
            metric.depends_on = metricInfo.getValue('depends_on');
            metric.sys_id = metricInfo.getValue('sys_id');
            metric.auto_gen = metricInfo.getValue('auto_gen');
            metric.scored = metricInfo.getValue('scored');
            metric.active = metricInfo.getValue('active');
            metric.hasResult = this.metricHasResult(metricInfo.getValue('sys_id'));

            var options = {};
            switch (metricInfo.getValue('datatype')) {
                case 'scale':
                case 'choice':
                    //Read all the answers (metric definitions)
                    options = [];
                    var answers = new GlideRecord('asmt_metric_definition');
                    answers.addQuery('metric', metricInfo.getValue('sys_id'));
                    answers.orderBy('order');
                    answers.query();
                    while (answers.next()) {
                        options.push({
                            "sys_id": answers.getValue('sys_id'),
                            "answer": answers.getValue('display')
                        });
                    }
                    break;

                case 'long':
                case 'percentage':
                case 'numericscale':
                    options = {
                        'min': metricInfo.getValue('min'),
                        'max': metricInfo.getValue('max')
                    };
                    break;

                case 'string':
                    options = {
                        'textSize': metricInfo.getValue('string_option')
                    };
                    break;

                case 'boolean':
                    if (metric.scored == 1) {
                        metric.datatype = 'attestation';
                        options = {
                            'correct_answer': metricInfo.getValue('correct_answer'),
                            'explain': this.getDependentExplainText(metric.sys_id)
                        };
                    }

                    break;

                case 'template':
                    options = {
                        'templateType': metricInfo.getValue('template')
                    };
                    break;

                default:
                    break;
            }

            metric.options = options;
            metrics.push(metric);
        }

        surveyInfo.metrics = metrics;
        return (new JSON()).encode(surveyInfo);
    },

    createAssessments: function(typeId, sourceId, userId, groupId) {
        return (new SNC.AssessmentCreation()).createAssessments(typeId, sourceId, userId, false, groupId);
    },

    // Get assessments for this type, source, user, and delete if they are not started, otherwise close
    removeAssessments: function(typeId, groupId, userId) {
        var gr = GlideRecord('asmt_assessment_instance');
        gr.addQuery('assessment_group', groupId);
        gr.addQuery('user', userId);
        gr.query();
        while (gr.next()) {
            if (gr.state == 'ready')
                this.deleteInstance(gr);
            else
                this.closeInstance(gr);
        }
    },

    // Close all assessments in this group.
    closeAssessments: function(groupId) {
        var gr = GlideRecord('asmt_assessment_instance');
        gr.addQuery('assessment_group', groupId);
        gr.query();
        while (gr.next())
            this.closeInstance(gr);
    },

    deleteInstance: function(grInst) {
        if (grInst.sys_id) { // Checking record and id are valid
            var delQuestions = GlideRecord('asmt_assessment_instance_question');
            delQuestions.addQuery('instance', grInst.sys_id);
            delQuestions.query();
            delQuestions.deleteMultiple();
        }
        grInst.deleteRecord();
    },

    closeInstance: function(grInst) {
        if (grInst.state != 'complete')
            grInst.state = 'canceled';
        if (grInst.due_date > gs.daysAgo(1))
            grInst.due_date = gs.daysAgo(1);
        grInst.update();
    },

    metricHasResult: function(metricId) {
        var metric = new GlideRecord('asmt_metric_result');
        metric.addQuery('metric', metricId);
        metric.setLimit(1);
        metric.query();
        return metric.hasNext();
    },

    getDependentExplainText: function(metricId) {
        var metric = new GlideRecord('asmt_metric');
        metric.addQuery('depends_on', metricId);
        metric.addQuery('auto_gen', true);
        metric.query();
        metric.next();
        return metric.getValue("name");
    },

    getAssignToUsers: function(metricTypeId) {
        var ctd_name = new GlideRecord('asmt_metric_type');
        ctd_name.get(metricTypeId);
        var name = ctd_name.getValue('name');

        var cat = new GlideRecord('asmt_metric_category');
        cat.addQuery('metric_type', metricTypeId);
        cat.addQuery('name', name);
        cat.orderBy('order');
        cat.query();
        cat.next();
        var catId = cat.sys_id;

        var users = [];
        var catUserGr = new GlideRecord('asmt_m2m_category_user');
        catUserGr.addQuery('metric_category', catId);
        catUserGr.orderBy('user');
        catUserGr.query();
        while (catUserGr.next()) {
            users.push({
                "user": catUserGr.getValue("user"),
                "name": catUserGr.getDisplayValue("user")
            });
        }
        return users;
    },

    getAllCategoryUsers: function(type_id) {
        var ids = [];
        var catUserGr = new GlideAggregate('asmt_m2m_category_user');
        catUserGr.addQuery('metric_category.metric_type', type_id);
        catUserGr.orderBy('user');
        catUserGr.setUnique(true);
        catUserGr.query();
        while (catUserGr.next())
            ids.push(catUserGr.getValue("user"));

        return ids.join(",");
    },

    getTypeFilter: function() {
        var view = gs.getSession().getClientData("asmt_view");
        if (view)
            return "evaluation_method=" + view;
        else
            return "";
    },

    checkRecord: function(current, metricType, byPassCheck) {
        if (!current.isValidRecord())
            return;

        var mt = new GlideRecord('asmt_metric_type');
        mt.get(metricType);
        var condition = mt.condition;

        var matched = false;
        if (byPassCheck)
            matched = true;
        else {
            var sourceRecord = new GlideRecord(current.getTableName());
            sourceRecord.addQuery('sys_id', current.sys_id);
            sourceRecord.addEncodedQuery(mt.condition + '');
            sourceRecord.setLimit(1);
            sourceRecord.query();
            matched = sourceRecord.hasNext();
        }

        var tables = this.getTableHierarchy(current);
        var gr = new GlideRecord("asmt_assessable_record");
        gr.addQuery("source_id", current.sys_id);
        gr.addQuery("source_table", "IN", tables.join());
        gr.addQuery("metric_type", metricType);
        gr.query();

        // if the metric type has enforce condition set to true and
        // there is a matching assessable record, delete it
        if (!matched) {
            if (mt.enforce_condition && gr.hasNext()) {
                gr.next();
                gr.deleteRecord();
            }
            return;
        }

        // if the source record matches the metric type condition
        // and there is no assessable record, create one
        if (matched && !gr.hasNext()) {
            gr.source_id = current.sys_id;
            gr.source_table = current.getTableName();
            gr.name = current.name;
            gr.metric_type = metricType;
            gr.insert();
        }
    },

    /* get an array of table hierarchy of the current record. 
     * For example, current is an incident GR, it will return ['incident', 'task']
     */
    getTableHierarchy: function(gr) {
        var tables = [];
        if (!gr || !gr.isValidRecord())
            return tables;

        tables.push(gr.getTableName()); // use an array to store the table names
        var sysDbObjectGr = new GlideRecord('sys_db_object');
        sysDbObjectGr.addQuery('name', gr.getTableName());
        sysDbObjectGr.addNotNullQuery('super_class');
        sysDbObjectGr.setLimit(1);
        sysDbObjectGr.query();
        if (sysDbObjectGr.next())
            this._getTableHierarchyHelper(sysDbObjectGr.super_class, tables);

        return tables;
    },

    _getTableHierarchyHelper: function(element, tables) {
        if (!element || !element.name)
            return;

        tables.push(element.name + '');
        if (!element.super_class.nil())
            this._getTableHierarchyHelper(element.super_class, tables);
    },

    checkDeleteRecord: function(current, metricType, showError) {
        var gr = new GlideRecord('asmt_metric_result');
        gr.addQuery('metric.metric_type', metricType);
        gr.addQuery('source_id', current.sys_id);
        gr.addQuery('source_table', current.getTableName());
        gr.setLimit(1);
        gr.query();
        if (gr.next()) {
            if (showError)
                gs.addErrorMessage(gs.getMessage('Items with related metric results cannot be deleted'));
            return false;
        }

        gr = new GlideRecord('asmt_category_result');
        gr.addQuery('metric_type', metricType);
        gr.addQuery('source_id', current.sys_id);
        gr.addQuery('source_table', current.getTableName());
        gr.setLimit(1);
        gr.query();
        if (gr.next()) {
            if (showError)
                gs.addErrorMessage(gs.getMessage('Items with related category results cannot be deleted'));
            return false;
        }

        gr = new GlideRecord('asmt_assessable_record');
        gr.addQuery('metric_type', metricType);
        gr.addQuery('source_id', current.sys_id);
        gr.addQuery('source_table', current.getTableName());
        gr.deleteMultiple();

        gr = new GlideRecord('asmt_assessment_instance_question');
        gr.addQuery('instance.metric_type', metricType);
        gr.addQuery('source_id', current.sys_id);
        gr.addQuery('source_table', current.getTableName());
        gr.deleteMultiple();
        return true;
    },

    domainsAreEqual: function(domain1, domain2) {
        if (this.domainNormalize(domain1) == this.domainNormalize(domain2))
            return true;
        return false;
    },

    domainNormalize: function(domainValue) {
        var domain = '';
        if ((domainValue === undefined) || domainValue.nil())
            return domain;
        if (domainValue.indexOf('global') >= 0)
            return domain;
        // When domainValue is Java string then rihno errors out because of
        // ambiguity. Java String has both replace(CharSequence,CharSequence)
        // and replace(String,String).
        var trimmedString = j2js(domainValue).replace(/^\s+|\s+$/g, ''); // trim
        return trimmedString === 'global' ? '' : trimmedString;
    },

    domainIsGlobal: function(domainValue) {
        return (this.domainNormalize(domainValue) == '');
    },

    defaultMatrix: function(current) {
        var gr = new GlideRecord("asmt_decision_matrix");
        gr.addQuery("isdefault", true);
        gr.addQuery("metric_type", "881df17dd7240100fceaa6859e610366");
        gr.query();
        if (!gr.hasNext()) {
            gr = new GlideRecord("asmt_decision_matrix");
            gr.addQuery("metric_type", "881df17dd7240100fceaa6859e610366");
            gr.query();
        }

        if (gr.next())
            return gr.sys_id.toString();
        else
            return null;
    },

    hasAssessmentRoles: function(roles) {
        var isAssessmentAdmin =  gs.hasRole('assessment_admin');
        if (isAssessmentAdmin)
            return true;
        try {
            var Roles = roles.split(',');
            for (var i = 0; i < Roles.length; i++) {
                if (gs.hasRole(Roles[i]))
                    return true;
            }
        } catch (e) {
            gs.log('AssessmentUtils:hasAssessmentRoles: Exception: ' + e);
        }
        return false;
    },

    createStakeholders: function(categoryUserSys, assessmentSys) {
        var stakeholder = new GlideRecord("asmt_m2m_stakeholder");
        stakeholder.addQuery("category_user", categoryUserSys);
        stakeholder.addQuery("assessment_record", assessmentSys);
        stakeholder.query();
        if (!stakeholder.hasNext()) {
            stakeholder.initialize();
            stakeholder.category_user = categoryUserSys;
            stakeholder.assessment_record = assessmentSys;
            stakeholder.insert();
        }
    },

    getMetricTypeFilters: function(metricTypeId) {
        var metricType = new GlideRecord('asmt_metric_type');

        metricType.get(metricTypeId);
        var table = metricType.table + '';
        var condition = metricType.condition + '';
        var groupField = metricType.display_field + '';
        var filterTable = metricType.filter_table + '';
        var filterCondition = metricType.filter_condition + '';
        var showAllGroups = metricType.display_all_filters;

        return this.getFilters(metricTypeId, table, groupField, condition, filterTable, filterCondition, showAllGroups);
    },

    getFilters: function(metricTypeId, table, groupField, condition, filterTable, filterCondition, showAllGroups) {

        var uniqueGroups = {};
        if (filterTable == '')
            return [];

        var groupIsReference = false;
        if (table != filterTable)
            groupIsReference = true;
        else {
            var type = new GlideRecord(table);
            if (groupField !== 'none') {
                var refFieldType = type.getElement(groupField).getED().getInternalType();
                if (refFieldType == 'glide_list' || refFieldType == 'reference')
                    groupIsReference = true;
            }
        }

        if (!groupIsReference) {
            var gr1 = new GlideAggregate(table);
            gr1.addEncodedQuery(filterCondition);
            gr1.groupBy(groupField);
            gr1.query();
            while (gr1.next()) {
                var value = gr1[groupField] || '';
                uniqueGroups[value] = true;
            }
        } else if (showAllGroups == 'true' || showAllGroups == true) {
            var gr2 = new GlideRecord(filterTable);
            gr2.addEncodedQuery(filterCondition);
            gr2.query();
            uniqueGroups[''] = true;
            while (gr2.next())
                uniqueGroups[gr2.sys_id + ''] = true;
        } else {
            var acceptableValuesMap = {};
            var gr3 = new GlideRecord(filterTable);
            gr3.addEncodedQuery(filterCondition);
            gr3.query();
            while (gr3.next())
                acceptableValuesMap[gr3.sys_id + ''] = true;

            var gr4 = new GlideAggregate(table);

            var domain = this.getMetricDomain(metricTypeId);
            if (domain != null)
                gr4.addQuery('sys_domain', domain);
            if (condition)
                gr4.addEncodedQuery(condition);
            gr4.groupBy(groupField);
            gr4.query();

            while (gr4.next()) {
                var groupValues = gr4[groupField];
                if (!groupValues && !filterCondition) {
                    uniqueGroups[''] = true;
                    continue;
                }

                groupValues = groupValues.split(',');
                for (var i = 0; i < groupValues.length; i++) {
                    if (groupValues[i] in acceptableValuesMap)
                        uniqueGroups[groupValues[i]] = true;
                }
            }
        }

        var allOptions = [];
        for (var key in uniqueGroups) {
            if (key === undefined || key == null)
                continue;
            if (key == '') {
                allOptions.push({
                    display: '(empty)',
                    value: '(empty)'
                });
            } else if (!groupIsReference) {
                allOptions.push({
                    display: key,
                    value: key
                });
            } else
                allOptions.push(this._getReferenceOption(key, filterTable));
        }

        // Sort by display
        allOptions.sort(function(a, b) {
            if (a.display < b.display)
                return -1;
            else if (a.display > b.display)
                return 1;
            else
                return 0;
        });

        return allOptions;
    },

    _getReferenceOption: function(value, table) {
        var gr = new GlideRecord(table);
        gr.get(value);
        var display = gr.getDisplayValue();
        return {
            display: display,
            value: value
        };
    },

    getMetricDomain: function(id) {
        if (!GlidePluginManager.isActive('com.glide.domain'))
            return null;

        var gr = new GlideRecord('asmt_metric_type');
        gr.get(id);
        return gr.sys_domain + '';
    },

    // Survey Instance Table URL
    getAssessmentInstanceURL: function( /* String */ instance) {
        var gr = new GlideRecord("asmt_assessment_instance");
        var type = '';
        if (gr.get(instance)) {
            var asmtRec = new GlideRecord("asmt_metric_type");
            asmtRec.addQuery("sys_id", gr.getValue("metric_type"));
            asmtRec.query();
            if (asmtRec.next())
                type = asmtRec.getValue("sys_id");
        }
        var instanceURL = gs.getProperty("glide.servlet.uri");
        var overrideURL = gs.getProperty("glide.email.override.url");
        var url = "";
        if (this.redirectToPortal() == 'true') {
            if (asmtRec.allow_public)
                url = instanceURL + this.defaultServicePortal + '?id=public_survey&instance_id=' + instance;
            else
                url = instanceURL + this.defaultServicePortal + '?id=take_survey&instance_id=' + instance;
        } else {
            if (overrideURL)
                instanceURL = overrideURL;
            else
                instanceURL = instanceURL + "nav_to.do";

            url = instanceURL + '?uri=%2Fassessment_take2.do%3Fsysparm_assessable_type=' + type + '%26sysparm_assessable_sysid=' + instance;
        }

        return url;
    },

    // External Survey URL; includes processor that will auto create instance for
    // unassigned Survey/Assessments
    getAssessmentTypeURL: function( /* String */ type) {
        var url = gs.getProperty('glide.servlet.uri');
        var isSurveyPublic = false;
        var eval_method = "";
        var typeGr = new GlideRecord("asmt_metric_type");
        if (typeGr.get(type)) {
            isSurveyPublic = typeGr.allow_public;
            eval_method = typeGr.evaluation_method;
        }
        if (eval_method == "survey" && this.redirectToPortal() == "true") {
            if (isSurveyPublic)
                url += this.defaultServicePortal + '?id=public_survey&type_id=' + type;
            else
                url += this.defaultServicePortal + '?id=take_survey&type_id=' + type;
        } else {
            if (isSurveyPublic)
                url += 'assessment_take2.do?sysparm_assessable_type=' + type;
            else
                url += 'nav_to.do?uri=assessment_take2.do%3Fsysparm_assessable_type=' + type;
        }

        return url;
    },

    redirectToPortal: function() {
        var isServicePortalActive = pm.isActive("com.glide.service-portal") &&
            pm.isActive("com.glide.service-portal.survey");
        var emailRedirectProp = gs.getProperty("sn_portal_surveys.sp_survey.email_redirection", true);
        var hasDefaultPortal = false;
        var redirectToPortal = false;
        if (isServicePortalActive) {
            var gr = new GlideRecord('sp_portal');
            gr.addQuery('default', 'true');
            gr.query();
            if (gr.next()) {
                hasDefaultPortal = true;
                this.defaultServicePortal = gr.getValue('url_suffix');
            }
        }
        redirectToPortal = isServicePortalActive && hasDefaultPortal && emailRedirectProp;
        return redirectToPortal;
    },

    //Hide button "Send Invitations" if there is no user or metric or recipient list for the survey.
    hasUserAndMetric: function(metricType) {
        var countQuestions = 0;
        var countUsers = 0;
        var metricGr = new GlideRecord('asmt_metric');
        metricGr.addQuery('metric_type', metricType.sys_id);
        metricGr.setLimit(1);
        metricGr.query();
        countQuestions = metricGr.getRowCount();
        if (countQuestions == 0)
            return false;
        var gr = new GlideRecord('asmt_metric_category');
        gr.addQuery('metric_type', metricType.sys_id);
        gr.addJoinQuery('asmt_m2m_category_user', 'sys_id', 'metric_category');
        gr.setLimit(1);
        gr.query();
        countUsers = gr.getRowCount();

        // Check if we have recipients list(s).
        var hasRecipientList = false;
        if (this.isTCPluginActive()) {
            var gr_rl = new GlideRecord('asmt_m2m_recipientslist_survey');
            gr_rl.addQuery("metric_type", metricType.sys_id);
            gr_rl.query();
            if (gr_rl.next()) {
                hasRecipientList = true;
            }
        }
        return countUsers > 0 || hasRecipientList;
    },

    isTCPluginActive: function() {
        return pm.isActive("com.sn_publications");
    },

    // Hide Invite User & Publish if no active questions
    hasSurveyQuestions: function(metricType) {
        var gr = new GlideRecord('asmt_metric');
        gr.addQuery('category.metric_type', metricType.sys_id);
        gr.setLimit(1);
        gr.addActiveQuery();
        gr.query();
        return gr.hasNext();
    },

    createAssessment: function(surveyInfo, method, state, surveyId, editMode) {

        editMode = (editMode == 'true');
        var metricTypeId = '';
        try {

            var surveyInfoObj = (new JSONParser()).parse(surveyInfo);
            var survey_name = surveyInfoObj.name;
            var description = surveyInfoObj.description;
            var metrics = surveyInfoObj.metrics;

            var metricType = new GlideRecord('asmt_metric_type');

            var preview = metricType.get(surveyId);

            if (editMode || preview) {
                metricTypeId = surveyId;

                metricType.name = survey_name;
                metricType.evaluation_method = method;
                metricType.publish_state = state;
                metricType.description = description;
                metricType.update();

                this.clearMetrics(metricTypeId);

            } else {
                metricType = new GlideRecord('asmt_metric_type');
                metricType.name = survey_name;
                metricType.evaluation_method = method;
                metricType.publish_state = state;
                metricType.description = description;

                //This is the pre-generated id.
                if (surveyId)
                    metricType.setNewGuidValue(surveyId);

                //There is a business rule here to
                //create a default category if it does not exists.
                if (metricType.canCreate())
                    metricTypeId = metricType.insert();
            }

            var ctd_name = new GlideRecord('asmt_metric_type');
            ctd_name.get(metricTypeId);
            var name = ctd_name.getValue('name');

            //In a business rull, insert category if it does not exist.
            var defaultCategory = new GlideRecord('asmt_metric_category');
            defaultCategory.addQuery('metric_type', metricTypeId);
            defaultCategory.addQuery('name', name);
            defaultCategory.query();

            if (defaultCategory.next()) {

                for (var i = 0; i < metrics.length; i++) {

                    var metricInfo = metrics[i];

                    var metric = new GlideRecord('asmt_metric');

                    var metric_sys_id = metricInfo.sys_id;
                    if (metric_sys_id && editMode) {
                        metric.addQuery('sys_id', metric_sys_id);
                        metric.query();
                        metric.next();
                    } else {
                        metric.initialize();
                        metric.category = defaultCategory.sys_id;
                    }

                    if (metricInfo.active === "false")
                        metric.active = false;
                    else
                        metric.active = true;

                    metric.name = metricInfo.question;
                    metric.question = metricInfo.question;
                    metric.datatype = metricInfo.type;

                    metric.order = i * this.DefaultMaxOrder / 2 + this.DefaultMaxOrder;
                    metric.scale = "high";
                    var explain = "";
                    var correct_answer = "";

                    var options = metricInfo.options;

                    switch (metricInfo.type) {
                        case 'scale':
                        case 'choice':
                            metric.min = 0;
                            metric.max = options.length - 1;
                            break;

                        case 'long':
                        case 'percentage':
                        case 'numericscale':
                            metric.min = options.min;
                            metric.max = options.max;
                            break;

                        case 'string':
                            metric.string_option = options.textSize;
                            break;

                        case 'template':
                            var minMax = this.getTemplateMinMax(options.templateType);
                            metric.template = options.templateType;
                            metric.min = minMax.min;
                            metric.max = minMax.max;
                            break;

                            // datatype 'attestation' is only used on UI.
                        case 'attestation':
                            metric.datatype = 'boolean';
                            metric.correct_answer = options.correct_answer;
                            metric.mandatory = 1;
                            correct_answer = options.correct_answer;
                            explain = options.explain;

                        case 'checkbox':
                            metric.min = 0;
                            metric.max = 1;
                            break;

                        default:
                            break;
                    }

                    //clear the scored flag when user change from attestation to others.
                    if (metricInfo.type === 'attestation')
                        metric.scored = 1;


                    //update scored and mandatory when question type changes
                    if (metric.datatype != 'attestation' && metric.scored == true && metricInfo.type != 'attestation' && editMode) {
                        var grr = new GlideRecord('asmt_metric');
                        grr.get(metric.sys_id);
                        if (grr.getValue('datatype') == 'boolean' && grr.getValue('scored') == true) {
                            metric.scored = false;
                            metric.mandatory = false;
                        }
                    }

                    //insert asmt_metric
                    var metricId = '';
                    if (metric_sys_id && editMode) {
                        metric.update();
                        metricId = metric_sys_id;
                    } else {
                        metric.metric_type = metricTypeId;
                        metricId = metric.insert();
                    }

                    // update or add answers for Choice and Likert
                    if (metricInfo.type == 'scale' || metricInfo.type == 'choice') {
                        for (var k = 0; k < options.length; k++) {
                            var metricDef1 = new GlideRecord('asmt_metric_definition');

                            var metricDef_sys_id = options[k].sys_id;
                            if (metricDef_sys_id && editMode) {
                                metricDef1.addQuery('sys_id', metricDef_sys_id);
                                metricDef1.query();
                                metricDef1.next();
                            } else {
                                metricDef1.initialize();
                            }

                            metricDef1.display = options[k].answer;
                            metricDef1.value = k;
                            metricDef1.order = k + this.DefaultMaxOrder;
                            metricDef1.metric = metricId;

                            if (metricDef_sys_id && editMode) {
                                metricDef1.update();
                            } else {
                                //insert asmt_metric_definition
                                metricDef1.insert();
                            }
                        }
                    }

                    // add a dependent question.
                    if (method === 'attestation') {
                        explain = explain.trim();
                        if (!this.hasDependent(metricId))
                            this.addDependentQuestion(metricId, correct_answer, explain);
                        else
                            this.updateDependentQuestion(metricId, correct_answer, explain);
                    }

                }

                this.deleteEmptyMetrics(metricTypeId);
                this.deleteEmptyMetricDefs();
                this.deleteObsoleteDependents();

                this.setOrder(metricTypeId);
                return metricTypeId;
            }

        } catch (e) {
            gs.log('AssessmentUtils:createSurvey: Exception: ' + e);
        }
    },

    setOrder: function(metricTypeId) {
        var gr = new GlideRecord('asmt_metric');
        gr.addQuery('metric_type', metricTypeId);
        gr.orderBy('order');
        gr.query();
        while (gr.next()) {
            var order = gr.getValue('order');
            this.sortDependents(gr.getValue('sys_id'), order);
        }
    },

    sortDependents: function(metricId, order) {
        var gr = new GlideRecord('asmt_metric');
        gr.addQuery('depends_on', metricId);
        gr.orderByDesc('auto_gen');
        gr.orderBy('order');
        gr.query();
        while (gr.next()) {
            gr.setValue('order', ++order);
            gr.update();
        }
    },

    hasDependent: function(metricId) {
        var metric = new GlideRecord('asmt_metric');
        metric.addQuery('depends_on', metricId);
        metric.addQuery('auto_gen', true);
        metric.query();
        return metric.hasNext();
    },

    // add a single dependent question to the underlying attestation question.
    addDependentQuestion: function(metricId, correct_answer, explain) {
        var gr = new GlideRecord('asmt_metric');
        gr.get(metricId);

        var q = new GlideRecord("asmt_metric");
        q.initialize();
        q.name = explain;
        q.question = explain;
        q.string_option = 'wide';
        q.datatype = 'string';
        q.auto_gen = 1;
        q.mandatory = 1;

        q.method = 'assessment';
        q.metric_type = gr.getValue('metric_type');
        q.category = gr.getValue('category');
        q.depends_on = metricId;

        if (correct_answer == "0")
            q.displayed_when_yesno = 1;
        else
            q.displayed_when_yesno = 0;

        q.weight = 10;
        q.max_weight = 20;
        q.order = this.DefaultMaxOrder;
        if (gr.active)
            q.active = 1;
        else
            q.active = 0;

        q.insert();

    },

    // update dependent question in case the correct answer has changed.
    updateDependentQuestion: function(metricId, correct_answer, explain) {
        var gr = new GlideRecord("asmt_metric");
        gr.get(metricId);

        var q = new GlideRecord("asmt_metric");
        q.addQuery('depends_on', metricId);
        q.addQuery('auto_gen', true);
        q.query();
        q.next();
        if (correct_answer == "0")
            q.displayed_when_yesno = 1;
        else
            q.displayed_when_yesno = 0;
        q.name = explain;
        q.question = explain;
        q.mandatory = 1;
        if (gr.active)
            q.active = 1;
        else
            q.active = 0;
        q.update();
    },

    deleteEmptyMetrics: function(metricTypeId) {
        var metric = new GlideRecord('asmt_metric');
        metric.addQuery('metric_type', metricTypeId);
        metric.addQuery('name', '');
        metric.query();
        while (metric.next()) {
            //delete related answers
            this.deleteMetricDefs(metric.getValue('sys_id'));
            //delete dependent questions
            this.deleteDependentMetrics(metric.getValue('sys_id'));
            metric.deleteRecord();
        }
    },

    deleteObsoleteDependents: function(metricTypeId) {
        var metric = new GlideRecord('asmt_metric');
        metric.addQuery('metric_type', metricTypeId);
        metric.addQuery('auto_gen', 1);
        metric.query();
        while (metric.next()) {
            var dependsOn = metric.getValue('depends_on');
            if (!this.attestationMetricExists(dependsOn))
                metric.deleteRecord();
        }
    },

    attestationMetricExists: function(sys_id) {
        var metric = new GlideRecord('asmt_metric');
        metric.addQuery('sys_id', sys_id);
        metric.addQuery('scored', 1);
        metric.query();
        return metric.hasNext();
    },

    deleteDependentMetrics: function(metricId) {
        var metric = new GlideRecord('asmt_metric');
        metric.addQuery('depends_on', metricId);
        metric.deleteMultiple();
    },

    deleteMetricDefs: function(metricId) {
        var metricDef = new GlideRecord('asmt_metric_definition');
        metricDef.addQuery('metric', metricId);
        metricDef.deleteMultiple();
    },

    deleteEmptyMetricDefs: function() {
        var metricDef = new GlideRecord('asmt_metric_definition');
        metricDef.addQuery('metric', '');
        metricDef.deleteMultiple();
    },

    clearMetrics: function(metricTypeId) {
        var metric = new GlideRecord('asmt_metric');
        metric.addQuery('metric_type', metricTypeId);
        //TODO: leave the dependent questions alone for now.
        metric.addNullQuery('depends_on');
        metric.query();
        while (metric.next()) {
            this.clearMetricDefs(metric.getValue('sys_id'));
            metric.setValue('name', '');
            metric.setValue('auto_gen', 0);
            metric.update();
        }
    },

    clearMetricDefs: function(metricId) {
        var metricDef = new GlideRecord('asmt_metric_definition');
        metricDef.addQuery('metric', metricId);
        metricDef.query();
        while (metricDef.next()) {
            metricDef.setValue('metric', '');
            metricDef.update();
        }
    },

    removeAssessment: function(metricTypeId) {
        try {
            var metricType = new GlideRecord('asmt_metric_type');
            metricType.get(metricTypeId);
            metricType.deleteRecord();
        } catch (e) {
            gs.log('AssessmentUtils:createSurvey: Exception: ' + e);
        }
        return;
    },

    // Do case insensitive condition check
    conditionCheck: function(current, condition) {
        var filter = new GlideFilter(condition, '');
        filter.setCaseSensitive(false);
        filter.setEnforceSecurity(true);

        // check to see if current matches condition
        return filter.match(current, true);
    },

    getTemplateMinMax: function(template) {

        var gr = new GlideAggregate("asmt_template_definition");
        gr.addQuery("template", template);
        gr.addAggregate("MIN", "value");
        gr.addAggregate("MAX", "value");
        gr.groupBy('template');
        gr.query();

        gr.next();
        var min = gr.getAggregate("MIN", "value");
        var max = gr.getAggregate("MAX", "value");

        var result = {
            min: min,
            max: max
        };
        return result;
    },

    addSourcesToAssessment: function(sourceId, asmtId) {
        new SNC.AssessmentCreation().addSourcesToAssessment(sourceId, asmtId);
    },

    deleteMetricResults: function(record, metricTypeId) {
        var metric = new GlideRecord('asmt_metric');
        metric.addQuery('metric_type', metricTypeId);
        metric.query();
        while (metric.next()) {
            var amr = new GlideRecord('asmt_metric_result');
            amr.addQuery('metric', metric.sys_id + '');
            amr.addQuery('source_id', record.sys_id);
            amr.addQuery('source_table', record.getTableName());
            amr.query();
            amr.deleteMultiple();
        }
    },

    deleteCategoryResults: function(record, metricTypeId) {
        var catResult = new GlideRecord('asmt_category_result');
        catResult.addQuery('metric_type', metricTypeId);
        catResult.addQuery('source_id', record.sys_id);
        catResult.addQuery('source_table', record.getTableName());
        catResult.query();
        catResult.deleteMultiple();
    },

    //Util method to check for an integer. On server side js, it does not look like there is a common util method to do this
    isInteger: function(text) {
        if (text == null)
            return true;
        var validChars = "0123456789,-";
        return this._containsOnlyChars(validChars, text);
    },

    isAsmtAIGenerated: function(asmtInstanceId) {
        var allowAIReasoning = false;
        var instanceGR = new GlideRecord('asmt_assessment_instance');
        instanceGR.addQuery('sys_id', asmtInstanceId);
        instanceGR.query();
        if (instanceGR.next() && instanceGR.isValidField('allow_ai_reasoning'))
            allowAIReasoning = instanceGR.allow_ai_reasoning;
        return allowAIReasoning;
    },

    canDeleteMetric: function(metricGR) {
        var metricResultGR = new GlideRecord('asmt_metric_result');
        var canDelete = true;
        if (metricGR != null) {
            if (metricGR.datatype == 'attachment') {
                metricResultGR.addQuery('metric', metricGR.getUniqueValue());
                metricResultGR.query();
                var metricResultSysID = [];
                while (metricResultGR.next()) {
                    metricResultSysID.push(metricResultGR.getUniqueValue());
                }
                var attachmentGR = new GlideRecord('sys_attachment');
                attachmentGR.addQuery('table_name', 'asmt_metric_result');
                attachmentGR.addQuery('table_sys_id', 'IN', metricResultSysID.join());
                attachmentGR.query();
                if (attachmentGR.hasNext())
                    canDelete = false;
            } else {
                var encodedQuery = 'metric.datatypeINdate,datetime,string^string_valueISNOTEMPTY^metric=';
                encodedQuery += metricGR.getUniqueValue();
                encodedQuery += '^NQmetric.datatype=reference^reference_value!=-1^metric=';
                encodedQuery += metricGR.getUniqueValue();
                encodedQuery += '^NQmetric.datatypeINchoice,imagescale,scale,multiplecheckbox,long,numericscale,percentage,ranking,template,boolean^actual_value!=-1^metric=';
                encodedQuery += metricGR.getUniqueValue();
                encodedQuery += '^NQmetric.datatype=checkbox^metric=';
                encodedQuery += metricGR.getUniqueValue();
                metricResultGR.addEncodedQuery(encodedQuery);
                metricResultGR.query();
                if (metricResultGR.hasNext())
                    canDelete = false;
            }
        }
        return canDelete;
    },

    _containsOnlyChars: function(validChars, sText) {
        var IsNumber = true;
        var c;
        for (var i = 0; i < sText.length && IsNumber == true; i++) {
            c = sText.charAt(i);
            if (validChars.indexOf(c) == -1) {
                IsNumber = false;
            }
        }
        return IsNumber;
    },

    getInstanceLinkHTML: function(instanceGr) {
        var link = this.getAssessmentInstanceURL(instanceGr.sys_id);
        return this._getLinkHTML(instanceGr.getValue("metric_type"), link);
    },

    getTypeLinkHTML: function(typeGr) {
        var link = this.getAssessmentTypeURL(typeGr.sys_id);
        return this._getLinkHTML(typeGr.sys_id, link);
    },

    _getLinkHTML: function(typeId, link) {
        var html;
        var typeGr = new GlideRecord("asmt_metric_type");
        if (!typeGr.get(typeId))
            return "";
        var sample_metric_id = typeGr.getValue("sample_metric");
        if (GlideStringUtil.isEligibleSysID(sample_metric_id))
            html = '<img src="sys_attachment.do?sys_id=' + this._getSampleMetricImageId(sample_metric_id) + '"></img>';
        else
            html = gs.getMessage("Take me to the Survey");
        return '<a href="' + link + '">' + html + '</a>';
    },

    _getSampleMetricImageId: function(metricId) {
        var gr = new GlideRecord("sys_attachment");
        gr.addQuery("file_name", "sample_metric_image_" + metricId + ".png");
        gr.addQuery("table_name", "ZZ_YYasmt_metric_type");
        gr.orderByDesc("sys_updated_on");
        gr.setLimit(1);
        gr.query();
        if (!gr.next())
            return "";
        return gr.getUniqueValue();
    },

    processBankAction: function(action, from_list, to_record, include_dependent_questions) {
        var gr;
        if (action.indexOf("metric") >= 0) {
            this.addMetricsToCategory(from_list, to_record, include_dependent_questions);
            gr = new GlideRecord("asmt_metric_category");
        } else if (action.indexOf("category") >= 0) {
            if (AssessmentUtils.isChatSurvey(to_record) && this.hasExistingCategories(to_record)) {
                action = "invalid_category_add_chat_survey";
            } else {
                this.addCategoriesToType(from_list, to_record);
                gr = new GlideRecord("asmt_metric_type");
            }
        }
        gr.get(to_record);

        var resultObj = {
            msg: null,
            success: true
        };

        if (action == 'invalid_category_add_chat_survey') {
            resultObj.msg = gs.getMessage('For Chat Survey, all questions must belong to a single category');
            resultObj.success = false;
        }

        if (action == 'add_metric_from_bank')
            resultObj.msg = gs.getMessage('Added selected Metrics into current Category record');
        else if (action == 'add_category_from_bank')
            resultObj.msg = gs.getMessage('Added selected Categories into current Type record');
        else if (action == 'from_bank_add_metric')
            resultObj.msg = gs.getMessage('Added current Metric to {0} Category', GlideStringUtil.escapeHTML(gr.getDisplayValue("name")));
        else if (action == 'from_bank_add_category')
            resultObj.msg = gs.getMessage('Added current Category to {0} Type record', GlideStringUtil.escapeHTML(gr.getDisplayValue("name")));
        else if (action == 'add_metric_to_bank')
            resultObj.msg = gs.getMessage('Added current Metric to {0} Question Bank', GlideStringUtil.escapeHTML(gr.getDisplayValue("name")));
        else if (action == 'add_category_to_bank')
            resultObj.msg = gs.getMessage('Added current Category into Question Bank');

        return resultObj;
    },

    // check if has existing categories
    hasExistingCategories: function(metricTypeSysID) {
        var survey = new GlideRecord("asmt_metric_type");
        if (survey.get(metricTypeSysID)) {
            var category = new GlideRecord("asmt_metric_category");
            category.addQuery("metric_type", metricTypeSysID);
            category.setLimit(1);
            category.query();
            return category.hasNext();
        }
        return false;
    },

    // The argument can be GlideRecord or GlideElement
    isValidBankCategory: function(category) {
        return !!(category.qb_evaluation_method + "");
    },

    // The argument can be GlideRecord or GlideElement
    isValidBankMetric: function(metric) {
        var categoryGr = new GlideRecord("asmt_metric_category");
        if (!categoryGr.get(metric.category + ""))
            return false;
        return this.isValidBankCategory(categoryGr);
    },

    //This method is used for checking if there are any dependent questions for a given question
    hasDependentMetrics: function(metricsList) {
        var metric = new GlideRecord('asmt_metric');
        metric.addQuery('depends_on', 'IN', metricsList);
        metric.query();
        return metric.hasNext();
    },

    //This method is used for adding categories to metric type, basically creating new catgeories from given categories.
    addCategoriesToType: function(categoriesToAdd, typeID) {
        var gr_category = new GlideRecord("asmt_metric_category");
        var maxOrder = this.getMaxOrder("asmt_metric_category", "metric_type", typeID);
        for (var i = 0; i < categoriesToAdd.length; i++) {
            if (!gr_category.get(categoriesToAdd[i]))
                return;

            //Incrementing maxOrder everytime a new question is added.
            maxOrder += this.DefaultMaxOrder;
            gr_category.name = gr_category.getDisplayValue('name');
            if (typeID) {
                gr_category.qb_evaluation_method = '';
                gr_category.metric_type = typeID;
                gr_category.order = maxOrder;
            } else {
                gr_category.qb_evaluation_method = gr_category.getElement("metric_type.evaluation_method").toString();
                gr_category.metric_type = '';
            }
            gr_category.table = '';
            gr_category.filter = '';
            var newCatID = gr_category.insert();
            //copy the metrics under this category
            new CloneSurvey().cloneMetric('', '', categoriesToAdd[i], newCatID);
        }
    },

    //This method is used for getting a list of questions and adding them to a given category. If there are any dependencies, they will be copied over as well.
    addMetricsToCategory: function(metricsToAdd, categoryID, addDependencyFlag) {
        new SNC.NGAssessmentUtil.setAssessmentAction("clone");
        var hasDependent = false;
        var dependencyMap = {};
        var metricDefinitionMap = {};
        var maxOrder = this.getMaxOrder("asmt_metric", "category", categoryID);
        var gr = new GlideRecord('asmt_metric');
        gr.addQuery('depends_on', 'IN', metricsToAdd);
        gr.query();
        if (gr.hasNext())
            hasDependent = true;
        for (var i = 0; i < metricsToAdd.length; i++) {
            maxOrder += this.DefaultMaxOrder;
            gr.get(metricsToAdd[i]);
            gr.category = categoryID;
            gr.order = maxOrder;

            //Case 1: no dependent questions for any of the questions to be added to the bank
            if (!hasDependent || !addDependencyFlag) {
                gr = this.removeDependencies(gr);
                var newMetricSysID = gr.insert();
                if (gr.getValue('datatype') === 'imagescale')
                    metricDefinitionMap = new CloneSurvey().cloneMetricDefinition(metricsToAdd[i], newMetricSysID, true, metricDefinitionMap);
                else
                    metricDefinitionMap = new CloneSurvey().cloneMetricDefinition(metricsToAdd[i], newMetricSysID, false, metricDefinitionMap);
            } else {
                var newMetricId = gr.insert();
                dependencyMap[metricsToAdd[i]] = {
                    'newMetricId': newMetricId,
                    'depends_on': gr.depends_on + '',
                    'displayed_when': gr.displayed_when + '',
                    'correct_answer_choice': gr.correct_answer_choice + ''
                };
                if (gr.getValue("datatype") === "imagescale")
                    metricDefinitionMap = new CloneSurvey().cloneMetricDefinition(metricsToAdd[i], newMetricId, true, metricDefinitionMap);
                else
                    metricDefinitionMap = new CloneSurvey().cloneMetricDefinition(metricsToAdd[i], newMetricId, false, metricDefinitionMap);
                dependencyMap = this.checkDependency(metricsToAdd[i], dependencyMap, categoryID, metricsToAdd, metricDefinitionMap, {
                    'maxOrder': maxOrder
                });
            }
        }
        new CloneSurvey().updateDependencies(dependencyMap, metricDefinitionMap);
    },

    /*This is a recursive call for checking any dependencies of a given question and copying it to the new category
    currMetricID - the given metric to look for dependencies
    categoryID - the category in which to add the metrics to
    metricsToAdd - the list of metrics to add to Question bank
    metricDefinitionMap - this is used to update the metric definitions after copying
    */
    checkDependency: function(currMetricID, dependencyMap, categoryID, metricsToAdd, metricDefinitionMap, maxOrderObj) {
        //Get the current metric category and check if there are any dependent questions for this
        var currMetricGR = new GlideRecord('asmt_metric');
        currMetricGR.get(currMetricID);
        var gr = new GlideRecord('asmt_metric');
        gr.addQuery('category', currMetricGR.category);
        gr.addQuery('depends_on', currMetricID);
        gr.query();
        while (gr.next()) {
            //Since the order is always added to the end, get the maxOrder and add default order to it.
            maxOrderObj.maxOrder += this.DefaultMaxOrder;
            var oldMetricID = gr.getUniqueValue();
            if (metricsToAdd.indexOf(oldMetricID) >= 0)
                continue;
            gr.category = categoryID;
            if (maxOrderObj)
                gr.order = maxOrderObj.maxOrder;
            var newMetricId = gr.insert();
            // store dependency and correct answer info in metricMap
            dependencyMap[oldMetricID] = {
                'newMetricId': newMetricId,
                'depends_on': gr.depends_on + '',
                'displayed_when': gr.displayed_when + '',
                'correct_answer_choice': gr.correct_answer_choice + ''
            };
            if (gr.getValue("datatype") === "imagescale")
                metricDefinitionMap = new CloneSurvey().cloneMetricDefinition(oldMetricID, newMetricId, true, metricDefinitionMap);
            else
                metricDefinitionMap = new CloneSurvey().cloneMetricDefinition(oldMetricID, newMetricId, false, metricDefinitionMap);
            //Now repeat the same process, with the dependent question that was just found
            //oldMetricID - dependent of the current metric.
            dependencyMap = this.checkDependency(oldMetricID, dependencyMap, categoryID, metricsToAdd, metricDefinitionMap, maxOrderObj);
        }
        return dependencyMap;
    },

    //In the case where the dependent questions should not be copied over, remove the dependencies
    removeDependencies: function(gr) {
        gr.depends_on = '';
        gr.correct_answer = '';
        gr.displayed_when = '';
        gr.correct_answer_checkbox = '';
        gr.displayed_when_checkbox = '';
        gr.correct_answer_choice = '';
        gr.correct_answer_template = '';
        gr.displayed_when_template = '';
        gr.correct_answer_yesno = '';
        gr.displayed_when_yesno = '';
        return gr;
    },

    /*
     * Method to get the maxOrder of the current categories in metric type or current metrics in a category
     */
    getMaxOrder: function(tableName, fieldName, recordID) {
        var maxOrder = 0;
        //In certain cases, the recordID might be absent
        if (recordID) {
            var gr = new GlideRecord(tableName);
            gr.addQuery(fieldName, recordID);
            gr.orderByDesc("order");
            gr.setLimit(1);
            gr.query();
            if (gr.next())
                maxOrder = parseInt(gr.order);
        }
        return maxOrder;
    },

    /**
     * Get question label for a question instance. Replace the placeholder with the actual value from source record if there is any.
     */
    getQuestionLabel: function(instanceQuestionGr) {
        var PLACEHOLDER = "${param}";
        var PLACEHOLDER_REGEXP = /\$\{param\}/g;
        var metricGr = instanceQuestionGr.metric.getRefRecord();
        var metricQuestionLabel = metricGr.getDisplayValue("question");
        if (metricQuestionLabel.indexOf(PLACEHOLDER) == -1)
            return metricQuestionLabel;
        var sourceField = metricGr.getValue("source_field");
        var sourceTable = metricGr.metric_type.source_table + '';
        var triggerId = instanceQuestionGr.instance.trigger_id;
        if (!sourceField || !sourceTable || !triggerId)
            return metricQuestionLabel;
        var sourceRecord = new GlideRecord(sourceTable);
        if (!sourceRecord.get(triggerId) || !sourceRecord.canRead() || !sourceRecord.getElement(sourceField).canRead())
            return metricQuestionLabel;
        return metricQuestionLabel.replace(PLACEHOLDER_REGEXP, sourceRecord.getDisplayValue(sourceField));
    },

    isKioskSurvey: function(asmtId) {
        // check service portal survey plugin active
        if (!pm.isActive("com.glide.service-portal") || !pm.isActive("com.glide.service-portal.survey"))
            return false;

        // check metric type info
        var asmt = new GlideRecord('asmt_metric_type');
        if (!asmt.get(asmtId) || asmt.evaluation_method != 'survey' || !asmt.one_click_survey || !asmt.signature.nil())
            return false;

        // check metric count and info
        var metricCount = 0;
        var allowedDataType = 'imagescale, scale, boolean, numericscale, choice';
        var metric = new GlideRecord('asmt_metric');
        metric.addQuery('active', true);
        metric.addQuery('metric_type', asmtId);
        metric.query();
        while (metric.next()) {
            metricCount++;
            if (metricCount > 1 || metric.allow_add_info || allowedDataType.indexOf(metric.datatype + '') < 0)
                return false;
        }
        return true;
    },

    wipeMetricSourceFields: function(asmtId) {
        if (!asmtId)
            return false;
        var metric = new GlideRecord('asmt_metric');
        metric.addQuery('metric_type', asmtId);
        metric.addNotNullQuery('source_field');
        metric.setValue('source_field', 'NULL');
        metric.updateMultiple();
    },

    setAssessmentStats: function(currentRecord, recentSent, recentCompleted) {
        if (recentSent)
            this.setRecentSentStat(currentRecord);
        else if (recentCompleted)
            this.setRecentCompletedStat(currentRecord);
    },

    setRecentCompletedStat: function(asmtInstanceGR) {
        var user = asmtInstanceGR.user;
        var metricType = asmtInstanceGR.metric_type;
        var asmtInstance = asmtInstanceGR.sys_id;
        var recentFieldToSet = "recent_completed";

        if (!user || !metricType || !asmtInstance)
            return;

        if (this._shouldCollectStats(metricType)) {

            //Get All User Sources & SourceTbl for receiving the assessment
            var sourceSummary = this._getSourceForUser(asmtInstance, metricType);

            //Iterate through the Source and register the Recent Sent/Completed				
            for (var i = 0; i < sourceSummary.length; i++) {
                var srcDetails = sourceSummary[i];
                var src = srcDetails.source_id;
                var srcTbl = srcDetails.source_table;

                this._setAssmtStatsRecord(metricType, user, src, srcTbl, asmtInstance, recentFieldToSet);
            }
        }
    },

    setRecentSentStat: function(asmtInstQstnGR) {
        var user = asmtInstQstnGR.instance.user;
        var src = asmtInstQstnGR.source_id;
        var srcTbl = asmtInstQstnGR.source_table;
        var metricType = asmtInstQstnGR.metric.metric_type;
        var asmtInstance = asmtInstQstnGR.instance;
        var recentFieldToSet = "recent_sent";

        if (!user || !metricType || !asmtInstance || !src || !srcTbl)
            return;

        if (this._shouldCollectStats(metricType))
            this._setAssmtStatsRecord(metricType, user, src, srcTbl, asmtInstance, recentFieldToSet);
    },


    _setAssmtStatsRecord: function(metricType, user, src, srcTbl, asmtInstance, recentFieldToSet) {

        var asmtStatsGR = new GlideRecord("asmt_assessment_stat");
        asmtStatsGR.addQuery("metric_type", metricType);
        asmtStatsGR.addQuery("user", user);
        asmtStatsGR.addQuery("source_id", src);
        asmtStatsGR.addQuery("source_table", srcTbl);
        asmtStatsGR.query();

        if (asmtStatsGR.next()) {
            asmtStatsGR.setValue(recentFieldToSet, asmtInstance);
            asmtStatsGR.update();
        } else {
            asmtStatsGR.initialize();
            asmtStatsGR.setValue('user', user);
            asmtStatsGR.setValue('source_id', src);
            asmtStatsGR.setValue('source_table', srcTbl);
            asmtStatsGR.setValue('metric_type', metricType);
            asmtStatsGR.setValue(recentFieldToSet, asmtInstance);
            asmtStatsGR.insert();
        }
    },

    _shouldCollectStats: function(asmtType) {
        var eligAsmtStr = GlideProperties.get('com.snc.assessment.collect.stats', '').trim();
        return (eligAsmtStr.contains(asmtType));
    },

    _getSourceForUser: function(asmtInstance, assmtMetricType) {

        var srcs = [];

        var gr = new GlideAggregate("asmt_assessment_instance_question");
        gr.addQuery("instance", asmtInstance);
        gr.addQuery("metric.metric_type", assmtMetricType);
        gr.groupBy("source_id");
        gr.groupBy("source_table");
        gr.query();

        while (gr.next()) {
            var srcDetails = {};
            srcDetails.source_id = gr.getValue("source_id");
            srcDetails.source_table = gr.getValue("source_table");
            srcs.push(srcDetails);
        }

        return srcs;
    },

    updateTriggerConditionBR: function(triggerCondition) {
        var override = '';

        if (!triggerCondition.business_rule.nil()) {
            var pMgr = new GlidePluginManager();
            var isDomainSeparationActive = pMgr.isActive('com.glide.domain.msp_extensions.installer');
            if (isDomainSeparationActive) {
                var userDomain = gs.getUser().getDomainID();
                userDomain = userDomain || 'global'; // if user domain is null, use global
                if (userDomain != triggerCondition.business_rule.sys_domain) {
                    override = triggerCondition.business_rule + '';
                    triggerCondition.business_rule = '';
                }
            }
        }
        var escapeCondition = triggerCondition.condition.toString();
        escapeCondition = escapeCondition.replace(/[\'\"]/g, "\\'");
        var brCondition = "(new global.AssessmentUtils().conditionCheck(current, '" + escapeCondition + "'))";
        var br;

        if (!triggerCondition.business_rule.nil())
            br = triggerCondition.business_rule.getRefRecord();

        else {
            br = new GlideRecord('sys_script');
            br.initialize();
        }
        br.name = 'Auto assessment business rule';
        br.action_insert = true;
        br.action_update = true;
        br.active = true;
        br.when = 'after';
        br.execute_function = true;
        br.order = 300;
        br.collection = triggerCondition.table;
        if (brCondition.length <= 254) {
            br.condition = brCondition;
            br.script = "function onAfter(){ \n (new sn_assessment_core.AssessmentCreation()).conditionTrigger(current, '" + triggerCondition.sys_id + "'); \n }";
        } else {
            br.condition = "";
            br.when = "after";
            br.script = "function onAfter(){ \n if (" + brCondition + ") \n (new sn_assessment_core.AssessmentCreation()).conditionTrigger(current, '" + triggerCondition.sys_id + "'); \n }";
        }
        if (override)
            br.sys_overrides = override;
        if (triggerCondition.business_rule.nil()) {
            var brId = br.insert();
            triggerCondition.business_rule = brId;
            triggerCondition.setWorkflow(false);
            triggerCondition.update();
            triggerCondition.setWorkflow(true);
        } else
            br.update();
    },

    updateUserFieldBR: function(metricType) {
        var userField = metricType.getValue('user_field');
		var override = null;
  
		if (metricType.user_field_business_rule) {
			var pMgr = new GlidePluginManager();
			var isDomainSeparationActive = pMgr.isActive('com.glide.domain.msp_extensions.installer');
			if (isDomainSeparationActive) {
				var userDomain = gs.getUser().getDomainID();
				userDomain = userDomain || 'global'; // if user domain is null, use global
				if (userDomain != metricType.user_field_business_rule.sys_domain) {
					override = metricType.getValue('user_field_business_rule');
					metricType.user_field_business_rule = null;
				}
			}
		}

        var br = new GlideRecord('sys_script');
        if (metricType.user_field_business_rule)
            br.get(metricType.getValue('user_field_business_rule'));
        else
            br.initialize();

        if (!metricType.getValue('user_field') && metricType.user_field_business_rule) {
            metricType.user_field_business_rule = null;
            br.deleteRecord();
        } else {
            br.name = 'Update category users';
            br.action_update = true;
            br.active = true;
            br.when = 'after';
            br.execute_function = true;
            br.order = 300;
            br.collection = metricType.getValue('table');
            br.advanced = true;

            var fieldCondition = userField + 'VALCHANGES^EQ';
            var previousRecUserField = "previous.getValue('" + userField + "')";
            var currentRecUserField = "current.getValue('" + userField + "')";

            br.condition = "(new global.AssessmentUtils().conditionCheck(current, '" + fieldCondition + "'))";
            br.script = "function onAfter() { \n" +
                "\t" + "var asmtUtil = new global.AssessmentUtils(); \n" +
                "\t" + "asmtUtil = asmtUtil.updateAssessableRecordCategoryUser(current.getUniqueValue(), '" + metricType.getUniqueValue() + "', " + previousRecUserField + ", " + currentRecUserField + "); \n" +
                "}";
			
			if (override)
				br.sys_overrides = override;
            if (!metricType.user_field_business_rule) {
                var brSysId = br.insert();
                metricType.user_field_business_rule = brSysId;
                metricType.setWorkflow(false);
                metricType.update();
                metricType.setWorkflow(true);
            } else
                br.update();
        }
    },

    updateCategoryUsers: function(currMetricType, prevMetricType) {
        // In this case, we didn't update assessable records and we only updated assessors' user field, which means the relationships between metric category and assessable records are not changed; Only stackholders and category users need to be updated.

        // Get the old map of assessable records and users based on old value of user field
        var oldAssbleRecordAndUser = this.getMapOfAssessableRecordsAndUsers(prevMetricType);

        // Get the map of assessable records and users
        // e.g., key: assessable record sys id; value: user sys id
        var assbleRecordAndUser = this.getMapOfAssessableRecordsAndUsers(currMetricType);

        // Return if there is no assessable records in this assessment
        if (Object.keys(assbleRecordAndUser).length == 0)
            return;

        // Automatically generate category users for each metric category
        var metricCategory = this.getMetricCategoryByType(currMetricType.sys_id);
        while (metricCategory.next()) {
            // Find out assessable records from "asmt_m2m_category_assessment" table based on category id.
            var catAsmt = this.getM2mCategoryAssessmentByCategory(metricCategory.sys_id);
            while (catAsmt.next()) {
                // Add user to metric categories
                var oldUser = oldAssbleRecordAndUser[catAsmt.assessment_record];
                var newUser = assbleRecordAndUser[catAsmt.assessment_record];

                if (!oldUser && !newUser)
                    continue;

                this.updateCategoryUser(metricCategory.getUniqueValue(), catAsmt.getValue('assessment_record'), oldUser, newUser);
            }
        }
    },

    updateCategoryUser: function(metricCategorySysId, assessableRecordSysId, oldUser, newUser) {
    	// Get old category user that has been used in current assessable record and check if its used in other assessable records.
    	// If no, remove this category user; Then, create a new category user and stakeholder for current metric category and current assessable record.
    	if (oldUser) {
    		var catUsers = new GlideRecord("asmt_m2m_category_user");
    		catUsers.addQuery("metric_category", metricCategorySysId);
    		catUsers.addQuery("user", "IN", oldUser);
    		catUsers.query();
    		while (catUsers.next()) {
    			if (!this.ifThisCategoryUserUsedInOtherAssessableRecord(metricCategorySysId, catUsers.sys_id, assessableRecordSysId)) {
    				// Remove this category user since no assessable records use it
    				catUsers.deleteRecord();
   				} else {
   					// Since other assessable records are using this category user, we just need to remove the stakeholder from it.
   					this.deleteStakeholder(assessableRecordSysId, catUsers.sys_id);
         		}
         	}
         }
         var catUserSysIds = [];
         if (newUser) {
         	var newUserArr = newUser.split(",");
         	for (var i=0 ; i< newUserArr.length; i++) {
         		if (GlideStringUtil.isEligibleSysID(newUserArr[i])) {
         			var newCatUser = this.createCategoryUser(metricCategorySysId, newUserArr[i]);
         			catUserSysIds.push(newCatUser.sys_id + "");
         		}
         	}
        }
       	// Automatically assign/create stakeholder for assessable record
       	// Find stakeholder based on assessable record id and category user id from "asmt_m2m_stakeholder" table.
       	for (var i = 0 ; i< catUserSysIds.length; i++) {
       		this.createStakeholders(catUserSysIds[i], assessableRecordSysId);
       	}
    },

    updateAssessableRecordCategoryUser: function(asmtTableRecSysId, metricTypeRecSysId, oldUser, newUser) {
        var ar = new GlideRecord("asmt_assessable_record");
        ar.addQuery("metric_type", metricTypeRecSysId);
        ar.addQuery("source_id", asmtTableRecSysId);
        ar.query();
        if (ar.next()) {
            var catAsmt = new GlideRecord("asmt_m2m_category_assessment");
            catAsmt.addQuery("assessment_record", ar.getUniqueValue());
            catAsmt.query();
            while (catAsmt.next()) {
                this.updateCategoryUser(catAsmt.getValue("category"), ar.getUniqueValue(), oldUser, newUser);
            }
        }
    },
	
	filterSurvey: function(gr) {
        var extensionPoints = new GlideScriptedExtensionPoint().getExtensions('global.FilterSurveys');
		for (var i = 0; i < extensionPoints.length; ++i) {
				var point = extensionPoints[i];
				if (point.filter(gr)) {
					return true;
				}
		}
		return false;
    },

    getMySurveys: function() {
        var gr = new GlideRecord("asmt_assessment_instance");
        gr.addQuery("metric_type.active", true);
        gr.addQuery("due_date", '>=', new GlideDateTime().getLocalDate().getValue());
        gr.addQuery("metric_type.publish_state", "published");
        gr.addQuery("preview", false);
        gr.addQuery("user", gs.getUserID());
        var sub = gr.addQuery("state", "ready");
        sub.addOrCondition("state", "wip");
        var sub1 = sub.addOrCondition("state", "complete");
        sub1.addCondition("metric_type.allow_retake", "true");
        gr.orderByDesc('state');
        gr.orderBy('due_date');
        gr.orderBy('sys_created_on');
        gr.query();
        return gr;
    },

	getMyFilteredSurveys: function() {
		var gr = this.getMySurveys();
		var surveys = [];
		while (gr.next()) {
			if (!this.filterSurvey(gr))
				surveys.push(gr.getUniqueValue());
		}
		return surveys;
	},
	
	invokeExtensionPoints : function(instance) {
		var className = instance.metric_type.sys_class_name + '';
		if(instance.state + '' === 'complete' && className === 'change_risk_asmt')
			this._invokeExtensionPoints(instance, 'global.RunPostAssessment');
	},

	_invokeExtensionPoints: function(instance, extension) {
		var extensionPoints = new GlideScriptedExtensionPoint().getExtensions(extension);
			for (var i = 0; i < extensionPoints.length; ++i)
					extensionPoints[i].run(instance);
	},

	updateSurveyMasterItem: function() {
		var gr = new GlideRecord('sys_sg_master_item');
		gr.setWorkflow(false);
		gr.get('c79af305ebc23010e0ef83c45e52280d');
		gr.use_view_config = false;
		gr.item_view = '8c4abfc1ebc23010e0ef83c45e5228b7'; // set legacy item view 
		gr.update();
	},

	processCollisionCheck: function() {
		var gcd = GlideCollisionDetector.get();
		if (gs.nil(gcd)) {
			gs.info("Survey Mobile: Error in initiating GlideCollisionDetector.");
			return;
		}
		var gr = new GlideRecord("sys_sg_master_item");
		if (gr.get("c79af305ebc23010e0ef83c45e52280d") && !gcd.containsKey(gr.sys_update_name + "")) {
			var itemView = new GlideRecord("sys_sg_item_view");
			if (itemView.get("8c4abfc1ebc23010e0ef83c45e5228b7") && gcd.containsKey(itemView.sys_update_name + "")) {
				this.updateSurveyMasterItem();
				return;
			}
			var uiStyleIds = "272580d9ebc23010e0ef83c45e5228b4,bb8cc8ddebc23010e0ef83c45e5228d3,7581fc5753623010c59dddeeff7b125c,49c10c1f53223010c59dddeeff7b12b4,043b4c9debc23010e0ef83c45e52282d,638fbfcb53223010c59dddeeff7b12c5,58d508d9ebc23010e0ef83c45e522820,14bcc8ddebc23010e0ef83c45e5228dc";
			var styleGR = new GlideRecord("sys_sg_ui_style");
			styleGR.addQuery('sys_id', 'IN', uiStyleIds);
			styleGR.query();
			while(styleGR.next()) {
				if (gcd.containsKey(styleGR.sys_update_name + "")) {
					this.updateSurveyMasterItem();
					break;
				}
			}
		}
	},
	setAnonymizeResponse:  function(qID) {
		var qstRecord = new GlideRecord("asmt_assessment_instance_question");
		if (qstRecord.get(qID) && qstRecord.instance.metric_type.anonymize) {
			qstRecord.setWorkflow(false);
			qstRecord.autoSysFields(false);
			qstRecord.setValue("sys_updated_by", "guest");
			qstRecord.setValue("sys_created_by", "guest");
			qstRecord.update();
		}
	},
	notifyUser: function(assessmentInstance) {
        if (gs.getProperty('com.snc.assessment.notify_assessment_workflow_customized') == 'false') {
            var wfVersion = new GlideRecord('wf_workflow_version');
            var q1 = wfVersion.addQuery('sys_id', 'b3c178f1df22210068c37a0d3df26391');
            var q2 = wfVersion.addQuery('published', false);
	    q2.addOrCondition('active', false);
            wfVersion.query();

            if (wfVersion.next())
                gs.setProperty('com.snc.assessment.notify_assessment_workflow_customized', true);
        }
		//Workflow code for backward compatability
        var workflow = new Workflow();
        var wfId = workflow.getWorkflowFromName('Notify assessment user');
        workflow.cancel(assessmentInstance);

        if (gs.getProperty('com.snc.assessment.notify_assessment_workflow_customized') == 'true') 
            workflow.startFlow(wfId, assessmentInstance, assessmentInstance.operation(), null);
        else {
            try {
                if (assessmentInstance.notification_flow_context_id && !assessmentInstance.notification_flow_context_id.nil())
                    new sn_fd.FlowAPI.cancel(assessmentInstance.notification_flow_context_id, "Subflow is canceled because of either State change or user change in assessment instance");

                var inputs = {};
                inputs['assessment_instance'] = assessmentInstance;

                var result = sn_fd.FlowAPI.getRunner().subflow('global.notify_assessment_user').inBackground().withInputs(inputs).run();

                assessmentInstance.setValue('notification_flow_context_id', result.getContextId());
                assessmentInstance.update();
            } catch (ex) {
                var message = ex.getMessage();
                gs.error(message);
            }
        }
    },

    type: 'AssessmentUtils'
};

AssessmentUtils.isChatSurvey = function(surveySysID) {
    var survey = new GlideRecord("asmt_metric_type");
    if (survey.get(surveySysID))
        return (survey.getValue("chat_survey") === "1" && survey.getValue("evaluation_method") === "survey");
    return false;
};
