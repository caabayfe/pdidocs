answer = (gs.hasRole("knowledge_admin") || gs.getUserID() == current.checklist_summary.reviewer) && current.checklist_summary.state != "submitted";
