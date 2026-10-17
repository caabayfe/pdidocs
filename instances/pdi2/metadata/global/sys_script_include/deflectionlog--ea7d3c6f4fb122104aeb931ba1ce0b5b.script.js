var DeflectionLog = Class.create();
DeflectionLog.prototype = {
    initialize: function(sysId) {
        this._gr = DeflectionLog.getRecordBySysId(sysId);
    },
    
    /**
     * Associate the conversation with this deflection log.
     * @param {string} conversationId 
     */
    setConversationId: function(conversationId) {
        this._gr.setValue('conversation_id', conversationId);
    },

	/**
     * Returns the associated the conversation with this deflection log.
     */
    getConversationId: function() {
        return this._gr.getValue('conversation_id');
    },
    
    /**
     * Associate the deflection type with this deflection log.
     * @param {string} deflectionType Possible values are: 'kb', 'catalog', 'topic', 'synthesized', 'agentic'
     */
    setDeflectionType: function(deflectionType) {
        this._gr.setValue('deflection_type', deflectionType);
    },

	/**
	 * Returns the deflection type
	 * @return {String} the found deflection type if found. null otherwise.
	 */
    getDeflectionType: function() {
		return this._gr.getValue("deflection_type");
	},

    /**
     * Associate the resource with this deflection log.
     * @param {string} resourceTableName 
     * @param {string} resourceSysId 
     */
    setResource: function(resourceTableName, resourceSysId) {
        this._gr.setValue('resource_table', resourceTableName);
        this._gr.setValue('resource_id', resourceSysId);      
    },

    /**
     * Sets the fallback value on fallback column
     * @param {string} fallbackStringValue
     */
    setFallback: function(fallbackStringValue) {
        this._gr.setValue('fallback', fallbackStringValue);
    },

    setNumberOfTurns: function(numberOfTurns) {
        this._gr.setValue('num_of_turns', numberOfTurns);
    },
    
    /**
     * Associate the channel with this deflection log.
     * @param {string} channelSysId sys_id from sys_cs_channel table
     */
    setChannelSysId: function(channelSysId) {
        this._gr.setValue('channel', channelSysId);
    },

    /**
     * Associate the portal with this deflection log.
     * @param {string} portalSysId sys_id from sys_cs_portal table
     */
    setPortalSysId: function(portalSysId) {
        this._gr.setValue('portal', portalSysId);
    },

    /**
     * Associate the state with this deflection log.
     * @param {string} state Possible values are: 'no_response', 'not_resolved', 'resolved'
     */
    setState: function(state) {
        this._gr.setValue('state', state);
    },

	/**
     * Returns the state of the current deflection log
     */
    getState: function() {
        return this._gr.getValue('state');
    },
    
    /**
     * Associate the context profile with this deflection log.
     * @param {string} contextProfileSysId sys_id from sys_cs_context_profile table
     */
    setContextProfileSysId: function(contextProfileSysId) {
        this._gr.setValue('context_profile', contextProfileSysId);
    },
    
    /**
     * Associate the requestor with this deflection log.
     * @param {string} requestorSysId sys_id from sys_user table
     */
    setRequestorSysId: function(requestorSysId) {
        this._gr.setValue('requestor', requestorSysId);
    },
    
    /**
     * Associate the assistant with this deflection log.
     * @param {string} assistantSysId  sys_id from sys_now_assist_deployment table
     */
    setAssistantSysId: function(assistantSysId) {
        this._gr.setValue('assistant', assistantSysId);
    },

    /**
     * Associate the device type with this deflection log.
     * @param {string} deviceTypeValue Possible values are: 'mwebn', 'mobile', 'chat'
     */
    setDeviceTypeValue: function(deviceTypeValue) {
        this._gr.setValue('device_type', deviceTypeValue);
    },
    setExperience: function(experience) {
        this._gr.setValue('experience', experience);
    },

    setOutputTypeValue: function(outputTypeValue) {
        this._gr.setValue('output_type', outputTypeValue);
    },

	/**
 	* Returns true if this is a new record entry 
 	*/
	isNew: function() {
		return gs.nil(this._gr.getValue('sys_id'));
	},

	/**
	 * This is for dynamic update with the allowed field name and value in pairs.
	 */
    setValuesWithFieldMap: function(fieldMap) {
		for (var name in fieldMap) 
			this._gr[name] = fieldMap[name];
	},

    /**
     *
     * @returns {string} sys_id of the deflection log inserted/updated
     */
    flush: function() {
        return this._gr.update();
    },

    type: 'DeflectionLog'
};

/**
 * Retrieves a deflection log record by its sys_id. If not found, returns a new GlideRecord
 * @param {string} sysId - The sys_id of the deflection log record to retrieve.
 * @returns {GlideRecord} - The retrieved GlideRecord, new GlideRecord('sys_cs_deflection_log') if not found
 */
DeflectionLog.getRecordBySysId = function(sysId) {
	if (gs.nil(sysId))
		return new GlideRecord(global.AISearchConstants.SYS_CS_DEFLECTION_LOG_TABLE);

    var deflectionLogGr = new GlideRecord(global.AISearchConstants.SYS_CS_DEFLECTION_LOG_TABLE);

	return deflectionLogGr.get(sysId) ? deflectionLogGr : new GlideRecord(global.AISearchConstants.SYS_CS_DEFLECTION_LOG_TABLE);
};

/**
 * Retrieves a deflection log record resource id. If not found, returns a new GlideRecord
 * @param {string} resourceSysId - The sys_id of the resource on deflection log.
 * @returns {DeflectionLog} - The retrieved global.DeflectionLog record or null if not found.
 */
DeflectionLog.getByResourceId = function(resourceSysId) {
    var deflectionLogGr = new GlideRecord(global.AISearchConstants.SYS_CS_DEFLECTION_LOG_TABLE);
	deflectionLogGr.addQuery('resource_id', resourceSysId);
	deflectionLogGr.query();

	return deflectionLogGr.next() ? new global.DeflectionLog(deflectionLogGr.getValue('sys_id')) : new global.DeflectionLog();
};
