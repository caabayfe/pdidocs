var ImportantActionAdminAJAXUtils = Class.create();
ImportantActionAdminAJAXUtils.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {

	testSetupRecord: function () {
		var setupID = this.getParameter('sysparm_setup_id');

		var setupGr = new GlideRecordSecure('sn_itam_recomm_setup');
		setupGr.get(setupID);

		if (!setupGr.isValidRecord()) { return null; }

		return (new sn_itam_recomm.ImportantActionUtils().testSetupRecord(setupGr));
	},

	type: 'ImportantActionAdminAJAXUtils',
});
