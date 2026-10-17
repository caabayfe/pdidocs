// we changed our own user record. Set out timezone, date, and time formats
setUserParticulars();

function setUserParticulars() {
	if (current.date_format.changes()) {
		gs.getSession().setDateFormat(current.date_format);
		gs.getUser().setDateFormat(current.date_format);
	}
	
	if (current.time_format.changes()) {
		gs.getSession().setTimeFormat(current.time_format);
		gs.getUser().setTimeFormat(current.time_format);
	}
	
	if (current.time_zone.changes()) {
		if (gs.nil(current.time_zone))
			gs.getSession().setTimeZoneName(gs.getSysTimeZone());
		else
			gs.getSession().setTimeZoneName(current.time_zone);
	}
	
	if (current.preferred_language.changes()) {
		gs.getUser().savePreference('user.language', current.preferred_language);
		if(gs.nil(current.preferred_language))
			gs.getSession().setLanguage(getSystemLanguage());
		gs.getSession().loadUserByID(gs.getUser().getID());
	}

	if (current.country.changes())
		gs.getSession().loadUserByID(gs.getUser().getID());

	if (current.getElement(current.getDisplayName()).changes())
		gs.getSession().loadUserByID(gs.getUser().getID());
}

function getSystemLanguage() {
	var sysLang = gs.getProperty('glide.sys.language');
	//If there is no Global language specified, default to english
	if (sysLang.nil()) {
		sysLang = 'en';
	}
	return sysLang;
}
