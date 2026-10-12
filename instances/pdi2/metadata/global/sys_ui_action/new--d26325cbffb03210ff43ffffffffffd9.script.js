var uri = action.getGlideURI();
var path = 'pa_datasnapshot_indicator.do';

uri.set('sys_id', '-1');
action.setRedirectURL(uri.toString(path));
action.setNoPop(true);
