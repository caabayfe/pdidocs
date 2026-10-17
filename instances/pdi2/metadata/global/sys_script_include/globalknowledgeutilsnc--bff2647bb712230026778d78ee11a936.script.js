var GlobalKnowledgeUtilSNC = Class.create();
GlobalKnowledgeUtilSNC.prototype = {
    initialize: function() {
    },
	getSessionProfile: function() {
		return new LiveFeedUtil().getSessionProfile();
	},
	getProfileDetails: function(id) {
		var profile = new SNC.LiveFeedApi().getProfileDetails(id, 'BASIC');
		return JSON.parse(profile);
	},
	getCanReadKBs: function() {
		var ids = "sys_idIN";
		var readKBs = new KnowledgeRefQualifiers().getCanReadKBs();
		//Check for Social Q&A Enabled for the KB
		
		var kb = new GlideRecord("kb_knowledge_base");
		kb.addEncodedQuery(readKBs);
		kb.addActiveQuery();
		kb.addQuery('enable_socialqa', true);
		kb.query();
		
		while(kb.next()) {	
			ids += kb.getUniqueValue() + ",";
		}
		
		return ids;
	},
	getUiNotifications: function() {
		return new SNC.LiveFeedApi().getUiNotifications();
	},
	getClientParameters: function(param) {
		var trans = GlideTransaction.get();
		if(trans) {
			var param_value = GlideTransaction.get().getRequestParameter(param);
			gs.info('Data from Glide transaction: ' + param_value);
			return param_value;
		}
		return '';
	},
	getDirection: function() {
		return GlideI18NStyle.getDirection();
	},
	getJSONCategories: function(kbKnowledgeBaseId){
			return new SNC.KnowledgeHelper().getJSONCategories(kbKnowledgeBaseId);
	},
	getCategoryIdsForKB: function(kbKnowledgeBaseId){
		function flatenCategoryJSON(flatCat, categories) {
			for(var i = 0; i < categories.length; i++) {
				var category = categories[i];
				if(category.items.length > 0) {
					flatenCategoryJSON(flatCat, category.items);
				}
				flatCat.push(category.id);
				
			}
		}
		var categories = new SNC.KnowledgeHelper().getJSONCategories(kbKnowledgeBaseId);
		categories = JSON.parse(categories);
		var flatCategories = [];
		flatenCategoryJSON(flatCategories, categories);
		return flatCategories;
	},
	getRefQualCategoryIdsForKB: function(kbKnowledgeBaseId) {
		var ids = this.getCategoryIdsForKB(kbKnowledgeBaseId);
		var catID = 'sys_idIN';
		for(var i=0 ; i<ids.length ; i++) {
			catID = catID + ids[i] + ",";
		}
		return catID;
	},
	getCompatibility: function() {
		var browser = gs.getSession().getProperty('user_agent_browser');
		var browser_version = gs.getSession().getProperty('user_agent_version_nocompat');
		if(browser == 'ie' && parseInt(browser_version)<10)
			return 'block';
		return 'allow';
	},
	canCreateNewQuestion: function() {
		var ids = this.getCanReadKBs();
		if(ids == "sys_idIN")
			return false;
		else
			return true;
	},
	checkpluginActive: function(plugin) {
		return pm.isActive(plugin);
	},
	// PRB709958 - for restricting DOS attack
	canCreate: function(tableName, property, entity) {
		if (gs.nil(tableName) || gs.nil(property))
            return false;
		
		var allowedCount = parseInt(gs.getProperty(property));
		if (gs.nil(allowedCount) || isNaN(allowedCount) || allowedCount < 0)	// property value not set by default, allow to create
			return true;
		
		var userName = gs.getUserName();
        if (gs.nil(userName))
            return false;
		
        var count = new GlideAggregate(tableName);
        count.addQuery('sys_created_by', userName);
		count.addQuery('sys_created_on','>=', gs.hoursAgo(24));   // check for # records created in last 24 hours
        count.addAggregate('COUNT');
        count.query();
        var totalCount = 0;
        if (count.next())
            totalCount = parseInt(count.getAggregate('COUNT'));
        if (allowedCount >= 0 && totalCount >= allowedCount) {
			gs.info(gs.getMessage("Number of permitted {0} per day per user [{1}] is {2}", [entity, userName, allowedCount]));
			return false;
		}
        
        return true;
	},
	
	attachDocumentAsInvisible: function(articleId, docxFileName, docxContentType, inputStream){
		return SNC.KnowledgeHelper.attachDocumentAsInvisible(articleId, docxFileName, docxContentType, inputStream);
	},
	
	getHTMLFromAttachment: function(convertedId, articleId){
		return SNC.KnowledgeHelper.getHTMLFromAttachment(convertedId, articleId);
	},

	/**
	 * Wraps SNC.KnowledgeHelper().processAttachment() so the JSONObject Java return type
	 * never crosses the scope boundary directly — scoped callers only ever receive a string.
	 *
	 * @param {String} fileId - sys_attachment sys_id of the uploaded Word doc
	 * @param {String} articleId - kb_knowledge sys_id to update, or null/blank to create a new article
	 * @returns {String} JSON string
	 */
	processAttachment: function(fileId, articleId) {
		var result = new SNC.KnowledgeHelper().processAttachment(fileId, articleId);
		return new global.JSON().decode(result);
	},
	
    /**
     * Insert into the sys journal field table, when article is created using GenAI
     */
    insertSysJournalField: function(sysId, genAIlogId) {
        try {
            var gr = new GlideRecord('sys_journal_field');
            gr.setValue('name', 'kb_knowledge');
            gr.setValue('element_id', sysId);
            gr.setValue('value', '{"logId":"' + genAIlogId + '","message":"Created using Gen AI","created_by":"SNGENAI","modified":"false"}');
            gr.insert();
        } catch (e) {
            gs.error('Error occcured while inserting data into sys_journal_field' + e);
        }
    },
    /**
     * Fetch the log Id for the given article sysId
     * 
     * @param sysId - article sys_id
     * 
     * @returns logId if exists, otherwise '-1'
     */
    getLogId: function(sysId) {
        var val = this._getFieldValue(sysId);
        try {
            var result = JSON.parse(val);
            return result.logId;
        } catch (e) {
            gs.error('Error while parsing the value');
        }
        return '-1';
    },
    /**
     * check whether the article creatd by Gen AI is modified or not.
     *
     * @param sysId - article sys_id
     *
     * @returns true/false if exists, otherwise '-1'
     */
    isArticleModified: function(sysId) {
        var value = this._getFieldValue(sysId);
        if (!gs.nil(value)) {
        try {
                var result = JSON.parse(value);
                if (result && result.modified == 'false') {
                    gs.addInfoMessage(gs.getMessage('This article was drafted by AI. Be sure to review it and make edits before saving.'));
                    return 'false';
                }
                return 'true';
        } catch (e) {
                gs.error('[GlobalKnowledgeUtilSNC][isArticleModified] Error while parsing the value');
            }
        }
        return '-1';
    },
    /**
     * Update the sys journal entry's modifed attribute to "true" if article is created by gen ai
     */
    updateArticleAsModified: function(sysId) {
        var gr = new GlideRecord('sys_journal_field');
        gr.addQuery('name', 'kb_knowledge');
        gr.addQuery('element_id', sysId);
        gr.addNullQuery('element');
        gr.query();
        var val = '',
            logId = '-1';
        while (gr.next()) {
            var temp = gr.getValue('value');
            if (temp.indexOf('SNGENAI') != -1) {
                val = temp;
                try {
                    var currentValue = JSON.parse(val);
                    logId = currentValue.logId;
                    if (currentValue.modified == 'false') {
                        currentValue.modified = "true";
                        var updatedValue = JSON.stringify(currentValue);
                        gr.setValue('value', updatedValue);
                        gr.update();
                    }
                    return logId;
                } catch (e) {
                    gs.error('[updateAsModified]Error while parsing the value');
                }
            }
        }
        return '-1';
    },
    /**
     * Get the field value containing SNGENAI
     */
    _getFieldValue: function(elementId) {
        var gr = new GlideRecord('sys_journal_field');
        gr.addQuery('name', 'kb_knowledge');
        gr.addQuery('element_id', elementId);
        gr.addNullQuery('element');
        /* This Line is added to route the query to the read replica*/
        gr.setCategory('homepage');
        gr.query();
        var val = '';
        while (gr.next()) {
            var temp = gr.getValue('value');
            if (temp.indexOf('SNGENAI') != -1)
                val = temp;
        }
        return val;
    },
	/**
    * Updates system properties with provided values and returns the result status.
	*
	* @param {Array<Object>} properties - Array of property objects containing sysId and value
	* @returns {Object} - Result object with success status and savedProperties details
	*/
	updateProperties: function(properties) {
    var LOG_PREFIX = "[GlobalKnowledgeUtilSNC:updateProperties]";
    var result = {
        success: true,
        savedProperties: []
    };
	if (!gs.hasRole('admin') && !gs.hasRole('knowledge_admin')) {
        gs.error(gs.getMessage("{0} User does not have admin or knowledge_admin role, Update not allowed.", [LOG_PREFIX]));
        return { success: false };
    }

    for (var i = 0; i < properties.length; i++) {
        var prop = properties[i];

        // Validate property object
        if (!prop.sysId || prop.value === undefined) {
            gs.error(gs.getMessage("{0} Invalid property object at index {1}", [LOG_PREFIX, i]));
            result.success = false;
            continue;
        }
        var propGr = new GlideRecord('sys_properties');
        if (!propGr.get(prop.sysId)) {
            gs.error(gs.getMessage("{0} Property not found: {1}", [LOG_PREFIX, prop.sysId]));
            result.success = false;
            continue;
        }
		propGr.setValue('value', prop.value);
        if (propGr.update()) {
            result.savedProperties.push({
                sysId: prop.sysId,
                name: propGr.getValue('name'),
                success: true
            });
        } else {
            gs.error(gs.getMessage("{0} Failed to update property: {1}", [LOG_PREFIX, prop.sysId]));
            result.success = false;
        }
    }
    return result;
	},
    type: 'GlobalKnowledgeUtilSNC'
};
