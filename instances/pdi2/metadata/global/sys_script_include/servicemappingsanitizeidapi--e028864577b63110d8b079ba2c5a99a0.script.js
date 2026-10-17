var ServiceMappingSanitizeIdAPI = Class.create();
ServiceMappingSanitizeIdAPI.prototype = {
	initialize: function() {
		this.VALID_SYS_ID_REGEX = /^[0-9a-f]{32}$/;
    },
	//passes only valid sys_id format, otherwise '-1'
    sanitizeIdString: function(sysId) {
        var val = String(sysId || '');
        return (val.length === 32 && this.VALID_SYS_ID_REGEX.test(val)) ? val : '-1';
    },

    type: 'ServiceMappingSanitizeIdAPI'
};
