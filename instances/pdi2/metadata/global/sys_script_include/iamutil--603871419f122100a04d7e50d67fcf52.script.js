var IAMUtil = Class.create();
IAMUtil.prototype = {
	onCall      : (pm.isRegistered('com.snc.on_call_rotation')) ? this.onCall = new OnCallRotation() : null,
	initialize: function() {
	},
	
	/**
	 * Determine if a given Incident record is source Incident for an Incident Alert record
	 *
	 * @param String sys_id of an Incident record to check for
	 *
	 * @return boolean
	 */
	isSourceIncident: function(sysId) {
		var iaCheck = new GlideRecord('incident_alert');
		iaCheck.addQuery('source_incident', sysId);
		iaCheck.query();
		
		if(iaCheck.hasNext()) {
			return true;
		}
		return false;
	},

	getAllIncidentAlertContacts: function (incidentAlertID) {
		return this._getIncidentAlertContacts(incidentAlertID)
			.concat(this._getIncidentAlertGroupContacts(incidentAlertID));
	},

	_getUserJson: function (user, userId) {
		if (user)
			return {
				user_id: user.sys_id + ''
			};
		else
			return {
				user_id: userId
			};
	},

	/**
     * Get all contacts (users) for an Incident Alert record
     *
     * @param incidentAlertID
     * @returns {Array}
     * @private
     */
    _getIncidentAlertContacts: function(incidentAlertID) {
        var contacts = [];

        // get (group) contacts for this incident alert
        var contact = new GlideRecordSecure('contact');
        contact.addQuery('table', 'incident_alert');
        contact.query('document', incidentAlertID);

        // iterate over (group) contacts
        while (contact.next()) {
            if (JSUtil.notNil(contact.user))
                contacts.push(this._getUserJson(contact.user));
        }

        return contacts;
    },

	 /**
     * Get all group contacts (on call resources for those groups)
     * for an Incident Alert Record
     *
     * @param incidentAlertID
     * @returns {Array}
     * @private
     */
    _getIncidentAlertGroupContacts: function(incidentAlertID) {
        var contacts = [];

        // get (group) contacts for this incident alert
        var contact = new GlideRecordSecure('contact');
        contact.addQuery('table', 'incident_alert');
        contact.query('document', incidentAlertID);

        // iterate over (group) contacts
        while (contact.next()) {
            if (JSUtil.nil(contact.user) && JSUtil.notNil(contact.group))
                contacts = contacts.concat(this._getOnCallResourcesForGroup(contact.group));
        }

        return contacts;
    },
	
	/**
     * Get all on call resources for a particular group
     *
     * @param group
     * @returns {Array}
     * @private
     */
    _getOnCallResourcesForGroup: function(group) {
        var contacts = [];

        // check if On Call Rotation is installed
        if (JSUtil.notNil(this.onCall) && this._groupHasRotas(group)) {
            // get the escalation plan
            var depth           = gs.getProperty("com.snc.iam.on_call_escalation_level", 2);
            var escalationPlan  = this.onCall.getEscalationPlan(group.sys_id, new GlideDateTime());
            var planSize        = escalationPlan.size();
            var displayPlanSize = ((depth == -1) || (depth >= planSize)) ? planSize : depth;

            // iterate over contacts in the escalation plan
            for (var i = 0; i < displayPlanSize; i++) {
                var contact = escalationPlan.get(i);
                //contacts.push(contact.userId);
                var level   = contact.order;
				var con = this._getUserJson(null, contact.userId + '');
                con.level = level;
                con.group_id = group + '';
                contacts.push(con);
            }
        }

        return contacts;
    },

	/**
     * Check if a group has On Call Rota's configured
     *
     * @param group
     * @returns {*}
     * @private
     */
    _groupHasRotas: function(group) {
        if (JSUtil.notNil(group)) {
            var rota = new GlideRecord('cmn_rota');
            rota.addActiveQuery();
            rota.query('group', group);
            return rota.next();
        }

        return false;
    },

	getIADefaultState: function() {
		if (gs.getProperty("com.snc.iam.new_state_flow", "false") == "true")
			return "open";
		else
			return gs.getProperty("com.snc.iam.pre_reparent.state.default", "new");
	},

	isNewPluginInstallation: function() {
		return (gs.getProperty("com.snc.iam.new_state_flow", "false") == "true");
	},

	type: 'IAMUtil'
};
