var ACEAccessValidator = Class.create();
ACEAccessValidator.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {

    hasMaintRole: function() {
        if (gs.hasRole("maint")) {
            return true;
        }

        return false;
    },


    getContentBlocksSysId: function(current) {
        if (this.hasMaintRole() || this.isExperienceWhiteListed(current.ace_config)) {
            return;
        }
        return current.sys_id;
    },

    getAceAppConfigSysId: function(current) {
        if (this.hasMaintRole() || this.isExperienceWhiteListed(current.sys_id)) {
            return;
        }
        return current.sys_id;

    },

    getAcePageSysId: function(current) {
        if (this.hasMaintRole() || this.isExperienceWhiteListed(current.ace_app)) {
            return;
        }
        return current.sys_id;

    },

    getAceContentBlockTypeSysId: function(current) {
        if (this.hasMaintRole() || this.isExperienceWhiteListed(current.ace_app)) {
            return;
        } else if (!current.ace_app) { // if Ace app id is not available allow it (for older content block type)
            return;
        }
        return current.sys_id;

    },

    isExperienceAccessible: function(sys_id) {
        if (this.hasMaintRole() || this.isExperienceWhiteListed(sys_id)) {
            return true;
        }
        return false;

    },

    isExperienceWhiteListed: function(sys_id) {
        var whiteListedExperiences = gs.getProperty('sn_ace.ace-whitelisted-experiences','').split(",");
        for (var i = 0; i < whiteListedExperiences.length; i++) {
            if (whiteListedExperiences[i] == sys_id) {
                return true;
            }
        }
        return false;

    },

    type: 'ACEAccessValidator'
});
