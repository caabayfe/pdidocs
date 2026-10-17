function contractFilter() {
	var contractScore = {};

	var slaModelGr = new GlideRecord("cmdb_contract_product_model");
	slaModelGr.addQuery("attach_sla", true);
	slaModelGr.query();

	var attachContract = {};
	while (slaModelGr.next())
		attachContract[slaModelGr.getUniqueValue()] = true;

	function updateContractScore(relGr, fldNm) {
		fldNm = fldNm || "contract";
		while (relGr.next()) {
			var cSysId = relGr[fldNm] + "";
			var modelId = relGr[fldNm].contract_model + "";

			if (!attachContract[modelId]) // If it's an model with attach_sla=false
				continue;

			if (!contractScore[cSysId])
				contractScore[cSysId] = 1;
			else
				contractScore[cSysId]++;
		}
	}

	if (!current.company.nil()) {
		var cpyLkp = new GlideRecord('ast_contract');
		cpyLkp.addQuery('vendor', current.company);
		cpyLkp.query();
		while (cpyLkp.next()) {
			if (!attachContract[cpyLkp.contract_model + ""]) // If it's an model with attach_sla=false
				continue;

			var cId = cpyLkp.getUniqueValue() + "";
			
			if (!contractScore[cId])
				contractScore[cId] = 1;
			else
				contractScore[cId]++;
		}
		
		updateContractScore(cpyLkp);
	}

	if (!current.location.nil()) {
		var locLkp = new GlideRecord('contract_rel_location');
		locLkp.addQuery('location', current.location);
		locLkp.query();
		updateContractScore(locLkp);
	}

	if (!current.cmdb_ci.nil()) {
		// Check relationship from SLA integration (ast_service)
		var ciLkp = new GlideRecord('contract_rel_ci');
		ciLkp.addQuery('ci_item', current.cmdb_ci);
		ciLkp.query();
		updateContractScore(ciLkp);

		// Check relationship from ast_contract.
		ciLkp = new GlideRecord("ast_contract_instance");
		ciLkp.addQuery('ci_item', current.cmdb_ci);
		ciLkp.addQuery("ast_contract.contract_model.attach_sla", true);
		ciLkp.query();
		updateContractScore(ciLkp, "ast_contract");
	}

	if (!current.caller_id.nil()) {
		var callerLkp = new GlideRecord('contract_rel_user');
		callerLkp.addQuery('user', current.caller_id);
		callerLkp.query();
		updateContractScore(callerLkp);

		// Check relationship from ast_contract.
		callerLkp = new GlideRecord("clm_m2m_contract_user");
		callerLkp.addQuery('user', current.caller_id);
		callerLkp.addQuery("contract.contract_model.attach_sla", true);
		var now = new GlideDate();
		callerLkp.addQuery("added","<=", now);
		callerLkp.addQuery("removed",">=", now);
		callerLkp.query();
		updateContractScore(callerLkp);
	}

	if (!current.assignment_group.nil()) {
		var grpLkp = new GlideRecord('contract_rel_group');
		grpLkp.addQuery('group', current.assignment_group);
		grpLkp.query();
		updateContractScore(grpLkp);
	}

	var contracts = Object.keys(contractScore);
	return "sys_idIN" + contracts.join(",");
}
