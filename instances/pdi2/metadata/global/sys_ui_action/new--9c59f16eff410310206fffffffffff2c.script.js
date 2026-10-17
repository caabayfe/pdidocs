var uri = action.getGlideURI();
var path = 'pa_cdc_hierarchy.do';

uri.set('sys_id', '-1');
action.setRedirectURL(uri.toString(path));
action.setNoPop(true);
