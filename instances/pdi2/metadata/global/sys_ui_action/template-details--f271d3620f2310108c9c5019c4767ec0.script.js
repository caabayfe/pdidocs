var uri = action.getGlideURI();
var path = 'sys_app_template_detail.do';
var query = 'template=' + current.sys_id;

uri.set('sysparm_query', query);

action.setRedirectURL(uri.toString(path));
