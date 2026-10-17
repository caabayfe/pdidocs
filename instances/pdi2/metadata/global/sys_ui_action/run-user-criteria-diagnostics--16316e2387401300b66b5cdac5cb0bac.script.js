// save any updates
if (current.changes())
  current.update();

// redirect to view the diagnostics page with Article filled
	gs.setRedirect("user_diagnostics.do?sysparm_article_id="+current.getUniqueValue());
