var OnCallMemberUtilsAjaxSNC = Class.create();
OnCallMemberUtilsAjaxSNC.prototype = Object.extendsObject(AbstractAjaxProcessor, {

	initialize: function(request, responseXML, gc) {
		AbstractAjaxProcessor.prototype.initialize.call(this, request, responseXML, gc);
	},

	getRefQualByRoster: function() {
		var roster = this.getParameter('roster_sys_id');
		var fromDate = this.getParameter('from_date');
		return new OnCallMemberUtils().getRefQualByRoster(roster, fromDate);
	},

	getNonMembersRefQualByRoster: function() {
		var roster = this.getParameter('roster_sys_id');
		var fromDate = this.getParameter('from_date');
		return new OnCallMemberUtils().getNonMembersRefQualByRoster(roster, fromDate);
	},

    type: 'OnCallMemberUtilsAjaxSNC'
});
