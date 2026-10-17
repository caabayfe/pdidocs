var MajorIncidentTriggerRulesSNC = Class.create();

MajorIncidentTriggerRulesSNC.prototype = {
	ROLE_MIM_GRANULAR_ADMIN: 'sn_major_inc_mgmt.sn_mim_admin',
	ROLE_MAJOR_INCIDENT_MANAGER: "major_incident_manager",
	ROLE_ITIL: 'itil',
	ROLE_INCIDENT_WRITE: 'sn_incident_write',
	PROP_MAJOR_INCIDENT_CREATION: "sn_major_inc_mgmt.com.snc.incident.mim.major_incident_creation",
	PROP_MAJOR_INCIDENT_COPY_ATTR: 'sn_major_inc_mgmt.com.snc.major_incident.create.copy.attributes',
	MAJOR_INCIDENT_CREATION: {
		CREATE_NEW: 'create_new',
		PROMOTE: 'promote',
	},
	TABLE_MIM_TRIGGER_RULE: 'major_incident_trigger_rule',
	ATTR_NAME: 'name',
	ATTR_ACTIVE: 'active',
	ATTR_EXECUTION_ORDER: 'order',
	ATTR_STATE: 'state',
	ATTR_TABLE_NAME: 'incident',
	ATTR_TRIGGER_CONDITIONS: 'conditions',
	ATTR_WORKFLOW: 'workflow',
	ATTR_INCIDENT_WORK_NOTES: 'work_notes',
	ATTR_MAJOR_INCIDENT_STATE: 'major_incident_state',
	ATTR_ASSIGNED_TO: 'assigned_to',
	ATTR_ASSIGNMENT_GROUP: 'assignment_group',
	ATTR_ORIGIN_TABLE: 'origin_table',
	ATTR_ORIGIN_ID: 'origin_id',
	ATTR_ACTION: 'action',
	MIM_ASSIGNMENT_GROUP_SYS_ID: gs.getProperty("sn_major_inc_mgmt.major_incident_management_group"),
	MAJOR_INCIDENT_STATE: {
		PROPOSED: 'proposed',
		ACCEPTED: 'accepted',
		REJECTED: 'rejected',
		CANCELED: 'canceled'
	},
	ACTIONS: {
		PROPOSE: 'propose',
		PROMOTE: 'promote'
	},

    initialize: function(gr) {
		this._gr = gr;
		this.incidentState = global.IncidentState;
    },
	_getLink: function (gr) {
		var a = '<a href="' + gr.getLink(true) + '">' + gr.getDisplayValue('number') + '</a>';
		return a;
	},
	canEvaluate: function() {

		if(gs.nil(this._gr))
			return false;

		if(this._gr.getTableName() != this.ATTR_TABLE_NAME)
			return false;

		// Only evaluate rules when incident is not yet accepted, rejected or canceled as a major incident.
		if (!gs.nil(this._gr.major_incident_state) && this._gr.major_incident_state != this.MAJOR_INCIDENT_STATE.PROPOSED)
			return false;

		// Only evaluate rules when incident is not a child of another incident.
		if(!gs.nil(this._gr.parent_incident))
			return false;
		return true;
	},

	evaluateRules: function() {
		if(!this.canEvaluate())
			return;

		var mimTriggerRulesGr = new GlideRecord(this.TABLE_MIM_TRIGGER_RULE);
		mimTriggerRulesGr.addActiveQuery();
		mimTriggerRulesGr.orderBy(this.ATTR_EXECUTION_ORDER);
		mimTriggerRulesGr.query();

		var matches = false;

		while (mimTriggerRulesGr.next()) {

			if (mimTriggerRulesGr.getValue(this.ATTR_TRIGGER_CONDITIONS)){
				var incidentUtils = new global.IncidentUtils();
				matches = incidentUtils.majorIncidentFilterCheck(this._gr, mimTriggerRulesGr.getValue(this.ATTR_TRIGGER_CONDITIONS));
			}
			/* TODO not required now , but in future we need to evaluate this.
			 if(!matches && mimTriggerRulesGr.advanced) {
				var evaluator = new GlideScopedEvaluator();
				evaluator.putVariable("current", this._gr);
				evaluator.putVariable("rule", mimTriggerRulesGr);
				matches = evaluator.evaluateScript(mimTriggerRulesGr, "script", null);
			}*/

			if (matches) {
				this.onRuleMatch(mimTriggerRulesGr);
				break;
			}
		}
	},

	onRuleMatch: function(mimTriggerRulesGr) {
		if ((this._gr.major_incident_state == this.MAJOR_INCIDENT_STATE.PROPOSED) && ((mimTriggerRulesGr.getValue(this.ATTR_ACTION) == this.ACTIONS.PROPOSE) || (gs.nil(mimTriggerRulesGr.getValue(this.ATTR_ACTION)))))
			return;
		else {
			if (mimTriggerRulesGr.getValue(this.ATTR_ACTION) == this.ACTIONS.PROMOTE) {
				if (this._canPromoteMICForTriggerRules()) {
					this._gr[this.ATTR_INCIDENT_WORK_NOTES] = gs.getMessage("Promoted as a Major Incident as one of the Major Incident Rules has matched: {0}", mimTriggerRulesGr.getDisplayValue());
					this._gr.setValue(this.ATTR_MAJOR_INCIDENT_STATE, this.MAJOR_INCIDENT_STATE.ACCEPTED);
					this._gr.trigger_rule = mimTriggerRulesGr.getUniqueValue();
					this._gr.update();
				} else if (this.canCreateNewMajorIncident())
					this.createParentIncidentFromMIC();
			} else {
				this._gr[this.ATTR_INCIDENT_WORK_NOTES] = gs.getMessage("Proposed as a Major Incident as one of the Major Incident Rules has matched: {0}", mimTriggerRulesGr.getDisplayValue());
				this._gr.setValue(this.ATTR_MAJOR_INCIDENT_STATE, this.MAJOR_INCIDENT_STATE.PROPOSED);
				this._gr.trigger_rule = mimTriggerRulesGr.getUniqueValue();
				this._gr.update();
			}
		}
	},

	isMIC: function() {
		return this._gr.major_incident_state == this.MAJOR_INCIDENT_STATE.PROPOSED;
	},

	isIncidentInactive: function() {
		return ((this._gr[this.ATTR_STATE] == this.incidentState.RESOLVED) || (this._gr[this.ATTR_STATE] == this.incidentState.CLOSED) || (this._gr[this.ATTR_STATE] == this.incidentState.CANCELED));

	},

	canProposeMIC: function() {

		if(!gs.hasRole(this.ROLE_ITIL + ',' + this.ROLE_INCIDENT_WRITE) || this.isIncidentInactive())
			return false;

		// A child incident cannot be proposed as a major incident candidate
		if(this._gr.parent_incident)
			return false;

		// An incident can be proposed as a major incident manually, only if it is not already proposed and not already accepted as a major incident.
		// If an incident was rejected or canceled as major incident, user can again propose as a major incident based on new justification.
		return gs.nil(this._gr[this.ATTR_MAJOR_INCIDENT_STATE]) || this._gr[this.ATTR_MAJOR_INCIDENT_STATE] == this.MAJOR_INCIDENT_STATE.REJECTED || this._gr[this.ATTR_MAJOR_INCIDENT_STATE] == this.MAJOR_INCIDENT_STATE.CANCELED;
	},

	canApproveMIC: function() {

		if(!gs.hasRole(this.ROLE_MAJOR_INCIDENT_MANAGER) || this.isIncidentInactive())
			return false;

		// A child incident cannot be promoted as a major incident
		if(this._gr.parent_incident)
			return false;

		return (this._gr[this.ATTR_MAJOR_INCIDENT_STATE] != this.MAJOR_INCIDENT_STATE.ACCEPTED);
	},

	_canApproveMICForTriggerRules: function() {

		if(this.isIncidentInactive())
			return false;

		// A child incident cannot be promoted as a major incident
		if(this._gr.parent_incident)
			return false;

		return (this._gr[this.ATTR_MAJOR_INCIDENT_STATE] != this.MAJOR_INCIDENT_STATE.ACCEPTED);
	},

	canRejectMIC: function() {

		if(!gs.hasRole(this.ROLE_MAJOR_INCIDENT_MANAGER) || this.isIncidentInactive())
			return false;

		return this._gr[this.ATTR_MAJOR_INCIDENT_STATE] == this.MAJOR_INCIDENT_STATE.PROPOSED;
	},

	canDemoteMI: function() {
		if(!gs.hasRole(this.ROLE_MAJOR_INCIDENT_MANAGER) || this.isIncidentInactive())
			return false;
		return this._gr[this.ATTR_MAJOR_INCIDENT_STATE] == this.MAJOR_INCIDENT_STATE.ACCEPTED;
	},

	proposeMIC: function() {
		this._gr[this.ATTR_MAJOR_INCIDENT_STATE] = this.MAJOR_INCIDENT_STATE.PROPOSED;
		this._gr[this.ATTR_INCIDENT_WORK_NOTES] =  gs.getMessage("Proposed as major incident candidate");
		this._gr.update();
		gs.addInfoMessage(gs.getMessage('{0} has been proposed as major incident candidate', this._gr.getDisplayValue()));
	},

	approveMIC: function() {
		if(!gs.hasRole(this.ROLE_MAJOR_INCIDENT_MANAGER))
			return;
		this._gr[this.ATTR_MAJOR_INCIDENT_STATE] = this.MAJOR_INCIDENT_STATE.ACCEPTED;
		this._gr.update();
		gs.addInfoMessage(gs.getMessage('{0} has been promoted to a major incident', this._gr.getDisplayValue()));
	},

	rejectMIC: function(rejectionReason) {
		if(!gs.hasRole(this.ROLE_MAJOR_INCIDENT_MANAGER))
			return;
		this._gr[this.ATTR_MAJOR_INCIDENT_STATE] = this.MAJOR_INCIDENT_STATE.REJECTED;
		if(rejectionReason)
			this._gr[this.ATTR_INCIDENT_WORK_NOTES] = gs.getMessage("Rejected as major incident candidate") + "\n" + rejectionReason;
		else
			this._gr[this.ATTR_INCIDENT_WORK_NOTES] = gs.getMessage("Rejected as major incident candidate");
		this._gr.update();
		gs.addInfoMessage(gs.getMessage('{0} has been rejected as major incident candidate', this._gr.getDisplayValue()));
	},

	demoteMI: function(demoteReason){
		if(!gs.hasRole(this.ROLE_MAJOR_INCIDENT_MANAGER))
			return;
		this._gr[this.ATTR_MAJOR_INCIDENT_STATE] = this.MAJOR_INCIDENT_STATE.CANCELED;
		if(demoteReason)
			this._gr[this.ATTR_INCIDENT_WORK_NOTES] =  gs.getMessage("Demoted from major incident") + "\n" + demoteReason;
		else
			this._gr[this.ATTR_INCIDENT_WORK_NOTES] =  gs.getMessage("Demoted from major incident");
		this._gr.update();
		gs.addInfoMessage(gs.getMessage('{0} is no longer a major incident', this._gr.getDisplayValue()));
	},

	isMajorIncident: function() {

		return this._gr[this.ATTR_MAJOR_INCIDENT_STATE] == this.MAJOR_INCIDENT_STATE.ACCEPTED;
	},
	
	createParentIncidentFromMIC: function() {
		var newGr = new GlideRecord(this.ATTR_TABLE_NAME);
		var fieldsToCopyPropVal = gs.getProperty(this.PROP_MAJOR_INCIDENT_COPY_ATTR, '');
		var fieldsToCopy = fieldsToCopyPropVal.split(',');

		for (var i = 0; i < fieldsToCopy.length; i++) {
			var field = (fieldsToCopy[i] + '').trim();
			if (this._gr.isValidField(field))
				newGr[field] = this._gr[field];
		}
		newGr[this.ATTR_ORIGIN_TABLE] = this.ATTR_TABLE_NAME;
		newGr[this.ATTR_ORIGIN_ID] = this._gr.getUniqueValue();
		newGr[this.ATTR_MAJOR_INCIDENT_STATE] = this.MAJOR_INCIDENT_STATE.ACCEPTED;
		if(newGr.insert()) {
			gs.addInfoMessage(gs.getMessage('New major incident {0} has been created and {1} has been added as child.', [newGr.getDisplayValue(), (this._gr).getDisplayValue()]));
			this.addAsChildToMajorIncident(newGr);
		}

		return newGr;

	},

	addAsChildToMajorIncident: function(majorIncidentGr) {
		if(!majorIncidentGr)
			return;

		this._gr.parent_incident = majorIncidentGr.getUniqueValue();
		this._gr[this.ATTR_MAJOR_INCIDENT_STATE] = "NULL";
		this._gr.update();
	},

	canCreateNewMajorIncident: function() {
		return this.canApproveMIC() && (gs.getProperty(this.PROP_MAJOR_INCIDENT_CREATION, this.MAJOR_INCIDENT_CREATION.CREATE_NEW) == this.MAJOR_INCIDENT_CREATION.CREATE_NEW);
	},

	canPromoteMIC: function() {
		return this.canApproveMIC() && (gs.getProperty(this.PROP_MAJOR_INCIDENT_CREATION, this.MAJOR_INCIDENT_CREATION.CREATE_NEW) == this.MAJOR_INCIDENT_CREATION.PROMOTE);
	},

	_canPromoteMICForTriggerRules: function() {
		return this._canApproveMICForTriggerRules() && (gs.getProperty(this.PROP_MAJOR_INCIDENT_CREATION, this.MAJOR_INCIDENT_CREATION.CREATE_NEW) == this.MAJOR_INCIDENT_CREATION.PROMOTE);
	},

	canLinkToMajorincident: function() {
		if (this.isMajorIncident())
			return false;
		if (gs.hasRole(this.ROLE_MIM_GRANULAR_ADMIN))
			return true;
		if (this._gr.state == this.incidentState.CLOSED)
			return false;
		if (this._gr.state == this.incidentState.CANCELED) {
			if (this._gr.opened_by == gs.getUserID())
				return true;
			else
				return false;
		}
		return true;
	},

	type: 'MajorIncidentTriggerRulesSNC'
};
