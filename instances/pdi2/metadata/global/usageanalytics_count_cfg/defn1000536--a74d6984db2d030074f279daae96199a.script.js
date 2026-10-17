answer = getUserCntPerLang();

function getUserCntPerLang () {
	
	var langData = {};
	var SYS_USER = "sys_user";
	var SYS_PROP = "sys_properties";
	var SYS_LANG = "sys_language";
	var PREF_LANG = "preferred_language";
	var PROP_NAME = "glide.sys.language";
	var ID = "id";
	var VALUE = "value";
	
	var grUser = new GlideRecord(SYS_USER); 
    grUser.addActiveQuery();
	grUser.query(); 

	langData.count = grUser.getRowCount();

	var defLang = new GlideRecord(SYS_PROP);
	defLang.addQuery("name", PROP_NAME);
	defLang.query();
	
	if (defLang.next()) {
		var sysDefault = defLang.getValue(VALUE);		
		langData["default"] = sysDefault;
	} 

	var ga = new GlideAggregate(SYS_USER);
        ga.addEncodedQuery("preferred_language!=^active=true");
        ga.addAggregate("COUNT", PREF_LANG);
        ga.query();

		while(ga.next()) { 
			var prefLangVal = ga.getValue(PREF_LANG);
			if (JSUtil.notNil(prefLangVal))
				langData[prefLangVal] = ga.getAggregate('COUNT', PREF_LANG);
	}

	return (new JSON().encode(langData));
}
