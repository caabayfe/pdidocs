var test_id = action.getGlideURI().getMap().get('sysparm_collectionID');
var table = new GlideRecord("sys_db_object");
table.get('name','sys_atf_parameter_set');
action.setRedirectURL("sys_dictionary.do?sysparm_query_override=name=" + table.name.toString() + '&sysparm_view=ATF_Shared_Parameter');
var test = new GlideRecord("sys_atf_test");
test.get(test_id);
action.setReturnURL(test);
