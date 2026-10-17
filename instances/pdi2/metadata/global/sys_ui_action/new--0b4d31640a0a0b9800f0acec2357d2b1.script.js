var uri = action.getGlideURI();
var path = 'process_step_approval.do';

uri.set('sys_id', '-1');
action.setRedirectURL(uri.toString(path));
action.setNoPop(true);
