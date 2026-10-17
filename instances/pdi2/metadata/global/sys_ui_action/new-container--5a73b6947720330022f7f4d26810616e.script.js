var uri = action.getGlideURI();
var path = 'sys_ux_page_element.do';
uri.set('sys_id', '-1');
uri.set('sysparm_parent', parent.sys_id);
uri.set('sysparm_query', 'component=634f9e5267e0330075e8ebc172415abf');
action.setRedirectURL(uri.toString(path));
action.setNoPop(true);
