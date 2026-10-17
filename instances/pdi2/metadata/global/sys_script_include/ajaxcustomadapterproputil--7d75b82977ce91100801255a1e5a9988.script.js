var AJAXCustomAdapterPropUtil = Class.create();
AJAXCustomAdapterPropUtil.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    /*
     * Check whether there is missing custom adapter property for SMS Twilio Adapter
     */
    checkCustomAdapterProperties: function() {

        var propertiesToCheck = ['verification_question_id'];

        var providerScope = this.getParameter("provider_scope");
        var accountLinkType = this.getParameter("account_link_type");
        var messages = [];

        if (accountLinkType.equals('QnA_and_mfa')) {
            propertiesToCheck.push('two_factor_methods');
            propertiesToCheck.push('mfa_question_id');
        }

        var propertyMap = {};

        for (var ind = 0; ind < propertiesToCheck.length; ind++) {
            propertyMap[propertiesToCheck[ind]] = 0;
        }

        var propGR = new GlideRecordSecure("sys_cs_custom_adapter_property");
        propGR.addQuery("sys_scope", providerScope);
        propGR.addNotNullQuery("value");
        propGR.query();

        while (propGR.next()) {
            var name = propGR.getValue("name");
            name = name.toLowerCase();

            if (propertyMap[name] >= 0) {
                propertyMap[name]++;
            }

            if (accountLinkType.equals('QnA_and_mfa') && name.equals('two_factor_methods')) {
                var value = propGR.getValue("value");
                value = value.toLowerCase();
                if (!value.equals('sms') && !value.equals('google_authenticator')) {
                    messages.push(gs.getMessage("Invalid value for \"two_factor_methods\" in \"Provider Properties\" section, supported values are: sms or google_authenticator"));
                }
            }

        }

        var missingProperties = [];
        for (var i = 0; i < propertiesToCheck.length; i++) {
            if (propertyMap[propertiesToCheck[i]] > 0)
                continue;

            missingProperties.push(propertiesToCheck[i]);
        }

        if (missingProperties.length > 0) {
            messages.push(gs.getMessage("Please populate missing property(s) in \"Provider Properties\" section: {0}", missingProperties.join(", ")));
        }

        return JSON.stringify(messages);
    },

    type: 'AJAXCustomAdapterPropUtil'
});
