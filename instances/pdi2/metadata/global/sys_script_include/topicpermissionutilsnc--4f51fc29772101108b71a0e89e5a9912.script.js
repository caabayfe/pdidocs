var TopicPermissionUtilSNC = Class.create();
TopicPermissionUtilSNC.prototype = {
    initialize: function() {
        this.TOPIC_MANAGER = 'topic_manager';
        this.TOPIC_CONTRIBUTOR = 'topic_contributor';
        this.AVAILABLE_FOR = 'available_for';
        this.NOT_AVAILABLE_FOR = 'not_available_for';
    },

    /**
     * This function build an object from User-criteria string with key as User criteria and value as boolean flag.
     * @param {string} criteriaString, comma-separated User criteria.
     * @returns {Object} criteriaCache, Object with each User-criteria as key.
     */
    buildCacheFromCriteriaString : function(criteriaString) {
        var criteriaCache = {};
        if (!criteriaString || criteriaString.length == 0)
            return criteriaCache;
        var criteriaList = criteriaString.split(",");
        criteriaList.forEach(function(criteria) {
            criteriaCache[criteria] = true;
        });

        return criteriaCache;
    },

    /**
     * This function build a list of removed User-criteria and added User-criteria from previous topic record and current topic-record.
     * @param {Object} previousCriteriaCache, User-criteria object from previous topic-record.
     * @param {Object} currentCriteriaCache, User-criteria object from current topic-record.
     * @returns {Object} removeAddCriteriaList, Removed and added User-criteria from current topic record compared to previous topic record.
     */
    buildRemoveAndAddCriteriaFromCache : function(previousCriteriaCache, currentCriteriaCache) {
        var removedCriteriaList = [];
        var addedCriteriaList = [];

        for (criteria in previousCriteriaCache) {
            if (!(criteria in currentCriteriaCache)) {
                removedCriteriaList.push(criteria);
            }
        }

        for (criteria in currentCriteriaCache) {
            addedCriteriaList.push(criteria);
        }

        return {
            removed: removedCriteriaList,
            added: addedCriteriaList
        };
    },

    isValidRemoveScenarioTopicPermission : function(topicGlideRecord, topicCriteriaRemoveList) {
        if (this.isValidRemoveScenario(topicGlideRecord, topicCriteriaRemoveList)) {

        }
    },

    getParentTopicManagerAndContributor: function(parentTopicSysId) {
        var result = {};
        if (parentTopicSysId) {
            var gr = new GlideRecord('topic');
            gr.addQuery('sys_id', parentTopicSysId);
            gr.query();
            if (gr.next()) {
                result[this.TOPIC_MANAGER] = gr[this.TOPIC_MANAGER].toString();
                result[this.TOPIC_CONTRIBUTOR] = gr[this.TOPIC_CONTRIBUTOR].toString();
            }
        }
        return result;
    },

    /**
     * This function will validate the delete scenario of User-criteria from a topic.
     * @param {Object} topicGlideRecord, current topic glide record.
     * @param {Object} topicCriteriaRemoveList, Removed list of user-criteria from current topic.
     * @param {String} applyOnField, field to be checked (topic_manager / topic_contributor).
     * @returns {Boolean} result, true - if validation successful.
     */
    isValidRemoveScenario : function(topicGlideRecord, topicCriteriaRemoveList, applyOnField) {
        var result = true;
        if(applyOnField == 'available_for' || applyOnField == 'not_available_for') {
            return result;
        }
        if (topicGlideRecord && topicCriteriaRemoveList && topicCriteriaRemoveList.length > 0) {
            var parentTopic = topicGlideRecord.parent_topic.toString();
            if (parentTopic && parentTopic.length > 0) {
                var gr = new GlideRecord('topic');
                gr.addQuery('sys_id', parentTopic);
                gr.query();
                if (gr.next()) {
                    var criteriaString = gr[applyOnField].toString();
                    var parentCriteriaCache = this.buildCacheFromCriteriaString(criteriaString);
                    for (var i = 0; i < topicCriteriaRemoveList.length; ++i) {
                        var criteria = topicCriteriaRemoveList[i];
                        if (criteria in parentCriteriaCache) {
                            return false;
                        }
                    }
                }
            }
        }
        return result;
    },

    /**
     * This function cascade the final User-criteria to be applied to all its child topics, the cascade operation is additive.
     * @param {Object} currentTopicGr, Current topic glide record.
     * @param {String} userCriteriaString, User-criteria string separated by comma.
     * @param {String} userCriteriaRemoveString, Removed User-criteria string from current topic.
     * @param {String} applyOnField, field to be checked (topic_manager / topic_contributor).
     */
    addUserCriteriaInChildTopics : function(currentTopicGr, userCriteriaString, userCriteriaRemoveString, applyOnField) {
        var queue = [];
        applyOnField = applyOnField || this.TOPIC_MANAGER;
        queue.push(currentTopicGr.getUniqueValue());
        while (queue.length > 0) {
            var levelTopicSysIds = queue.join(',');
            queue = [];
            var gr = new GlideRecord('topic');
            gr.addQuery('parent_topic', 'IN', levelTopicSysIds);
            gr.query();
            while (gr.next()) {
                var childSysId = gr.getUniqueValue();
                var childUserCriteriaString = gr[applyOnField];
                var childUserCriteriaCache = this.buildCacheFromCriteriaString(childUserCriteriaString);
                var toApplyUserCriteriaCache = this.buildCacheFromCriteriaString(userCriteriaString);
                var removedUserCriteriaCache = this.buildCacheFromCriteriaString(userCriteriaRemoveString);
                var mergeList = this._unionParentAndChildCriteriaWithOverride(childUserCriteriaCache, toApplyUserCriteriaCache, removedUserCriteriaCache);
                gr[applyOnField] = mergeList.join(",");
                // Prevent this update to trigger Business Rule calls
                gr.setWorkflow(false);
                gr.update();
                queue.push(childSysId);
            }
        }
    },

    /**
     * This function cascade the final User-criteria to be applied to all its child topics, the cascade operation is overriding.
     * @param {Object} currentTopicGr, Current topic glide record.
     * @param {String} applyOnField, field to be checked (topic_manager / topic_contributor).
     */
    overrideUserCriteriaInChildTopics : function(currentTopicGr, applyOnField) {
        var queue = [];
        applyOnField = applyOnField || this.TOPIC_MANAGER;
        queue.push(currentTopicGr.getUniqueValue());
        var toBeAppliedUserCriteriaString = currentTopicGr[applyOnField];
        var toBeUpdatedChildTopics = [];
        while (queue.length > 0) {
            var levelTopicSysIds = queue.join(',');
            queue = [];
            var gr = new GlideRecord('topic');
            gr.addQuery('parent_topic', 'IN', levelTopicSysIds);
            gr.query();
            while (gr.next()) {
                var childSysId = gr.getUniqueValue();
                toBeUpdatedChildTopics.push(childSysId);
                queue.push(childSysId);
            }
        }
        if (toBeUpdatedChildTopics.length > 0) {
            var childrenGr = new GlideRecord('topic');
            var childrenSysIds = toBeUpdatedChildTopics.join(',');
            childrenGr.addQuery('sys_id', 'IN', childrenSysIds);
            childrenGr.query();
            while (childrenGr.next()) {
                childrenGr[applyOnField] = toBeAppliedUserCriteriaString;
                childrenGr.setWorkflow(false);
                childrenGr.update();
            }
        }
    },

    /**
     * This function will cascade the Topic manager field to all its child topic.
     * @param {Object} current, Current topic glide record.
     * @param {Object} previous, Previous topic glide record.
     */
    applyCascadeForTopicManager: function(current, previous) {
        this._extractAndPreProcess(current, previous, this.TOPIC_MANAGER);
    },

    /**
     * This function will cascade the Topic contributor field to all its child topic.
     * @param {Object} current, Current topic glide record.
     * @param {Object} previous, Previous topic glide record.
     */
    applyCascadeForTopicContributor: function(current, previous) {
        this._extractAndPreProcess(current, previous, this.TOPIC_CONTRIBUTOR);
    },

    /**
     * This function will cascade the Available for field to all its child topic.
     * @param {Object} current, Current topic glide record.
     * @param {Object} previous, Previous topic glide record.
     */
    applyCascadeForAvailableFor: function(current, previous) {
        this._extractAndPreProcess(current, previous, this.AVAILABLE_FOR);
    },

	/**
     * This function will cascade the Not Available for field to all its child topic.
     * @param {Object} current, Current topic glide record.
     * @param {Object} previous, Previous topic glide record.
     */
    applyCascadeForNotAvailableFor: function(current, previous) {
        this._extractAndPreProcess(current, previous, this.NOT_AVAILABLE_FOR);
    },

    /**
     * This function does the orchestration for cacade operation triggered from business rule.
     * It encapsulate the common operation for topic manager and topic contributor.
     * @param {Object} current, Current topic glide record.
     * @param {Object} previous, Previous topic glide record.
     * @param {String} applyOnField, field to be checked (topic_manager / topic_contributor).
     */
    _extractAndPreProcess: function(current, previous, applyOnField) {
        var previousUserCriteriaString = previous[applyOnField].toString();
        if (current.isNewRecord()) {
            var parentRecord = current.parent_topic.getRefRecord();
            if (parentRecord && parentRecord[applyOnField]) {
                previousUserCriteriaString = parentRecord[applyOnField].toString();
            }
        }
        var currentUserCriteriaString = current[applyOnField].toString();
        var previousUserCriteriaCache = this.buildCacheFromCriteriaString(previousUserCriteriaString);
        var currentUserCriteriaCache = this.buildCacheFromCriteriaString(currentUserCriteriaString);
        var addAndRemoveList = this.buildRemoveAndAddCriteriaFromCache(previousUserCriteriaCache, currentUserCriteriaCache);
        var toRemoveUserCriteriaString = addAndRemoveList.removed.join(",");
        if (addAndRemoveList.removed && addAndRemoveList.removed.length > 0) {
            if (this.isValidRemoveScenario(current, addAndRemoveList.removed, applyOnField)) {
                var userCriteriaToAdd = addAndRemoveList.added.join(",");
                this.addUserCriteriaInChildTopics(current, userCriteriaToAdd, toRemoveUserCriteriaString, applyOnField);
            } else {
                current.setAbortAction(true);
                gs.addErrorMessage(gs.getMessage("Can't remove the inherited user criteria from the child."));
            }
        } else if (addAndRemoveList.added && addAndRemoveList.added.length > 0) {
            var userCriteriaToAdd = addAndRemoveList.added.join(",");
            if (userCriteriaToAdd && userCriteriaToAdd.length > 0) {
                this.addUserCriteriaInChildTopics(current, userCriteriaToAdd, toRemoveUserCriteriaString, applyOnField);
            }
        }
    },
	
	/**
     * This function will return if a logged-in user is a topic manager or a topic contributor for the topic.
     * @param {String} topicSysId, Current topic SYS_ID.
     * @returns {Boolean} true, if the logged-in user is a topic manager or topic contributor for current topic.
     */
	isTopicManagerOrContributor: function(topicSysId) {
		return this.isTopicManager(topicSysId) || this.isTopicContributor(topicSysId);
	},

    /**
     * This function will return if a logged-in user is a topic manager for the topic.
     * @param {String} topicSysId, Current topic SYS_ID.
     * @returns {Boolean} true, if the logged-in user is topic manager for current topic.
     */
    isTopicManager: function(topicSysId) {
        return this._userCriteriaMatch(topicSysId, this.TOPIC_MANAGER);
    },

    /**
     * This function will return if a logged-in user is a topic manager for any topic.
     * @returns {Boolean} true, if the logged-in user is topic manager for any topic.
     */
    isAnyTopicManager: function() {
        return this._hasAnyPermission(this.TOPIC_MANAGER);
    },

    isAnyTopicContributor: function() {
        return this._hasAnyPermission(this.TOPIC_CONTRIBUTOR);
    },

	canViewTaxonomy :function(taxonomy){
        var critIds = [];
        var gr = new GlideRecord("taxonomy");
        gr.get(taxonomy);
        critIds.push(gr.getValue('managers'));
        if(sn_uc.UserCriteriaLoader.userMatches(gs.getUserID(), critIds))
            return true;
        
        var userCriteriaList = [];
        var criteriaMap = {};
        
        var taxonomyUtil = new TaxonomyUtil();
        var grc = taxonomyUtil.getTaxonomyTopics(taxonomy,false);
        var encodedQuery = this.TOPIC_MANAGER+'ISNOTEMPTY';

        grc.addEncodedQuery(encodedQuery);
        grc.query();
        while (grc.next()) {
            var criteria = [];
            var contributorString = grc.getValue(this.TOPIC_MANAGER).toString();
            if (contributorString) {
                criteria = contributorString.split(",");
            }
            for (var i = 0; i < criteria.length; ++i) {
                var currCriteria = criteria[i];
                if (!(currCriteria in criteriaMap)) {
                    criteriaMap[currCriteria] = true;
                }
            }
        }
        var grc2 = taxonomyUtil.getTaxonomyTopics(taxonomy,false);
        var encodedQuery2 = this.TOPIC_CONTRIBUTOR+'ISNOTEMPTY';

        grc2.addEncodedQuery(encodedQuery2);
        grc2.query();
        while (grc2.next()) {
            var criteria2 = [];
            var contributorString2 = grc2.getValue(this.TOPIC_CONTRIBUTOR).toString();
            if (contributorString2) {
                criteria2 = contributorString2.split(",");
            }
            for (var i2 = 0; i2 < criteria2.length; ++i2) {
                var currCriteria2 = criteria2[i2];
                if (!(currCriteria2 in criteriaMap)) {
                    criteriaMap[currCriteria2] = true;
                }
            }
        }
        
        for (cmc in criteriaMap) {
            userCriteriaList.push(cmc);
        }
        
        if(sn_uc.UserCriteriaLoader.userMatches(gs.getUserID(), userCriteriaList))
            return true;
	},
	
    _hasAnyPermission: function(applyOnField) {
        applyOnField = applyOnField || this.TOPIC_MANAGER;
        var taxonomyUtil = new TaxonomyUtil();
        var isTaxonomyManager = taxonomyUtil.isTaxonomyManager();
        if (isTaxonomyManager) {
            return true;
        }
        var userCriteriaList = [];
        var criteriaMap = {};
        var gr = new GlideRecord("topic");
        gr.addNotNullQuery(applyOnField);
        gr.query();
        while (gr.next()) {
            var criteria = [];
            var criteriaString = gr.getValue(applyOnField).toString();
            if (criteriaString) {
                criteria = criteriaString.split(",");
            }
            for (var i = 0; i < criteria.length; ++i) {
                var currCriteria = criteria[i];
                if (!(currCriteria in criteriaMap)) {
                    criteriaMap[currCriteria] = true;
                }
            }
        }

        for (currCriteria in criteriaMap) {
            userCriteriaList.push(currCriteria);
        }
        return sn_uc.UserCriteriaLoader.userMatches(gs.getUserID(), userCriteriaList);
    },

    /**
     * This function will return if a logged-in user is a topic contributor for the topic.
     * @param {String} topicSysId, Current topic SYS_ID.
     * @returns {Boolean} true, if the logged-in user is topic contributor for current topic.
     */
    isTopicContributor: function(topicSysId) {
        return this._userCriteriaMatch(topicSysId, this.TOPIC_CONTRIBUTOR);
    },

    /**
     * This function does the check for User-criteria match with logged-in user.
     * @param {String} topicSysId, current topic SYS_ID.
     * @param {String} applyOnField, field to be checked (topic_manager / topic_contributor).
     * @returns {Boolean} true, if the logged-in user matches the user-criteria for applied-field (topic_manager / topic_contributor).
     */
    _userCriteriaMatch: function(topicSysId, applyOnField) {
        if (topicSysId && topicSysId.length > 0) {
            applyOnField = applyOnField || this.TOPIC_MANAGER;
            var critIds = [];
            var gr = new GlideRecord("topic");
            gr.addQuery('sys_id', topicSysId);
            gr.query();
            while (gr.next()) {
                var userCriteriaString = gr.getValue(applyOnField) || "";
                critIds = userCriteriaString.split(",");
            }
            return sn_uc.UserCriteriaLoader.userMatches(gs.getUserID(), critIds);
        }
        return false;
    },

    /**
     * This function merge the child topic User-criteria with new added User-criteria in parent.
     * @param {Object} childCache, Object with all User-criteria in current topic.
     * @param {Object} parentCache, Object with all User-criteria in parent topic.
     * @param {Object} removeCache, Object with all User-criteria removed from previous topic.
     * @returns {Object} result, merged result with override action in child-topic.
     */
    _unionParentAndChildCriteriaWithOverride : function(childCache, parentCache, removeCache) {
        var result = [];
        for (criteriaToBeRemoved in removeCache) {
            if (criteriaToBeRemoved in childCache) {
                delete childCache[criteriaToBeRemoved];
            }
        }
        for (criteriaToBeAdded in parentCache) {
            if (!(criteriaToBeAdded in childCache)) {
                childCache[criteriaToBeAdded] = true;
            }
        }
        for (criteria in childCache) {
            result.push(criteria);
        }
        return result;
    },

    type: 'TopicPermissionUtilSNC'
};
