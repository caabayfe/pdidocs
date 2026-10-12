function onLoad() {
   g_form.hideRelatedList("sp_search_facet");
   if(!g_form.getBooleanValue("is_scripted_source")) {
	   g_form.showRelatedList("sp_search_facet");
   }
}
