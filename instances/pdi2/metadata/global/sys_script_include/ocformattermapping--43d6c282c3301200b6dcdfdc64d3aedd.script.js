var OCFormatterMapping = Class.create();
OCFormatterMapping.formatters = {'fullcalendar' : OCFullCalendarFormatter, 'dhtmlx' : OCDHTMLXCalendarFormatter};
OCFormatterMapping.prototype = {
	initialize: function() {
	},
	
	type: 'OCFormatterMapping'
};
