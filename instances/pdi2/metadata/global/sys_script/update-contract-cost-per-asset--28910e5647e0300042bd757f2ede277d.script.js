this.calcCostPerAsset(current.contract);

function calcCostPerAsset(contract) {
	if (contract.sys_id) {
		var gr = new GlideRecord('ast_contract');
		gr.get(contract.sys_id);
		if (gr.isValidRecord()) {
			var assetsCoveredGA = new GlideAggregate('clm_m2m_contract_asset');
			assetsCoveredGA.addQuery('contract', contract.sys_id);
			assetsCoveredGA.addAggregate('COUNT');
			assetsCoveredGA.setGroup(false);
			assetsCoveredGA.query();
			var count = 0;
			if (assetsCoveredGA.next()) {
				count = assetsCoveredGA.getAggregate('COUNT');
			}
			var average = 0;
			if (count > 0)
				average = gr.total_cost/count;
			gr.cost_per_unit = average;
			gr.update();
		}
	}
}
