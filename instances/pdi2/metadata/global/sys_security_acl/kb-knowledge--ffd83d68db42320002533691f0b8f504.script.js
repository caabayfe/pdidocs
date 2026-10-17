answer = true;
var col = root_rule.split('.')[1];
var excluded = ["number","kb_knowledge_base","topic","workflow_state","kb_category","category","disable_commenting","disable_suggesting","author"];
if (col.indexOf('sys_') > -1 || excluded.indexOf(col) > -1) 
	answer = false;

answer = answer && (gs.hasRole("knowledge_admin") || gs.hasRole("knowledge_manager") || new KBKnowledge().canCreate());
