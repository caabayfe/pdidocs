// save any updates
if (current.changes())
  current.update();

// redirect to view the diagnostics page with knowledge base filled
gs.setRedirect("user_diagnostics.do?sysparm_knowledge_base_id="+current.getUniqueValue());
