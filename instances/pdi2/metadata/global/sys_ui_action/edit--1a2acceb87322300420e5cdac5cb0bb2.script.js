var uri = action.getGlideURI();
uri.set('sysparm_m2m_ref', current.getTableName());
uri.set('sysparm_stack', 'no');
action.setRedirectURL(uri.toString('sys_m2m_template.do'));
var msg = new ArticleTemplateUtil().getWarningPopUpContent(parent.getUniqueValue());
if(msg)
	gs.addInfoMessage(msg);
