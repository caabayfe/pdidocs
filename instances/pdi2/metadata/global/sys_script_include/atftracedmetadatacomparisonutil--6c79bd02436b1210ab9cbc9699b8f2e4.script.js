var ATFTracedMetadataComparisonUtil = Class.create();
ATFTracedMetadataComparisonUtil.prototype = {
    initialize: function() {},

    hasValidUpdateVersion(whatChangeSysId) {
        var what_changed = new GlideRecord("sys_atf_what_changed");

        what_changed.get(whatChangeSysId);

        var test_result = new GlideRecord("sys_atf_test_result");
        test_result.get(what_changed.getValue("sys_atf_test_result"));

        var previous_test_result = new GlideRecord("sys_atf_test_result");
        previous_test_result.get(what_changed.getValue("previous_test_result"));

        var metadata = new GlideRecord("sys_metadata");
        metadata.get(what_changed.getValue("application_file"));

        var version = new GlideRecord("sys_update_version");
        version.addQuery("name", metadata.sys_update_name);
        version.addQuery("sys_created_on", "<", previous_test_result.sys_created_on);
        version.addQuery("state", "!=", "current");
        version.orderByDesc("sys_recorded_at");
        version.setLimit(1);
        version.query();
        if (!version.next())
			return false;

        var version2 = new GlideRecord("sys_update_version");
        version2.addQuery("name", metadata.sys_update_name);
        version2.addQuery("sys_created_on", "<", test_result.sys_created_on);

        version2.orderByDesc("sys_recorded_at");
        version2.setLimit(1);
        version2.query();
        if (!version2.next())
			return false;
		
		return true;
    },

    type: 'ATFTracedMetadataComparisonUtil'
};
