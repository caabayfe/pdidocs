var TopicList = Class.create();
TopicList.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {

    childTopics: function(taxonomy, topic) {
        var childTopics = this.getChildTopics(taxonomy, topic, false);
        return 'taxonomy=' + taxonomy + '^sys_idNOT IN' + childTopics.join();
    },

    getChildTopics: function(taxonomy, topic, activeRecordsOnly) {
        var taxonomyGr = new GlideRecord('taxonomy');
        taxonomyGr.get(taxonomy);
        if (!taxonomyGr.canRead()) {
            gs.info(gs.getMessage("User {0} does not have access to the given taxonomy and its topic", [gs.getUserID()]));
            return;
        }
        var gr = new GlideRecord('topic');
        gr.addQuery('sys_id', '!=', topic);
        gr.addQuery('taxonomy', taxonomy);
        if (activeRecordsOnly) {
            gr.addActiveQuery();
        }
        gr.addNotNullQuery('parent_topic');
        gr.query();
        this.childTopics = [];
        this.topicList = {};
        this.childTopics.push(topic);
        while (gr.next()) {
            var parentTopic = gr.getValue('parent_topic');
            if (!this.topicList.hasOwnProperty(parentTopic))
                this.topicList[parentTopic] = [];
            this.topicList[parentTopic].push(gr.getValue('sys_id'));
        }
        this.getChildren(topic);
        return this.childTopics;
    },

    getChildren: function(parent) {
        if (!this.topicList.hasOwnProperty(parent))
            return;
        var children = this.topicList[parent];
        this.childTopics = this.childTopics.concat(children);
        for (var i = 0; i < children.length; i++)
            this.getChildren(children[i]);
    },

    modifyChildTopics: function() {
        var taxonomy = this.getParameter('sysparm_taxomomySysId');
        var topic = this.getParameter('sysparm_topicSysId');
        var isDeactivation = this.getParameter('sysparm_deactivate');
        var childTopics = this.getChildTopics(taxonomy, topic, isDeactivation);

        if (!(gs.hasRole("taxonomy_admin") || new global.TaxonomyUtil().isTaxonomyManager() || new global.TopicPermissionUtil().isAnyTopicManager())) {
            gs.info(gs.getMessage("User {0} does not have write access for the given topic and its children", [gs.getUserID()]));
            return false;
        }
        // If parent is not active during activation, Stop!
        if (!isDeactivation && !this.isParentActive(topic)) {
            return "false";
        }

        var gr = new GlideRecord('topic');
        gr.addQuery('sys_id', childTopics);
        gr.query();

        while (gr.next()) {
            gr.active = !isDeactivation;
            gr.update();
        }
        return "true";
    },

    /*
     * Deactivates/Activates all the topics under a given taxonomy, if the taxonomy is deactivated/activated
     * @param- taxonomySysId
     * @param- deactivationParam
     */

    modifyTaxonomyTopics: function() {
        var taxonomy = this.getParameter('sysparm_taxomomySysId');
        var deactivationParam = this.getParameter('sysparm_deactivate');
        var isDeactivation = deactivationParam == 'true';
        if (!(gs.hasRole("taxonomy_admin") || new global.TaxonomyUtil().isTaxonomyManager())) {
            gs.info(gs.getMessage("User {0} does not have write access for the given taxonomy and its topics", [gs.getUserID()]));
            return;
        }
        var topicGr = new GlideRecord('topic');
        topicGr.addQuery('taxonomy', taxonomy);
        topicGr.addQuery('active', isDeactivation);
        topicGr.query();
        topicGr.setValue('active', !isDeactivation);
        topicGr.updateMultiple();
    },

    /*
     * Moves a topic and its children to another taxonomy/parent topic
     * Deletes all those featured content from the parent topic tree, where the content was featured from curent topic and its children.
     * For example in a normal heirarchy of topics HR -> HR1 -> HR2 -> HR3, where HR is the topmost topic in heirarchy, 
     * if we move HR2 to another taxonomy/parent topic, then the content from HR2 and HR3 which are featured on HR or HR1 will be deleted
     * Activates or deactivates the topic tree (current topic and its children) on the basis of toggling of "active" field or 
     * on the basis of destination taxonomy/parent topic while moving topic to another taxonomy/parent topic
     */
    moveTopicTree: function() {
        var topic = this.getParameter('sysparm_topicSysId');
        var topicState = this.getParameter('sysparm_topicState');
        var taxonomy = this.getParameter('sysparm_taxomomySysId');
        var parentTopic = String(this.getParameter('sysparm_parentTopicId').toString());
        var isTaxonomyChanged = this.getParameter('sysparm_isTaxonomyChanged');
        var isActiveToggled = this.getParameter('sysparm_isActiveToggled');
        var isEnableUserCriteriaChecked = this.getParameter('sysparm_topicEnableUserCriteria');
        var topicGr = new GlideRecord('topic');
        topicGr.get(topic);
        if (!topicGr.isValidRecord()) {
            gs.info("topic provided is not valid");
            return;
        }
        if (!topicGr.canWrite()) {
            gs.info(gs.getMessage("User {0} does not have access to modify the given topic", [gs.getUserID()]));
            return;
        }

        if (!(gs.hasRole("taxonomy_admin") || new global.TaxonomyUtil().isTaxonomyManager()) && parentTopic == '') {
            gs.info(gs.getMessage("User {0} cannot create a root topic", [gs.getUserID()]));
            return; 
        }
        
        var topicParent = new GlideRecord('topic');
        topicParent.get(parentTopic);
        
        var applyParentTemplate = false;
        var parentTemplate;

        var enableUserCriteriaCheck = false;
		if(topicParent.isValidRecord())
			enableUserCriteriaCheck = topicParent.getValue('enable_user_criteria_check');
		else
			enableUserCriteriaCheck = isEnableUserCriteriaChecked;
        
        if(topicParent.isValidRecord() && topicParent.getValue('apply_to_child_topics') == true) {
            applyParentTemplate = true;
            parentTemplate = topicParent.getValue('template');
        }

        var childTopics = this.getChildTopics(topicGr.taxonomy, topic, false);

        this.deleteFeaturedContent(topic);

        var statusMap = this._getStatusChange(topic, parentTopic, taxonomy, isActiveToggled, topicState);
        var shouldUpdateTreeState = statusMap['shouldUpdateTreeState'];
        var finalTreeState = statusMap['finalTreeState'];
        
        var topicCurrent = topicGr;

        topicGr = new GlideRecord('topic');
        topicGr.addQuery('sys_id', childTopics);
        topicGr.query();
                
        if(applyParentTemplate) {
            topicGr.setValue("template", parentTemplate);
        }
        if (isTaxonomyChanged)
            topicGr.setValue("taxonomy", taxonomy);
        if (shouldUpdateTreeState)
            topicGr.setValue("active", finalTreeState);
        topicGr.setValue("enable_user_criteria_check", enableUserCriteriaCheck);
        
        // Paremeters: oldParent UC, newParentUC, currentUC
        var parentRecordValid = topicParent.isValidRecord();
        var newParentAvailableFor = parentRecordValid ? topicParent.available_for : "";
        var newParentNotAvailableFor = parentRecordValid ? topicParent.not_available_for : "";
        var newParentTopicManager = parentRecordValid ? topicParent.topic_manager : "";
        var newParentTopicContributor = parentRecordValid ? topicParent.topic_contributor : "";


        var parentTopicManager = topicCurrent.parent_topic != '' ? topicCurrent.parent_topic.topic_manager : '';
        var parentTopicContributor = topicCurrent.parent_topic != '' ? topicCurrent.parent_topic.topic_contributor : '';
        var parentTopicAvailableFor = topicCurrent.parent_topic != '' ? topicCurrent.parent_topic.available_for : '';
        var parentTopicNotAvailableFor = topicCurrent.parent_topic != '' ? topicCurrent.parent_topic.not_available_for : '';
        var topicManager = this.getUnifiedUserCriteria(parentTopicManager, newParentTopicManager, topicCurrent.topic_manager);
        var topicContributor = this.getUnifiedUserCriteria(parentTopicContributor, newParentTopicContributor, topicCurrent.topic_contributor);
        var topicAvailableFor = this.getUnifiedUserCriteria(parentTopicAvailableFor, newParentAvailableFor, topicCurrent.available_for);
        var topicNotAvailableFor = this.getUnifiedUserCriteria(parentTopicNotAvailableFor, newParentNotAvailableFor, topicCurrent.not_available_for);
        topicCurrent.setValue('parent_topic', parentTopic);
        topicCurrent.setValue('topic_manager', topicManager);
        topicCurrent.setValue('topic_contributor', topicContributor);
        topicCurrent.setValue('enable_user_criteria_check', enableUserCriteriaCheck);
        topicCurrent.setValue('available_for', topicAvailableFor);
        topicCurrent.setValue('not_available_for', topicNotAvailableFor);
        topicCurrent.update();

        topicGr.updateMultiple();
        return finalTreeState;
    },
    /*
     * Returns the final state of the topic and tree and whether the state of the whole topic tree should be updated or 
     * not while moving topic to another taxonomy/parent topic
     * For eg. if new taxonomy/parent topic is inactive, then it returns shouldUpdateTreeState: true and
     * finalTreeState: false because we need an inactive topic/taxonomy cannot have active child topics
     * If while moving a topic to an active taxonomy/parent topic, the "active" field is toggled 
     * then the state of the whole topic tree should be the new toggled state.
     * Based on the combination of three input parameters -> state of parent topic, state of taxonomy, isActiveToggled
     */
    _getStatusChange: function(topic, parentTopic, taxonomy, isActiveToggled, topicState) {
        var parentTopicExists = true;
        if (!parentTopic)
            parentTopicExists = false;

        var parentState;

        if (parentTopicExists) {
            var parentTopicGr = new GlideRecord('topic');
            parentTopicGr.get(parentTopic);
            parentState = parentTopicGr.active;
        } else {
            var taxonomyGr = new GlideRecord('taxonomy');
            taxonomyGr.get(taxonomy);
            parentState = taxonomyGr.active;
        }
        var finalTreeState = topicState;
        var shouldUpdateTreeState = isActiveToggled;
        if (!parentState) {
            shouldUpdateTreeState = true;
            finalTreeState = false;
        }
        var statusMap = {
            "shouldUpdateTreeState": shouldUpdateTreeState,
            "finalTreeState": finalTreeState
        };
        return statusMap;
    },
    /*
     * Deletes all those featured content from the parent topic tree, where the content was featured from curent topic and its children. 
     * For example in a normal heirarchy of topics HR -> HR1 -> HR2 -> HR3, where HR is the topmost topic in heirarchy, 
     * if we move HR2 to another taxonomy/parent topic, then the content from HR2 and HR3 which are featured on HR or HR1 will be deleted
     */
    deleteFeaturedContent: function(topic) {
        var parentTopicList = [];
        var topicGr = new GlideRecord('topic');
        topicGr.get(topic);
        if (!topicGr.canRead()) {
            gs.info(gs.getMessage("User {0} does not have access to the give topic", [gs.getUserID()]));
            return;
        }
        while (!topicGr.getElement('parent_topic').nil()) {
            var parent = topicGr.parent_topic;
            parentTopicList.push(parent);
            topicGr = new GlideRecord('topic');
            topicGr.get(parent);
        }
        var featContentList = [];
        parentTopicList.forEach(function(parentTopic) {
            var featGr = new GlideRecord('featured_content');
            featGr.addQuery('topic', parentTopic);
            featGr.addQuery('connected_content.topic', 'NOT IN', parentTopicList);
            featGr.query();
            featGr.deleteMultiple();
        });
    },

    /* Updates all the child topics' 'Enable User Criteria Check' field with value from the root topic*/
    updateChildTopics: function(topic) {
		this.updateTopic(topic);
	},

	updateTopic: function(topic) {
		var topicGr = new GlideRecord('topic');
		topicGr.addQuery('parent_topic', topic.getUniqueValue());
		topicGr.query();
		while(topicGr.next()) {
			topicGr.setValue('enable_user_criteria_check', topic.getValue('enable_user_criteria_check'));
			topicGr.update();
			this.updateTopic(topicGr);
		}
	},

    isParentActive: function(topic) {
        topic = topic ? topic : this.getParameter('sysparm_topicSysId');
        var result = {
            "active": false,
            "type": ""
        };
        var gr = new GlideRecord('topic');
        gr.get(topic);
        if (!gr.canRead()) {
            gs.info(gs.getMessage("User {0} does not have access to the given topic", [gs.getUserID()]));
            return;
        }
        var parent = gr.getValue('parent_topic');
        if (parent) {
            var parentTopicGr = gr.parent_topic.getRefRecord();
            result.type = "topic";
            result.active = parentTopicGr.getValue('active') === "1";
        } else {
            var taxonomy = gr.taxonomy.getRefRecord();
            result.type = "taxonomy";
            result.active = taxonomy.getValue('active') === "1";
        }

        return JSON.stringify(result);
    },

    deleteTopics: function() {
        var taxonomySysId = this.getParameter('sysparm_taxonomy_sysid');
        var topicSysId = this.getParameter('sysparm_topic_sysid');

        if (taxonomySysId) {
            return this.deleteTaxonomyTopics(taxonomySysId);
        }

        return this.deleteChildTopics(topicSysId);
    },

    deleteTaxonomyTopics: function(taxonomy) {
        if (!(gs.hasRole("taxonomy_admin") || new global.TaxonomyUtil().isTaxonomyManager() || new global.TopicPermissionUtil().isAnyTopicManager())) {
            gs.info(gs.getMessage("User {0} does not have rights to delete the topics of the given taxonomy", [gs.getUserID()]));
            return;
        }
        var gr = new GlideRecord('topic');
        gr.addQuery('taxonomy', taxonomy);
        gr.query();
        while (gr.next()) {
            var topic = gr.getUniqueValue();
            this.deleteConnectedContent(topic);
            this.deleteConnectedCategory(topic);
            this.deleteUnconnectedCategoryContent(topic);
            gr.deleteRecord();
        }
        return "true";
    },

    deleteChildTopics: function(topic) {
        if (!(gs.hasRole("taxonomy_admin") || new global.TaxonomyUtil().isTaxonomyManager() || new global.TopicPermissionUtil().isAnyTopicManager())) {
            gs.info(gs.getMessage("User {0} does not have rights to delete the given topic and its children", [gs.getUserID()]));
            return;
        }
        var gr = new GlideRecord('topic');
        gr.get(topic);
        var taxonomy = gr.getValue('taxonomy');
        var childTopics = this.getChildTopics(taxonomy, topic);

        //delete all child topics
        var cGr = new GlideRecord('topic');
        cGr.addQuery('sys_id', childTopics);
        cGr.query();
        while (cGr.next()) {
            this.deleteConnectedContent(cGr.getUniqueValue());
            this.deleteConnectedCategory(cGr.getUniqueValue());
            this.deleteUnconnectedCategoryContent(cGr.getUniqueValue());
            cGr.deleteRecord();
        }
        return "true";
    },
	
	  deleteConnectedCategory: function(topic) {
        var topicGr = new GlideRecord('topic');
        topicGr.get(topic);
        if (!topicGr.canRead()) {
            gs.info(gs.getMessage("User {0} does not have rights to delete the connected content of the give topic", [gs.getUserID()]));
            return;
        }
        var m2mGr = new GlideRecord('m2m_connected_category');
        m2mGr.addQuery('topic', topic);
        m2mGr.query();
        m2mGr.deleteMultiple();
    },
	
	  deleteUnconnectedCategoryContent: function(topic) {
        var topicGr = new GlideRecord('topic');
        topicGr.get(topic);
        if (!topicGr.canRead()) {
            gs.info(gs.getMessage("User {0} does not have rights to delete the connected content of the give topic", [gs.getUserID()]));
            return;
        }
        var m2mGr = new GlideRecord('unconnected_category_content');
        m2mGr.addQuery('topic', topic);
        m2mGr.query();
        m2mGr.deleteMultiple();
    },

    deleteConnectedContent: function(topic) {
        var topicGr = new GlideRecord('topic');
        topicGr.get(topic);
        if (!topicGr.canRead()) {
            gs.info(gs.getMessage("User {0} does not have rights to delete the connected content of the give topic", [gs.getUserID()]));
            return;
        }
        var m2mGr = new GlideRecord('m2m_connected_content');
        m2mGr.addQuery('topic', topic);
        m2mGr.query();
        m2mGr.deleteMultiple();
    },

    /*
     * Returns all the accessible taxonomies for a logged in user
     * @return Array
     */
    getAccessibleTaxonomies: function() {
        var gr = new GlideRecord('taxonomy');
        gr.query();
        var taxonomies = [];
        while (gr.next()) {
            if (gs.hasRole("admin,taxonomy_admin") || sn_uc.UserCriteriaLoader.userMatches(gs.getUserID(), [gr.getValue('managers')]) || new global.TaxonomyUtil().isTaxonomyContributor(gr.sys_id))
                taxonomies.push(gr.getUniqueValue());
        }

        return taxonomies;
    },

    /**
     * Returns accessible topics
     */
    getAccessibleTopics: function() {
        var topics = [];
        var taxonomy = this.getAccessibleTaxonomies();

        var gr = new GlideRecord('topic');
        gr.addQuery('taxonomy', taxonomy);
        gr.query();

        while (gr.next())
            topics.push(gr.getUniqueValue());

        return topics;
    },
    /**
     * Returns accessible topics of a taxonomy
     */
    getTaxonomyTopics: function() {
        var taxonomyId = this.getParameter('sysparm_taxonomyId');
        var taxonomyGr = new GlideRecord("taxonomy");
        taxonomyGr.get(taxonomyId);
        if (!taxonomyGr.isValidRecord()) {
            gs.info(gs.getMessage("taxonomyId provided is not valid"));
            return;
        }
        if (!taxonomyGr.canRead()) {
            gs.info(gs.getMessage("User {0} does not have access to the given taxonomy", [gs.getUserID()]));
            return;
        }
        var taxonomyUtil = new TaxonomyUtil();
        var topicGr = taxonomyUtil.getTaxonomyTopics(taxonomyId, true);
        var topic = [];
        topicGr.query();
        while (topicGr.next()) {
            var topicObj = {
                "id": topicGr.getUniqueValue(),
                "name": topicGr.getValue("name")
            };
            if (topicGr.canRead())
                topic.push(topicObj);
        }
        return JSON.stringify(topic);
    },
    /**
     * Copies taxonomy and its topic, contributors, connected content and featured content.
     */
    copyTaxonomyTree: function() {
        var currentTaxonomyId = this.getParameter('sysparm_currentTaxonomyId');
        var newTaxonomyName = this.getParameter('sysparm_newTaxonomyName');
        var newTaxonomyId = '';
        var gr = new GlideRecord('taxonomy');
        gr.get(currentTaxonomyId);
        if (gr.isValidRecord() && gr.canRead())
            newTaxonomyId = new global.TaxonomyCopyUtil().copyTaxonomyTree(currentTaxonomyId, newTaxonomyName);
        return newTaxonomyId;
    },

    /**
     * Copies a topic tree and its contributors, connected content and featured content.
     */
    copyTopicTree: function() {
        var currentTopicId = this.getParameter('sysparm_currentTopicId');
        var newTaxonomyId = this.getParameter('sysparm_newTaxonomyId');
        var newParentTopicId = this.getParameter('sysparm_newParentTopicId');
        var newTopicId = '';
        var taxonomyGr = new GlideRecord('taxonomy');
        taxonomyGr.get(newTaxonomyId);
        if (taxonomyGr.isValidRecord() && taxonomyGr.canRead())
            newTopicId = new global.TaxonomyCopyUtil().copyTopicTree(currentTopicId, newTaxonomyId, newParentTopicId);
        return newTopicId;
    },

    isTaxonomyManager: function() {
        var taxonomyId = this.getParameter('sysparm_taxonomy_id');
        var taxonomyGr = new GlideRecord("taxonomy");
        taxonomyGr.get(taxonomyId);
        var taxonomyManagers = taxonomyGr.getValue("managers") || '';
        return sn_uc.UserCriteriaLoader.userMatches(gs.getUserID(), [taxonomyManagers]);
    },
    
    /**
    * Gets the final unified user criteria for topic manager and contributor
      (currentCriteria - oldParentCriteria) + newParentCriteria
    */

    getUnifiedUserCriteria: function(oldParentCriteria, newParentCriteria, currentCriteria) {
        var arrayUtil = new ArrayUtil();
        var oldParentCriteriaList = oldParentCriteria.toString().split(",");
        var newParentCriteriaList = newParentCriteria.toString().split(",");
        var currentCriteriaList = currentCriteria.toString().split(",");
        
        var diffCriteriaList = arrayUtil.diff(currentCriteriaList, oldParentCriteriaList);
        return arrayUtil.union(newParentCriteriaList, diffCriteriaList);
    },

    type: 'TopicList'
});
