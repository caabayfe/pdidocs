function onLoad() {
	if(g_form.isNewRecord())
		return;
	
	g_form.getReference("search_context_config", handleSearchContext);
}

function handleSearchContext(searchContext) { 
   if(searchContext.search_engine === "ai_search")
	g_form.setDisplay("interleave", false);
   else
	g_form.setDisplay("interleave", true);
}
