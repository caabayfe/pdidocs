var uri1 = action.getGlideURI();
var view_uri = uri1.get('sysparm_view');

var url = 'ml_solution_definition.do?sys_id=-1' + '&sys_is_list=true&sysparm_view='+ view_uri +'&sysparm_view_forced=true';
action.setRedirectURL(url);
