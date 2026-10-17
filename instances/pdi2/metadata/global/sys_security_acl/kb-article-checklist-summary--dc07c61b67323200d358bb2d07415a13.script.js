answer = gs.hasRole("knowledge_admin") || (gs.getUserID() == current.reviewer && current.state != "submitted");
