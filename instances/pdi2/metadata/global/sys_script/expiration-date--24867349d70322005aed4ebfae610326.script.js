(function executeRule(current, previous /*null when async*/) {
	var daysToExpire = current.expiration_days;
	
	var gd = new GlideDate(); 
    gd.addDays(daysToExpire);
	
	//set the expire on date 
	current.expire_on_date = gd;

})(current, previous);
