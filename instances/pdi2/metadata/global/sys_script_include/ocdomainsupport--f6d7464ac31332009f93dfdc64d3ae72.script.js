var OCDomainSupport = Class.create();

OCDomainSupport.prototype = {

	CMN_ROTA: "cmn_rota",
	CMN_ROTA_MEMBER: "cmn_rota_member",
	CMN_ROTA_ROSTER: "cmn_rota_roster",
	CMN_ROTA_ESC_STEP_DEF: "cmn_rota_esc_step_def",
	CMN_ROTA_ESCALATION_SET: "cmn_rota_escalation_set",
	PLUGIN_ID: "com.snc.on_call_rotation",
	ROSTER: "roster",
	ROSTER_SCHEDULE_SPAN: "roster_schedule_span",
	ROTA: "rota",
	ROTA_LEVEL: "com.snc.on_call_rotation.log.level",
	SCHEDULE: "schedule",
	ESCALATION_SET: "escalation_set",
	UPDATE_MEMBER: "update.domain_cmn_rota_member",
	UPDATE_ROSTER: "update.domain_cmn_rota_roster",
	UPDATE_ROSTER_SCHEDULE_SPAN: "update.domain_roster_schedule_span",
	UPDATE_CMN_ROTA_ESC_STEP_DEF: "update.domain_cmn_rota_esc_step_def",
	ATTRIBUTES: "attributes",
	DOMAIN_MASTER: "domain_master",

	initialize: function() {
		this.domainStructureUtil = new ScheduleDomainStructureUtil(this.ROTA_LEVEL);
		this.log = new GSLog(this.ROTA_LEVEL, this.type);
	},

	fixDomainSupport: function() {
		// Update cmn_rota_member table to use domain_master
		var memberResult = this.domainStructureUtil.makeDomainMasterCompliant(this.CMN_ROTA_MEMBER, this.CMN_ROTA_ROSTER, this.ROSTER, this.PLUGIN_ID, this.UPDATE_MEMBER);

		// Only add domain_master attribute to cmn_rota_roster if cmn_rota_member was successful.
		if (memberResult.domain_master)
			this.domainStructureUtil.makeDomainMasterCompliant(this.CMN_ROTA_ROSTER, this.CMN_ROTA, this.ROTA, this.PLUGIN_ID, this.UPDATE_ROSTER);

		// Update roster_schedule_span table to use domain_master
		this.domainStructureUtil.makeDomainMasterCompliant(this.ROSTER_SCHEDULE_SPAN, this.CMN_SCHEDULE, this.SCHEDULE, this.PLUGIN_ID, this.UPDATE_ROSTER_SCHEDULE_SPAN);
	},
    
	fixDomainSupportForShiftEscalationStepDefinition: function() {
		// Update cmn_rota_esc_step_def table to use domain_master attribute as escalation_set
		if (!this.isDomainFieldPresent(this.CMN_ROTA_ESC_STEP_DEF)) {
			var grDictionary = this._getDictionaryRecord(this.CMN_ROTA_ESC_STEP_DEF);
			if (grDictionary) {
				var ga = new GlideAttributes(grDictionary.getValue(this.ATTRIBUTES));
				if (ga.containsAttribute(this.DOMAIN_MASTER) && ga.getAttribute(this.DOMAIN_MASTER) != this.ESCALATION_SET) {
					this.domainStructureUtil.removeDomainMasterAttribute(this.CMN_ROTA_ESC_STEP_DEF);
					this.domainStructureUtil.makeDomainMasterCompliant(this.CMN_ROTA_ESC_STEP_DEF, this.CMN_ROTA_ESCALATION_SET, this.ESCALATION_SET, this.PLUGIN_ID, this.UPDATE_CMN_ROTA_ESC_STEP_DEF);
				}
			}
		}
	},
	
	_getDictionaryRecord: function(table) {
		var grDictionary = new GlideRecord("sys_dictionary");
		grDictionary.addQuery("name", table);
		grDictionary.addQuery("internal_type", "collection");
		grDictionary.query();
		
		if (!grDictionary.next())
			return null;
			
		return grDictionary;
	},
	
	type: "OCDomainSupport"
};
