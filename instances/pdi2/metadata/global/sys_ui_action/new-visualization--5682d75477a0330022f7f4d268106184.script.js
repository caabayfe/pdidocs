var uri = action.getGlideURI();
var path = 'sys_ux_page_element.do';
uri.set('sys_id', '-1');
uri.set('sysparm_parent', parent.sys_id);
uri.set('sysparm_query', 'component=180a1a9e67a0330075e8ebc172415a20');
action.setRedirectURL(uri.toString(path));
action.setNoPop(true);
