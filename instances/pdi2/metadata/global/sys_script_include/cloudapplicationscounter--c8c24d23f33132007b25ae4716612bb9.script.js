var CloudApplicationsCounter = Class.create();
CloudApplicationsCounter.prototype = {

	dbom : undefined,
	cmdbMetadata : undefined,

	initialize: function() {
		this.dbom = GlideDBObjectManager.get();
		this.cmdbMetadata = new SNC.CmdbMetadataWrapper();

	},

	/*
	 *	This function returns map, that contains all
	 *	logical datacenters, that belong to some business service.
	 *	Key  : sysClassName of datacenter
	 *	Value: array of SysIDs of datacenters, that have this type
	*/
	getAllLogicalDatacenters : function() {
		var res = {};
		var ldcGr = new GlideRecord('cmdb_ci_logical_datacenter');
		ldcGr.addJoinQuery('svc_ci_assoc', 'sys_id', 'ci_id');
		ldcGr.query();
		while (ldcGr.next()) {
			var ldcClassName = ldcGr.sys_class_name;
			var ldcSysId = ldcGr.getUniqueValue();
			if (!(ldcClassName in res))
				res[ldcClassName] = [];
			res[ldcClassName][res[ldcClassName].length] = ldcSysId;
		}
		return res;
	},

	/*
	 * This function returns array of HostingLink objects,
	 * that are relevant for logical datacenters in DB
	*/
	getAllHostingLinks : function(ldcClassNames) {
		var res = [];
		var resIds = {};

		for (var i = 0; i < ldcClassNames.length; i++) {
			var curHostingLinksList = this.cmdbMetadata.getHostedWithInheritance(ldcClassNames[i]);
			for (var j = 0; j < curHostingLinksList.size(); j++) {
				var curHl = curHostingLinksList.get(j);
				var curHlId = '' + curHl.id;
				if (!(curHlId in resIds)) {
					res[res.length] = curHl;
					resIds[curHlId] = 0;
				}
			}
		}

		return res;
	},


	/*
	 * This function returns candidates to be counted as hosted applications
	 * Parameters:
	 * side1SysIds  - array of logical datacenter SysIDs of same type
	 * relTypeSysId - relation type from datacenter of this type to hosted applications
	 * side2Types   - array of possible hosted application types
	 * side1IsParent - boolean, that says who is parent on relation
	 *
	 * returns vector of hosted CI SysIDs
	 *
	*/
	searchHostedApplications : function (side1SysIds, relTypeSysId, side2Types, side1IsParent) {
		var gr = new GlideRecord('cmdb_rel_ci');
		gr.addQuery(side1IsParent ? 'parent' : 'child', side1SysIds);
		gr.addQuery('type', relTypeSysId);
		gr.addQuery((side1IsParent ? 'child' : 'parent') + '.sys_class_name', side2Types);
		gr.addJoinQuery('svc_model_assoc_ci', (side1IsParent ? 'child' : 'parent'), 'ci_id');
		gr.query();

		var res = [];
		while (gr.next())
			res[res.length] = gr.getValue(side1IsParent ? 'child' : 'parent');

		return res;
	},

	isLdcTypeRelevant : function(ldcType, datacenterType) {
		var childNames = this.dbom.getAllExtensions(datacenterType);
		for (var i = 0; i < childNames.size(); i++)
			if (ldcType == '' + childNames.get(i)) {
				return true;
			}
		return false;

	},

	/*
	 * This function returns all hosted applications
	 */
	getApplications : function() {
		var ldcMap = this.getAllLogicalDatacenters();
		var ldcSysClassNames = [];
		var res = [];

		for (var ldcSysClassName in ldcMap)
			ldcSysClassNames[ldcSysClassNames.length] = ldcSysClassName;
		if (ldcSysClassNames.length == 0)
			return res;

		var hostingLinks = this.getAllHostingLinks(ldcSysClassNames);
		for (var hl = 0; hl < hostingLinks.length; hl++) {
			var hostingLink = hostingLinks[hl];
			var hostedCiType       = hostingLink.parentType;
            var datacenterType     = '' + hostingLink.childType;
            var relTypeId          = '' + hostingLink.relationId;
            var datacenterIsParent = (hostingLink.isReverseRelation == 'true');

			var isLdcFound = false;

			for (var ldcTypeIndex = 0;  ldcTypeIndex < ldcSysClassNames.length; ldcTypeIndex++) {
				if (this.isLdcTypeRelevant(ldcSysClassNames[ldcTypeIndex], datacenterType)) {
					isLdcFound = true;
					break;
				}
			}

			if (isLdcFound) {
				var childNames = this.dbom.getAllExtensions(hostedCiType);
				if (childNames == null)
					continue;
				var hostedClassNames = [];
				for (var t = 0; t < childNames.size(); t++)
					hostedClassNames[hostedClassNames.length] = '' + childNames.get(t);

				for (var existingLdcType in ldcMap) {
					if (!this.isLdcTypeRelevant(existingLdcType, datacenterType))
						continue;
					var candidates = this.searchHostedApplications(ldcMap[existingLdcType],
																   relTypeId,
																   hostedClassNames,
																   datacenterIsParent);
					for (var c = 0; c < candidates.length; c++)
						res[res.length] = candidates[c];
				}
			}

		}
		return res;

	},

	/*
	 * This function is external API
	 * It returns map : domain to integer counter of applications
	 */
	getCloudApplicationCounters : function () {
		var res = {};
		var applicationsToCount = this.getApplications();

		for (var c = 0; c < applicationsToCount.length; c++) {
			var applGr = new GlideRecord('cmdb_ci');
			applGr.get(applicationsToCount[c]);

			var domain = applGr.sys_domain;
			if (!(domain in res))
				res[domain] = 1;
			else
				res[domain]++;
		}
		return res;
	},

	/*
	 * This function is external API
	 * It returns map : domain to list of objects, each one has
	 * properties: sys_id and name
	 */
	getCloudApplications : function () {
		var res = {};
		var applicationsToCount = this.getApplications();

		for (var c = 0; c < applicationsToCount.length; c++) {
			var applGr = new GlideRecord('cmdb_ci');
			applGr.get(applicationsToCount[c]);

			var domain = applGr.sys_domain;
			if (!(domain in res))
				res[domain] = [];

			var appl = {};
			appl.sys_id = applicationsToCount[c];
			appl.name   = applGr.name;
			appl.sys_class_name   = applGr.sys_class_name;

			res[domain][res[domain].length] = appl;
		}
		return res;
	},


    type: 'CloudApplicationsCounter'
};
