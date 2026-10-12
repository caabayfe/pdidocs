var SOWIncidentImpactSNC = Class.create();
SOWIncidentImpactSNC.prototype = {

    TABLES: {
        INCIDENT: "incident"
    },

    FIELDS: {
        SYS_ID: "sys_id",
        PRIORITY: "priority",
        PARENT_INCIDENT: "parent_incident",
        CALLER_ID: "caller_id"
    },

    FIELD_VALUES: {
        PRIORITY_FOUR: 4
    },

    IMPACTED_USER_SOURCES: {
        CALLER: {
            active: true,
            fn: "_getCallers"
        },
        SPM: {
            active: true,
            fn: "_getSPMSubscribedUsers"
        }
    },

    initialize: function() {
        this.impactUitls = new SowIncidentImpactUtils();
        this.sowSPMSubscriptionUtils = new SOWSPMSubscriptionUtils();
    },

    getImpactDetails: function(sysIdOrGr) {
        this._incGr = this.impactUitls.getGlideRecord(this.TABLES.INCIDENT, sysIdOrGr);
        if (!this.impactUitls.isValidGr(this._incGr)) {
            gs.error("[SOWIncidentImpact]: Provide either the GlideRecord reference or sys_id of the incident record");
            return;
        }
        this._incSysId = this._incGr.getUniqueValue();
        var impactedUsers = this._getImpactedUsers();
        return {
            impactedUsers: impactedUsers,
            impactedUsersCount: impactedUsers.length,
            impactedLocationsCount: this._getImpactedLocations().length
        };
    },
    _getImpactedUsers: function() {
        this.impactedUsers = [];
        for (var source in this.IMPACTED_USER_SOURCES) {
            if (this.IMPACTED_USER_SOURCES.hasOwnProperty(source) && this.IMPACTED_USER_SOURCES[source].active && this.IMPACTED_USER_SOURCES[source].fn)
                this.impactUitls.mergeArrays(this.impactedUsers, this[this.IMPACTED_USER_SOURCES[source].fn]());
        }
        return this.impactUitls.removeDuplicates(this.impactedUsers);
    },
    _getCallers: function() {
        var callers = [];
        var gr = new GlideRecord(this.TABLES.INCIDENT);
        gr.addQuery(this.FIELDS.SYS_ID, this._incSysId)
            .addOrCondition(this.FIELDS.PARENT_INCIDENT, this._incSysId);
        gr.query();
        while (gr.next()) {
            var caller = gr.getValue(this.FIELDS.CALLER_ID);
            if (!gs.nil(caller))
                callers.push(caller);
        }
        return callers;
    },
    _getSPMSubscribedUsers: function() {
        var subscribedUsers = [];
        if (this.sowSPMSubscriptionUtils.isSpmPluginInstalled) {
            var serviceOffertings = this.impactUitls.getIncidentServiceOfferings(this._incSysId);
            if (serviceOffertings.length > 0)
                subscribedUsers = this.sowSPMSubscriptionUtils.getTotalSubscribedUsers(serviceOffertings);
        }
        return subscribedUsers;
    },
    _getImpactedLocations: function() {
        this.impactedLocations = [];
        var impactedUsersLocations = this.impactUitls.getUsersLocations(this.impactedUsers);
        this.impactUitls.mergeArrays(this.impactedLocations, impactedUsersLocations);
        return this.impactedLocations;
    },

    type: "SOWIncidentImpactSNC"
};
