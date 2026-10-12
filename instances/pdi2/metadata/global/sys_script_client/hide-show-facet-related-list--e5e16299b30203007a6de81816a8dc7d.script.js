function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }
   if(g_form.getBooleanValue("is_scripted_source")) {
	   g_form.hideRelatedList("sp_search_facet");
   } else {
	   g_form.showRelatedList("sp_search_facet");
   }
}
