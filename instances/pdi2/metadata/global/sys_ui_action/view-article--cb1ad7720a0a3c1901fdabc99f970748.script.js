if(current.changes())
	current.update();

if(current.getValue('workflow_state') == 'retired' && !gs.nil(current.getValue('replacement_article'))) {
	gs.setRedirect("kb_view.do?sys_kb_id=" + current.sys_id+ "&preview_article=true&sysparm_redirect=false");	
} else {
	gs.setRedirect("kb_view.do?sys_kb_id=" + current.sys_id+ "&preview_article=true");
}

				
