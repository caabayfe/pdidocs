var uri = action.getGlideURI();
var path = 'sc_cat_item_dt_approval.do';

uri.set('sys_id', '-1');
action.setRedirectURL(uri.toString(path));
action.setNoPop(true);
