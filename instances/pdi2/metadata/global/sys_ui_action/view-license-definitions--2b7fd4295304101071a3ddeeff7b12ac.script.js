// create the URL for the ui_page to display the license definitions related to application
var url = "sys_app_license_defn_list.do?sysparm_query=sys_scope=";
url += current.sys_id;

gs.setRedirect(url);
