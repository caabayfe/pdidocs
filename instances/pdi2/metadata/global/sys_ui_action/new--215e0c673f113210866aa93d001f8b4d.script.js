var uri = action.getGlideURI();
var path = 'pa_dm_analytics_source.do';

uri.set('sys_id', '-1');
action.setRedirectURL(uri.toString(path));
action.setNoPop(true);
