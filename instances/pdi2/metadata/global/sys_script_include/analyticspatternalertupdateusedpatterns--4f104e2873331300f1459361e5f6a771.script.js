gs.include('EvtMgmtCommons');
gs.include('SlowStepJSManager');

var AnalyticsPatternAlertUpdateUsedPatterns = Class.create();
AnalyticsPatternAlertUpdateUsedPatterns.prototype = {
    initialize: function() {
		this.isPatternHistoryEnabled = gs.getProperty('sa_analytics.agg.learner_pattern_history_enabled', 'true') === 'true';
		// Dependencies
		this.evtMgmtCommons  = new EvtMgmtCommons();
		// Slow steps
		this.slowStepsManager = new SlowStepJSManager(); 
		var prefix = "Service_Analytics_Pattern_Alert_Slow_Steps ";
		var isSlowStepOn = gs.getProperty("enable_analytics_pattern_alert_slow_steps","true") === 'true';
		this.slowStepsManager.initialize(prefix, isSlowStepOn);
		
		// Local constants
		this.endTime = '';
		this.SECONDS_BACK_DELAY = gs.getProperty('sa_analytics.agg.pattern_alert_delay', '5');
		this.LAST_SCANNED_PATTERN_TIME = 'last_scanned_pattern_time';
		
		// Tables constants
		this.HASH_TABLE = 'sa_hash';
		this.GROUP_PATTERN_TABLE = 'sa_agg_group_pattern';
		this.PATTERN_ALERT_TABLE = 'sa_agg_pattern_alert';
    },

    type: 'AnalyticsPatternAlertUpdateUsedPatterns',
	
	// Main function: Execute the update process
	updateUsedPatternProcess: function() {
		if (!this.isPatternHistoryEnabled) {
			return;
		}
		this.slowStepsManager.setTopic("Service Analytics: Pattern Alert");
		this.slowStepsManager.startStep('1: Get time of last scanned pattern from sa_hash or create if its missing');
		var lastScannedPatternTime = this.getLastScannedPatternTime();
		this.slowStepsManager.startStep('2: Get all unscanned patterns from last scanned time');
		var unscannedPatterns = this.getUnscannedPatterns(lastScannedPatternTime);
		this.slowStepsManager.startStep('3: Set used patterns');
		this.setUsedPatternAlert(unscannedPatterns);
		this.slowStepsManager.startStep('4: Update sa_hash with new time');
		this.updateHash();
		this.slowStepsManager.report();
	},
	
	// Returns the time of the last scanned pattern, derived from sa_hash table
	getLastScannedPatternTime: function() {
		var hashGr = this.evtMgmtCommons.getHashGr(this.LAST_SCANNED_PATTERN_TIME);
		if (!(hashGr.next())) {
			// Create scan hash because it was never scanned before
			this.createHashTimestamp(hashGr);
			hashGr = this.evtMgmtCommons.getHashGr(this.LAST_SCANNED_PATTERN_TIME);
			hashGr.next();
		}
		return hashGr.getValue('hash'); // Return the last known hash
	},
	
	// Returns GR of all patterns that their update time is after the given time
	getUnscannedPatterns: function(lastScannedPatternTime) {
		var gt = new GlideTime(1000 * this.SECONDS_BACK_DELAY);
		this.endTime = new GlideDateTime();
		this.endTime.subtract(gt);
		
		var agg = new GlideAggregate(this.GROUP_PATTERN_TABLE);
		agg.addQuery('sys_updated_on', '>=', lastScannedPatternTime); // From last scanned pattern and newer
		agg.addQuery('sys_updated_on', '<', this.endTime);
		agg.groupBy('pattern_id');
		agg.query();
		return agg;
	},
	
	// Marks patterns in pattern_alert table as used for given patterns
	setUsedPatternAlert: function(patternsGR) {
		this.slowStepsManager.startStep('3.1.START: Find each pattern and if its field value of is_in_use=0 then update it to is_in_use=1');
		while (patternsGR.next()) {
			var patternId = patternsGR.getValue('pattern_id');
			this.updateUsedPattern(patternId);
		}
		this.slowStepsManager.startStep('3.1.END: Find each pattern and if its field value of is_in_use=0 then update it to is_in_use=1');
	},
	
	// Adds the "last_scanned_pattern_time" hash to sa_hash table
	createHashTimestamp: function(hashGr) {
		hashGr.name = this.LAST_SCANNED_PATTERN_TIME;
		hashGr.hash = new GlideDateTime();
		hashGr.insert();
	},
	
	// Sets the "is_in_use" field to "1" for all the records in sa_agg_pattern_alert that are referenced by the given pattern ID
	updateUsedPattern: function(patternId) {
		this.slowStepsManager.startStep('3.1.1.: Query unused patterns (is_in_use = 0)');
		var gr = new GlideRecord(this.PATTERN_ALERT_TABLE);
		gr.addQuery('pattern_id', '=', patternId);
		gr.setLimit(1);
		gr.query();
		if (gr.next() && gr.getValue('is_in_use') == '0') {
			this.slowStepsManager.startStep('3.1.2.: Set used patterns (is_in_use = 1)');
			gr = new GlideRecord(this.PATTERN_ALERT_TABLE);
			gr.addQuery('pattern_id', '=', patternId);
			gr.setValue('is_in_use', '1');
			gr.updateMultiple();
		}
	},
	
	// Updates the Hash to current time
	updateHash: function() {
		var hashGr = this.evtMgmtCommons.getHashGr(this.LAST_SCANNED_PATTERN_TIME);
		hashGr.next();
		hashGr.hash = this.endTime;
		hashGr.update();
	}
};
