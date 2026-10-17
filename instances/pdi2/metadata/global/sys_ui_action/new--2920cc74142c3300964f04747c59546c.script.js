var uri = action.getGlideURI();
var path = 'alm_custom_template_task.do';

uri.set('sys_id', '-1');
action.setRedirectURL(uri.toString(path));
action.setNoPop(true);
