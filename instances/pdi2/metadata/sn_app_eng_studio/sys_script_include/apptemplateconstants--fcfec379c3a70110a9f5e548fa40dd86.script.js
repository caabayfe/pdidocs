var AppTemplateConstants = Class.create();
AppTemplateConstants.prototype = {
    initialize: function() {},

    getTypeBasedOnAppTemplateSharingEventName: function() {
        return {
            'app_template.shared': 'SHARED',
            'app_template.unshared': 'REVOKED',
            'app_template.deactivated': 'DEACTIVATED'
        };
    },

    getEmailEvents: function() {
        return {
            SHARED: 'sn_app_eng_studio.app_template.shared',
            REVOKED: 'sn_app_eng_studio.app_template.unshared',
            DEACTIVATED: 'sn_app_eng_studio.app_template.deactivat'
        };
    },

    type: 'AppTemplateConstants'
};
