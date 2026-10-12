var ProminConfigACLUtilSNC = Class.create();
ProminConfigACLUtilSNC.prototype = {
    initialize: function(grProcessDef) {
        this.process_config_table = "promin_process_def";
        this.roles = {
            "admin": "sn_process_mining_admin",
            "powerUser": "sn_process_mining_power_user",
            "analyst": "sn_process_mining_analyst",
            "maint": "maint"
        };
        this.grProcessDef = grProcessDef;
    },

    canRead: function() {
        return true;
    },

    canCreate: function() {
        if (this.grProcessDef.content_pack) {
            return this._hasMaintUserRole();
        } else {
            return this._hasProminPowerUserRole();
        }
    },

    canWrite: function() {
        if (this.grProcessDef.content_pack) {
            return this._hasMaintUserRole();
        } else {
            return this._hasProminPowerUserRole();
        }
    },

    canDelete: function() {
        if (this.grProcessDef.content_pack) {
            return this._hasMaintUserRole();
        } else {
            return this._hasProminPowerUserRole();
        }
    },

    canCreateContentPack: function() {
        return this._hasMaintUserRole();
    },

    _hasProminPowerUserRole: function() {
        return gs.hasRole(this.roles.powerUser);
    },

    _hasProminAdminUserRole: function() {
        return gs.hasRole(this.roles.admin);
    },

    _hasProminAnalystUserRole: function() {
        return gs.hasRole(this.roles.analyst);
    },

    _hasMaintUserRole: function() {
        return gs.hasRole(this.roles.maint);
    },
    getProcessPermissions: function() {
        try {
            var gsm = new GlideSecurityManager();
            var gr_process_def = new GlideRecord('promin_process_def');
            var grClusteringDef = new GlideRecord('ml_capability_definition_clustering');
            return {
                canCreate: Boolean(this._hasProminPowerUserRole() && gsm.tableLevelACLAllow(gr_process_def, "create")),
                canDelete: Boolean(this._hasProminPowerUserRole() && gsm.tableLevelACLAllow(gr_process_def, "delete")),
                canRead: Boolean(this.canRead() && gsm.tableLevelACLAllow(gr_process_def, "read")),
                canWrite: Boolean(this._hasProminPowerUserRole() && gsm.tableLevelACLAllow(gr_process_def, "write")),
                canCreateContentPack: this._hasMaintUserRole(),
                canWriteContentPack: this._hasMaintUserRole(),
                canDeleteContentPack: this._hasMaintUserRole(),
                canReadClusteringDefinitions: Boolean(gsm.tableLevelACLAllow(grClusteringDef, 'read')),
            };
        } catch (err) {
            return {
                canCreate: false,
                canDelete: false,
                canRead: false,
                canWrite: false,
                canCreateContentPack: false,
                canWriteContentPack: false,
                canDeleteContentPack: false,
                canReadClusteringDefinitions: false,
            };
        }
    },

    type: 'ProminConfigACLUtilSNC'
};
