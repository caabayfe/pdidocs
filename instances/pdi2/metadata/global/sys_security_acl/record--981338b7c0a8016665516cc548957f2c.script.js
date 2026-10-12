var ra = false; 
if (root_rule.substring(0,7)=='var__m_') { 
  ra = gs.getUser().hasRole('workflow_creator') || gs.getUser().hasRole('delegated_developer'); 
} 
ra; 
