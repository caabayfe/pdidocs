var RTBIReportUtils = Class.create();
RTBIReportUtils.prototype = Object.extendsObject(RTBIReportUtilsSNC, {

	initialize: function() {
		RTBIReportUtilsSNC.prototype.initialize.apply(this, arguments);
	},
     
     type: 'RTBIReportUtils'
});
