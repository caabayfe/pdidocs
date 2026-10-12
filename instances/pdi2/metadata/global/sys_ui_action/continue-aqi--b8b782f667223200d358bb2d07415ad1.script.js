var summary_record = new KBAQI().getLatestAqiOnArticle(current.sys_id, current.kb_knowledge_base.checklist);
if (summary_record.next()) {
	action.setRedirectURL("/kb_article_checklist_summary.do?sys_id=" + summary_record.sys_id);
}
