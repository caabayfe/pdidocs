function onLoad() {
   //Type appropriate comment here, and begin script below
   
	if (g_form.getBooleanValue("no_triggers")) {
      g_form.setSectionDisplay("triggers", false);
   } else {
      g_form.setDisplay("expand_synonyms", false);
      g_form.setSectionDisplay("triggers", true);
      var conditions = g_form.getValue("trigger").toString().split("^");
        for (var i = 0; i < conditions.size(); i++) {
          if ( conditions[i].startsWith("query") ) {
			g_form.setDisplay("expand_synonyms", true);
		}
	}
   }
   g_form.setDisplay("condition_table", false);
	
}
