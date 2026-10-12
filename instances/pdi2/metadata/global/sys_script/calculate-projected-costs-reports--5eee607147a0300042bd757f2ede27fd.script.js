// set defaults
current.monthly_cost = 0;
current.yearly_cost = 0;
current.cost_per_asset = 0;

calcMonthlyYearly();
calcCostPerAsset();

// if rate card based contract, look at those values
function calcMonthlyYearly() {
	if (current.ratecard) {
		var contractRateCard = new GlideRecord('fm_contract_rate_card');
		contractRateCard.addQuery('contract', current.sys_id);
		contractRateCard.addQuery('active', 'true');
		contractRateCard.query();
		while (contractRateCard.next()) {
			addCosts(contractRateCard.amount, contractRateCard.interval);
		}
	} else
		addCosts(current.total_cost, current.payment_schedule);
}

function calcCostPerAsset() {
	var assets = new GlideAggregate('clm_m2m_contract_asset');
	assets.addQuery('contract', current.sys_id);
	assets.addAggregate('COUNT');
	assets.setGroup(false);
	assets.query();
	var count = 0;
	if (assets.next()) {
		count = assets.getAggregate('COUNT');
	}
	var average = 0;
	if (count > 0)
		average = current.total_cost / count;
	current.cost_per_unit = average;
}

function addCosts(cost, interval) {
	var currencyCode = cost.getCurrencyCode();
	cost = parseFloat(cost.getCurrencyValue());
	var monthlyCost = parseFloat(current.monthly_cost.getCurrencyValue());
	var yearlyCost = parseFloat(current.yearly_cost.getCurrencyValue());

	var newMonthlyCost = 0;
	var newYearlyCost = 0;

	if (interval == 'daily') {
		newMonthlyCost = monthlyCost + cost * 30;
		newYearlyCost = yearlyCost + cost * 365;
	} else if (interval == 'weekly') {
		newMonthlyCost = monthlyCost + cost * 4;
		newYearlyCost = yearlyCost + cost * 52;
	} else if (interval == 'weekly2') {
		newMonthlyCost = monthlyCost + cost * 2;
		newYearlyCost = yearlyCost + cost * 26;
	} else if (interval == 'Monthly' || interval == 'monthly') {
		newMonthlyCost = monthlyCost + cost;
		newYearlyCost = yearlyCost + cost * 12;
	} else if (interval == 'monthly2') {
		newMonthlyCost = monthlyCost + cost / 2;
		newYearlyCost = yearlyCost + cost * 6;
	} else if (interval == 'Quarterly' || interval == 'quarterly') {
		newMonthlyCost = monthlyCost + cost / 3;
		newYearlyCost = yearlyCost + cost * 4;
	} else if (interval == 'semiannual') {
		newMonthlyCost = monthlyCost + cost / 6;
		newYearlyCost = yearlyCost + cost * 2;
	} else if (interval == 'Annual' || interval == 'yearly') {
		newMonthlyCost = monthlyCost + cost / 12;
		newYearlyCost = yearlyCost + cost * 1;
	}
	current.monthly_cost = currencyCode + ';' + newMonthlyCost;
	current.yearly_cost = currencyCode + ';' + newYearlyCost;
}
