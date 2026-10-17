/**
 * Provides debug logging for development. Allows setting conditions and conditional logging.
 */
var Debug = {
	_conditions: {},
	
	/**
	 * @param string The name of the condition to check.
	 * @param string topic|msg The topic if msg is provided, otherwise the message.
	 * @param string|undefined msg The message
	 */
	log: function(topic, msg) {
		if (typeof msg !== 'undefined')
			gs.log('[' + new Date().getTime() + '] ' + topic + ': ' + msg, 'Debug');
		else
			gs.log('[' + new Date().getTime() + '] ' + topic, 'Debug');
	},
	
	logObject: function(topic, o) {
		this._logObject(topic, o, true);
	},
	
	logShallowObject: function(topic, o) {
		this._logObject(topic, o, false);
	},
	
	describeObject: function(o, isDeep) {
		var desc = [];
		JSUtil._describeObject(o, null, '  ', ( isDeep ? 0 : 24 ), desc);
		desc = desc.join('\n');
		return desc;
	},
	
	_logObject: function(topic, o, isDeep) {
		o = ( typeof o === 'undefined' ? topic : o );
		var desc = this.describeObject(o, isDeep);
		
		if (o !== topic)
			gs.log('[' + new Date().getTime() + '] ' + topic + ': ' + desc, 'Debug');
		else
			gs.log('[' + new Date().getTime() + '] ' + desc, 'Debug');
	},	
	
	/**
	 * @param string The name of the condition to check.
	 * @param string topic|msg The topic if msg is provided, otherwise the message.
	 * @param string|undefined msg The message
	 */
	logFor: function(condition, topic, msg) {
		if (typeof Debug._conditions[condition] !== 'undefined')
			Debug.log(topic, msg);
	},
	
	logObjectFor: function(condition, topic, o) {
		if (typeof Debug._conditions[condition] !== 'undefined')
			Debug.logObject(topic, o);
	},
	
	/**
	 * Enables/Disables a condition.
	 * @param string condition
	 * @param boolean active TRUE if active, FALSE otherwise.
	 */
	toggle: function(condition, active) {
		if (active) {
			Debug._conditions[condition] = true;
		} else if (typeof Debug._conditions[condition] !== 'undefined') {
			delete Debug._conditions[condition];
		}
	},
};
