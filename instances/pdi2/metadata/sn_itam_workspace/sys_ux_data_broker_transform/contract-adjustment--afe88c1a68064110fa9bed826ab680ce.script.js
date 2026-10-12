function transform(input) {
    var adjStart = '';
    var adjEnd = '';
    var gd = new GlideDate();
    if (!gs.nil(input.adjStartDate)) {
        gd.setDisplayValue(input.adjStartDate);
        adjStart = gd.getValue();
    }
    if (!gs.nil(input.adjEndDate)) {
        gd.setDisplayValue(input.adjEndDate);
        adjEnd = gd.getValue();
    }
    var contractGq = new GlideRecord("ast_contract");
    contractGq.get(input.sysId);
    contractGq.starts = adjStart;
    contractGq.ends = adjEnd;
    contractGq.payment_amount = input.adjAmount;
    contractGq.update();
	
	if(input.rate){
		var rateDetails = input.rateDetails;
		var prop = Object.getOwnPropertyNames(rateDetails);
		var length = prop.length;
		for(var i = 0; i < length; i++){
			var data = rateDetails[prop[i]];
			var record = new GlideRecord("fm_contract_rate_card");
			record.get(prop[i]);
			record.name = data.name;
			record.base_cost = data.base_cost;
			record.start_date = data.start_date;
			record.end_date = data.end_date;
			record.update();
		}
	}	
    return;
}
