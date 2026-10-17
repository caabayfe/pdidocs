var uri = action.getGlideURI();
var path = 'sys_ux_content_picker.do';
uri.set('sys_id', '-1');
uri.set('sysparm_parent', parent.sys_id);
action.setRedirectURL(uri.toString(path));
