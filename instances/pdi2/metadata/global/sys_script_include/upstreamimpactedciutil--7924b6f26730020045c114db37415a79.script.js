var UpstreamImpactedCIUtil = Class.create();

UpstreamImpactedCIUtil.prototype = {
	_impactedCI: "impacted_ci",
	//_impacted: {},
	_parentsChecked: {},
	///_childrenChecked:{},
	_comparisons: 0,
	current: null,
	previous: null,
	_level:-1,
	_deepestLevel: -1,
	_sourceCI: null,
	_incidentAlert: null,

	initialize: function(curr, prev) {
		this._log = new GSLog("com.snc.iam.log_level", this.type);
		this.current = curr;
		this.previous = prev;
		this._incidentAlert = curr.sys_id.toString();
		this._sourceCI = curr.source_ci.sys_id.toString();
		this._impacted = {};
		this._childrenChecked = {};
	},

	_deleteExistingCIs: function(){
		//Log.debug("impacted CIs automatically generated for "+previous.getDisplayValue('source_ci')+" being removed now.");

		var not_impacted = new GlideRecord(this._impactedCI);
		not_impacted.addQuery('incident_alert',this.current.sys_id);
		not_impacted.addQuery('source_configuration_item',this.previous.source_ci.sys_id.toString());
		not_impacted.query();
		not_impacted.deleteMultiple();
	},

	process: function(){
		//Before you begin, clean out previous impacted list
		if (this.previous.source_ci.hasValue())
			this._deleteExistingCIs();
		
		this.getImpactedCIsForPrimary(this.current.source_ci);
		for(var prop in this._impacted){
			var element = prop;
			this._log.debug(element);
			if(!this.relationExists(this._sourceCI, element, this._incidentAlert)) {
				var gr = new GlideRecord(this._impactedCI);
				gr.source_configuration_item = this._sourceCI;
				gr.incident_alert = this._incidentAlert;
				gr.impacted_configuration_item = element;
				var result = gr.insert();
				this._log.debug(result);
			}
		}
	},

	getImpactedCIsForPrimary: function(childSysId){
		var relatedCIRecord = new GlideRecord('cmdb_rel_ci');
		relatedCIRecord.addQuery('child', childSysId);
		relatedCIRecord.query();

		this.addImpactedCI(relatedCIRecord);
		this.getImpactedCisForParents(relatedCIRecord);
	},

	getImpactedCisForParents: function(parents){
		if(parents.getRowCount() == 0)
			return;
		var relQuery = new GlideRecord("cmdb_rel_ci");
		var orCond = null;
		while(parents.next()){
			var sysId = parents.parent.toString();
			if(sysId == '' || this._childrenChecked[sysId])
				continue;
			if(orCond == null)
				orCond = relQuery.addQuery("child", sysId);
			else
				orCond.addOrCondition("child", sysId);
			this._childrenChecked[sysId] = true;
		}

		// checks impacted CI recursively only if there are still non-checked parents
		if (orCond != null) {
			relQuery.query();

			this.addImpactedCI(relQuery);

			this.getImpactedCisForParents(relQuery);
		}
	},

	 addImpactedCI: function(parentRecs) {
		parentRecs.saveLocation();
		while(parentRecs.next()){
			var sysId = parentRecs.parent.toString();
			if (!(this._impacted[sysId])) {
				this._impacted[sysId] = true;
			}
		}
		parentRecs.restoreLocation();
	},

	//checks if record already exists. This can be improved by
	//designating _sourceCI and impactedCI columns
	//in impacted_ci table unique
	relationExists: function(_sourceCI, impactedCI, _incidentAlert){
		var gr = new GlideAggregate(this._impactedCI);
		gr.addQuery('impacted_configuration_item=' + impactedCI +
			'^source_configuration_item=' + _sourceCI +
			'^ORsource_configuration_item=' +
			'^incident_alert=' + _incidentAlert);
		gr.addAggregate('COUNT');
		gr.query();

		if(gr.next())
			return (gr.getAggregate('COUNT') > 0);

		return false;
	},

	info: function(message){
		this._log.info(message);
	},
	warning: function(message){
		this._log.warn(message);
	},
	error: function(message){
		this._log.error(message);
	},
	debug: function(message){
		this._log.debug(message);
	},
	
	type: "UpstreamImpactedCIUtil"
};
