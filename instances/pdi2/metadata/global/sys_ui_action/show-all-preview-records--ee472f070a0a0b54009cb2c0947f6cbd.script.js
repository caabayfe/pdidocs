// create the URL for the ui_page to display the Update Set Preview List
var url = "sys_update_preview_xml_list.do?";
url += "sysparm_query=remote_update.remote_update_set=";
url += current.sys_id;

gs.setRedirect(url);
