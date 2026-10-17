var GuidedSetupDynamicRulesUtil = Class.create();
GuidedSetupDynamicRulesUtil.prototype = {
    LOG_TYPE: {
        DEACTIVATED: 5,
        REACTIVATED: 6
    },

    STATUS_TYPE: {
        INACTIVE: 3
    },

    GSW_STATUS_OF_CONTENT_TABLE: 'gsw_status_of_content',
    GSW_CHANGE_LOG_TABLE: 'gsw_change_log',
    CONTENT: 'content',
    STATUS: 'status',
    TYPE: 'type',

    initialize: function() {
        this.rootContentId = '';
    },

    getContentIdMap: function(rootContentId) {
        try {
            this.rootContentId = rootContentId;
            var rules = {};
            var responseMap = {};
            var contentIdMap = null;
            var hasResponses = false;
            var configGr = new GlideRecord("guided_setup_configuration");
            configGr.addQuery("parent_guided_setup", rootContentId);
            configGr.query();

            if (!configGr.next())
                return contentIdMap;

            var configId = configGr.getUniqueValue();
            var isLeastAccessibleContentMethod = configGr.getValue("matching_criteria") == "atleast_one";
            /*
            	Atleast One Rule --> Shows content if at least one rule shows the content
            		Step 1. Intersection of all exclude Rules 
            		Step 2. Union of all include Rules
            		Step 3. output = { excludes = Step1 Result - Step 2 Result }

            	All Rules --> Shows content only if all the rules shows the content
            		Step 1. Union of all exclude Rules
            		Step 2. Union of all include Rules
            		Step 3. output = { excludes = Step1 Result, includes = Step2 Result }
            */

            //Load the rules and it's excluded content lists in a map for later use to filter out based on the response values...

            var configRuleGr = new GlideRecord("guided_setup_configuration_rule");
            configRuleGr.addQuery("parent_setup_config", configId);
            configRuleGr.query();
            while (configRuleGr.next()) {
                rules[configRuleGr.getUniqueValue()] = rules[configRuleGr.getUniqueValue()] || {};
                rules[configRuleGr.getUniqueValue()]["contentList"] = configRuleGr.getValue("content_list");
                rules[configRuleGr.getUniqueValue()]["contentListType"] = configRuleGr.getValue("content_list_type");
            }

            var configRuleCategoryGr = new GlideRecord("guided_setup_rule_on_category");
            configRuleCategoryGr.addQuery("parent_rule.parent_setup_config", configId);
            configRuleCategoryGr.query();
            while (configRuleCategoryGr.next()) {
                rules[configRuleCategoryGr.getValue("parent_rule")] = rules[configRuleCategoryGr.getValue("parent_rule")] || {};
                rules[configRuleCategoryGr.getValue("parent_rule")][configRuleCategoryGr.category.category_value] = rules[configRuleCategoryGr.getValue("parent_rule")][configRuleCategoryGr.category.category_value] || [];
                rules[configRuleCategoryGr.getValue("parent_rule")][configRuleCategoryGr.category.category_value].push({
                    "operator": configRuleCategoryGr.getValue("operator"),
                    "value": configRuleCategoryGr.getValue("value")
                });
            }

            if (!rules || Object.keys(rules).length == 0)
                return contentIdMap;

            var responseMapGr = new GlideRecord("guided_setup_configuration_response");

            responseMapGr.addQuery("parent_setup_config", configId);
            responseMapGr.addQuery("active", true);
            responseMapGr.query();

            //If active responses are available then respect them by getting all the excluded contents.
            if (responseMapGr.hasNext()) {
                hasResponses = true;
                contentIdMap = {
                    "exclude": [],
                    "include": []
                };

                while (responseMapGr.next()) {
                    responseMap[responseMapGr.getValue("category")] = responseMap[responseMapGr.getValue("category")] || [];
                    responseMap[responseMapGr.getValue("category")].push(responseMapGr.getValue("value"));
                }

                var intersectionOfExcludedContent = [];
                var unionOfIncludedContent = [];
                var isFirstSeenExcludeRule = true;

                for (var ruleId in rules) {
                    var definedRules = rules[ruleId];
                    var isRuleMatching = true;
                    for (var ruleCategory in definedRules) {
                        if (ruleCategory != "contentList") {
                            if (definedRules[ruleCategory] && definedRules[ruleCategory].length > 0) {
                                for (var definedRulesIndx in definedRules[ruleCategory]) {
                                    var definedRule = definedRules[ruleCategory][definedRulesIndx];
                                    if (definedRule.operator == "contains") {
                                        if (!responseMap || !responseMap[ruleCategory] || responseMap[ruleCategory].indexOf(definedRule.value) == -1) {
                                            isRuleMatching = false;
                                            break;
                                        }
                                    } else if (definedRule.operator == "not_contains") {
                                        if (!responseMap || !responseMap[ruleCategory] || responseMap[ruleCategory].indexOf(definedRule.value) > -1) {
                                            isRuleMatching = false;
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if (isRuleMatching) {
                        if (definedRules.contentList) {
                            var contentIds = definedRules.contentList.split(",");
                            if (contentIds && contentIds.length > 0) {
                                var contentIdIndx;
                                if (isLeastAccessibleContentMethod) {
                                    if (definedRules.contentListType == "include") {
                                        for (contentIdIndx in contentIds) {
                                            unionOfIncludedContent.push(contentIds[contentIdIndx]);
                                        }
                                    } else if (definedRules.contentListType == "exclude") {
                                        if (isFirstSeenExcludeRule) {
                                            for (contentIdIndx in contentIds) {
                                                intersectionOfExcludedContent.push(contentIds[contentIdIndx]);
                                            }
                                            isFirstSeenExcludeRule = false;
                                        } else {
                                            intersectionOfExcludedContent = intersectionOfExcludedContent.filter(function(n) {
                                                return contentIds.indexOf(n) !== -1;
                                            });
                                        }
                                    }

                                } else {
                                    if (definedRules.contentListType == "include") {
                                        for (contentIdIndx in contentIds) {
                                            contentIdMap["include"].push(contentIds[contentIdIndx]);
                                        }
                                    } else if (definedRules.contentListType == "exclude") {
                                        for (contentIdIndx in contentIds) {
                                            contentIdMap["exclude"].push(contentIds[contentIdIndx]);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            } else {
                contentIdMap = contentIdMap || { "include": []};
				contentIdMap["include"].push(configGr.getValue("default_contents"));
            }

            if (isLeastAccessibleContentMethod) {
                if (hasResponses) {
                    var contentsToBeExcluded = intersectionOfExcludedContent.filter(function(n) {
                        return unionOfIncludedContent.indexOf(n) == -1;
                    });
                    return {"exclude": contentsToBeExcluded};
                } else {
                    return contentIdMap;
                }
            } else {
                //This will ensure the default contents are included only if there is any explict include rule available so the pre-requisite content is always visible for doing the survey any number of times. 
                if (contentIdMap && contentIdMap["include"] && contentIdMap["include"].length > 0)
                    contentIdMap["include"].push(configGr.getValue("default_contents"));
            }


            //Fix DEF0129942 : Based on the survey taken, If all the visible tasks are complete for a section in the guided setup, it should as 100% complete
            if (contentIdMap) {
                this._deactivateExcludedContent(contentIdMap);
                this._reactivateIncludedContent(contentIdMap);
            }

            return contentIdMap;

        } catch (e) {
            gs.warn("Error occured in the rule evaluation");
            return null;
        }
    },

    _deactivateExcludedContent: function(contentIdMap) {
        var contentsToBeDeactivated = this._getContentIds(contentIdMap, 'status!=' + this.STATUS_TYPE.INACTIVE, 'contentNOT IN', 'contentIN');
        this._insertChangeLogRecords(contentsToBeDeactivated, this.LOG_TYPE.DEACTIVATED);
    },

    _reactivateIncludedContent: function(contentIdMap) {
        var userSkippedContents = this._getContentIdsSkippedByUser();
        var contentToBeIncluded = this._getContentIds(contentIdMap, 'status=' + this.STATUS_TYPE.INACTIVE, 'contentIN', 'contentNOT IN');
        var contentsToBeReactivated = contentToBeIncluded.filter(function(contentId) {
            return userSkippedContents.indexOf(contentId) == -1;
        });
        this._insertChangeLogRecords(contentsToBeReactivated, this.LOG_TYPE.REACTIVATED);
    },

    _insertChangeLogRecords: function(contentIds, type) {
        var logGr = new GlideRecord(this.GSW_CHANGE_LOG_TABLE);
        contentIds.forEach(function(contentId) {
            logGr.initialize();
            logGr.setValue('content', contentId);
            logGr.setValue('type', type);
            logGr.insert();
        });
    },

	// Getting all the content IDs which are manually skipped by the user
    _getContentIdsSkippedByUser: function() {
        var manuallySkippedIds = [];

        var statusGr = new GlideRecord(this.GSW_STATUS_OF_CONTENT_TABLE);
        var changeLogGr = statusGr.addJoinQuery(this.GSW_CHANGE_LOG_TABLE, this.CONTENT, this.CONTENT);
        statusGr.addQuery('content.supports_child_content', false);
        statusGr.addQuery('content.root_parent', this.rootContentId);
        statusGr.addQuery(this.STATUS, this.STATUS_TYPE.INACTIVE);
        changeLogGr.addCondition('changed_by', '!=', '');
        changeLogGr.addCondition(this.TYPE, this.LOG_TYPE.DEACTIVATED);
        statusGr.query();

        while (statusGr.next())
            manuallySkippedIds.push(statusGr.getValue(this.CONTENT));

        return manuallySkippedIds;
    },

    _getContentIds: function(contentIdMap, statusQuery, includeListQuery, excludeListQuery) {
        var contentIds = [];

        var statusGr = new GlideRecord(this.GSW_STATUS_OF_CONTENT_TABLE);
        statusGr.addQuery('content.supports_child_content', false);
        statusGr.addQuery('content.root_parent', this.rootContentId);
        statusGr.addEncodedQuery(statusQuery);

        if (contentIdMap["include"] && contentIdMap["include"].length > 0) {
            statusGr.addEncodedQuery(includeListQuery + contentIdMap["include"]);
            statusGr.query();
            while (statusGr.next())
                contentIds.push(statusGr.getValue(this.CONTENT));
        }

        statusGr.initialize();
        statusGr.addQuery('content.supports_child_content', false);
        statusGr.addQuery('content.root_parent', this.rootContentId);
        statusGr.addEncodedQuery(statusQuery);

        if (contentIdMap["exclude"] && contentIdMap["exclude"].length > 0) {
            statusGr.addEncodedQuery(excludeListQuery + contentIdMap["exclude"]);
            statusGr.query();
            while (statusGr.next())
                contentIds.push(statusGr.getValue(this.CONTENT));
        }

        return contentIds;
    },

    type: 'GuidedSetupDynamicRulesUtil'
};
