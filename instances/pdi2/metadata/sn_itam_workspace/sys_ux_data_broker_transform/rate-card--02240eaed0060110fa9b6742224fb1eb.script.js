function transform(input) {
	var data = [];
	if(GlidePluginManager.isActive('com.snc.cost_management')){
		var gr = new GlideRecord("fm_contract_rate_card");
		gr.addQuery("contract",input.sysId);
		gr.query();
		var count = 0;
		while (gr.next()){
			var str = '{"start_date":"' + gr.start_date + '","end_date":"' + gr.end_date + '","base_cost":"'
			+ gr.base_cost + '","sysId":"' + gr.sys_id + '","name": "' + gr.name + '","start_date_valid":"","end_date_valid":""}';
			data[count] = str;
			count++;
		}
	}
	var currency = [];
	var gq = new GlideRecord("fx_currency");
    gq.addQuery("active", true);
    gq.query();
	count = 0;
    while(gq.next()){
		var code = gq.code;
		currency[count] = '{"' + gq.symbol + '":"' + code + '"}';
		count++;
	}
	
	var details = {
		adjTypes: data,
		curr: currency
    };	
    return details;
}
