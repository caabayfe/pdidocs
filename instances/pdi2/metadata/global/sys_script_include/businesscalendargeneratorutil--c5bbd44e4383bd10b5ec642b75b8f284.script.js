var BusinessCalendarGeneratorUtil = Class.create();
BusinessCalendarGeneratorUtil.prototype = {
    initialize: function() {
    },
	// creates new business calendar span and span name entries
	newSpan: function(calendarId, spanName, start, end) {
		return new global.GregorianCalendarGenerator()._newSpan(calendarId, spanName, start, end);
	},

	// creates new business calendar span name entry
	createSpanName: function(calendarId, longName, shortName) {
		return new global.GregorianCalendarGenerator()._createSpanName(calendarId, longName, shortName);
	},
	spanExists: function(aCalendarSysId, start, end){
		return new global.GregorianCalendarGenerator()._spanExists(aCalendarSysId, start, end);
	},

    type: 'BusinessCalendarGeneratorUtil'
};
