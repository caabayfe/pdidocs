var KBInstrumentationSNC = Class.create();
KBInstrumentationSNC.prototype = {
	initialize: function() {
		this.operations = {
			PUBLISH: 'publish',
			INSERT: 'insert'
		};

		// Instrumentation fields
		this.FIELD_INSTRUMENTATION_METADATA = 'instrumentation_metadata';
		this.FIELD_GENERATED_WITH_NOW_ASSIST = 'generated_with_now_assist';

		// Session key prefix
		this.SESSION_KEY_PREFIX = 'instrumentation_metadata_';
	},

	/*
	 * @param {String} sys_id
	 * 
	 * returns void
	 */
	initializeSessionInstrumentationValues: function(sys_id) {
		var defaultInstrumentationValues = {
			firstLoadTimestamp: Date.now(),
			isGenAiGenerated: false,
			isGenAiMultiTaskCancelled: false,
			taskList:[]
		};

		this._setInstrumentationSessionMetadata(sys_id, defaultInstrumentationValues);
	},

	/*
	 * @param {String} sys_id
	 * @param {String} key
	 * @param {String} value
	 * 
	 * returns void
	 */
	updateSessionInstrumentationValue: function(sys_id, key, value) {
		var instrumentationMetadata = this._getInstrumentationSessionMetadata(sys_id);
		instrumentationMetadata[key] = value;
		this._setInstrumentationSessionMetadata(sys_id, instrumentationMetadata);
	},

	/*
	 * @param {GlideRecord} gr
	 * @param {Object} operation
	 * 
	 * returns void
	 */
	recordGCFEvent: function(gr, operation) {
		var instrumentationMetadata = this._getInstrumentationMetadata(gr, operation);

		if (!instrumentationMetadata)
			return;
		
		if (operation === this.operations.PUBLISH)
			this._recordPublishEvent(gr, instrumentationMetadata);
		else if (operation === this.operations.INSERT)
			this._recordInsertEvent(gr, instrumentationMetadata);
	},

	/*
	 * @param {GlideRecord} gr
	 * @param {String} operation
	 * 
	 * returns {Object} instrumentationMetadata
	 */
	_getInstrumentationMetadata: function(gr, operation) {
		var instrumentationMetadataString;
		var instrumentationMetadata;

		if (operation === this.operations.PUBLISH) {
			// Fetch from the record field
			instrumentationMetadataString = gr.getValue(this.FIELD_INSTRUMENTATION_METADATA);
		} else if (operation === this.operations.INSERT) {
			// Fetch from the session
			var key = this.SESSION_KEY_PREFIX + current.sys_id;
			instrumentationMetadataString = gs.getSession().getClientData(key);
		}

		try {
			instrumentationMetadata = JSON.parse(instrumentationMetadataString);
		} catch (err) {
			gs.log('Error: Failed to parse instrumentation metadata for record: ' + gr.sys_id)
		}

		return instrumentationMetadata;
	},

	/*
	 * @param {String} sys_id
	 * 
	 * returns String instrumentation metadata
	 */
	_getInstrumentationSessionMetadata: function(sys_id) {
		var key = this.SESSION_KEY_PREFIX + sys_id;
		var instrumentationMetadata;

		try {
			instrumentationMetadata = JSON.parse(gs.getSession().getClientData(key));
		} catch (err) {
			gs.log('Error: Failed to parse instrumentation metadata for record: ' + sys_id);
		}

		return instrumentationMetadata;
	},

	/*
	 * @param {String} sys_id
	 * @param {Object} instrumentationMetadata
	 * 
	 * returns void
	 */
	_setInstrumentationSessionMetadata: function(sys_id, instrumentationMetadata) {
		var key = this.SESSION_KEY_PREFIX + sys_id;
		var value = JSON.stringify(instrumentationMetadata);
		gs.getSession().putClientData(key, value);
	},

	/*
	 * @param {GlideRecord} gr
	 * @param {Object} instrumentationMetadata
	 * 
	 * returns void
	 */
	_recordInsertEvent: function(gr, instrumentationMetadata) {
		instrumentationMetadata.timeTakenToFirstSave = Date.now() - instrumentationMetadata.firstLoadTimestamp;
		instrumentationMetadata.isGenAiGenerated = (instrumentationMetadata.taskList.length >= 1);

		gr.setValue(this.FIELD_INSTRUMENTATION_METADATA, JSON.stringify(instrumentationMetadata));
		gr.setValue(this.FIELD_GENERATED_WITH_NOW_ASSIST, instrumentationMetadata.isGenAiGenerated);

		// Collect GCF usage
		var sm = new GCFSampleMap();
		var collectionEvent = instrumentationMetadata.isGenAiGenerated ? 'insert_with_gen_ai' : 'insert_without_gen_ai';
		sm.put('time_to_insert', instrumentationMetadata.timeTakenToFirstSave.toString());
		sm.put('genai_multitask_article', (instrumentationMetadata.taskList.length > 1).toString());
		sm.put('genai_multitask_cancelled', instrumentationMetadata.isGenAiMultiTaskCancelled.toString());
		GCFCollector.recordUsageEvent('knowledge', 'knowledge_article_create', collectionEvent, sm);
	},

	/*
	 * @param {GlideRecord} gr
	 * @param {Object} instrumentationMetadata
	 * 
	 * returns void
	 */
	_recordPublishEvent: function(gr, instrumentationMetadata) {
		instrumentationMetadata.timeTakenToPublish = Date.now() - instrumentationMetadata.firstLoadTimestamp;
		instrumentationMetadata.isGenAiGenerated = (instrumentationMetadata.taskList.length >= 1);
		gr.setValue(this.FIELD_INSTRUMENTATION_METADATA, JSON.stringify(instrumentationMetadata));
		gr.setValue(this.FIELD_GENERATED_WITH_NOW_ASSIST, instrumentationMetadata.isGenAiGenerated);

		// Collect GCF usage
		var sm = new GCFSampleMap();
		var collectionEvent = instrumentationMetadata.isGenAiGenerated ? 'publish_with_gen_ai' : 'publish_without_gen_ai';
		sm.put('time_to_publish', instrumentationMetadata.timeTakenToPublish.toString());
		GCFCollector.recordUsageEvent('knowledge', 'knowledge_article_create', collectionEvent, sm);
	},

	type: 'KBInstrumentationSNC'
};
