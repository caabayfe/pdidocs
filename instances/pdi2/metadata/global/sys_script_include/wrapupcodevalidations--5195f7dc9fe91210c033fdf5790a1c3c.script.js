var WrapUpCodeValidations = Class.create();
WrapUpCodeValidations.prototype = {
    initialize: function() {},

    isWrapUpCodeReferencedInConfiguration: function(wrapUpCodeSysId) {
        var configurationGR = new GlideRecord("interaction_wrap_up_configuration");
        configurationGR.addQuery("active", true);
		configurationGR.addQuery("enable_codes", true);
        configurationGR.query();

        while (configurationGR.next()) {
            var allowedCodes = configurationGR.getValue("allowed_codes");
            var defaultCode = configurationGR.getValue("default_code");

            if ((allowedCodes && allowedCodes.includes(wrapUpCodeSysId)) || (defaultCode && defaultCode.equals(wrapUpCodeSysId)))
                return true;

        }
        return false;
    },

    isWrapUpCodeReferencedInSegment: function(wrapUpCodeSysId) {
        var segmentGR = new GlideRecord("interaction_wrap_up_segment");
        segmentGR.addQuery("wrap_up_code",  wrapUpCodeSysId);
        segmentGR.addQuery("active",  true);
        segmentGR.query();
        if (segmentGR.next())
            return true;

        return false;
    },

    doesCodeValueExist: function(wrapUpCodeSysId, wrapUpCode) {
        var codeGR = new GlideRecord("interaction_wrap_up_code");
		codeGR.addQuery("sys_id", "!=", wrapUpCodeSysId);
        codeGR.addQuery("code", wrapUpCode);
		codeGR.addQuery("active" , true);
        codeGR.query();
        if (codeGR.next())
            return true;

        return false;
    },

    type: "WrapUpCodeValidations"
};
