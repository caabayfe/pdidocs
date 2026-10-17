	(function executeRule(current, previous /*null when async*/) {

	var country = current.country;
	var coreCountryGR = new GlideRecord("core_country");
	coreCountryGR.addQuery("iso3166_2", country);
	coreCountryGR.query();
	if(coreCountryGR.getRowCount() == 0) {
        gs.error("Attempt to insert/update an invalid value for the country field in sys_user: " + country + ". User: " + current.user_name);
        current.setAbortAction(true);
	}

})(current, previous);
