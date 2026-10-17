// Add the retrieved updates to the Preview list
new UpdateSetPreviewer().generateCollisionRecords(current.sys_id);

// create the URL for the ui_page to display the Update Set Preview List
var url = "sys_update_collision_xml_list.do?";
url += "sysparm_query=sys_update.update_set.sys_id=";
url += current.sys_id;

gs.setRedirect(url); 
