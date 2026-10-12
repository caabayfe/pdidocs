var act_ele_id = current.activity_definition;
current.deleteRecord();
gs.setRedirect("wf_element_activity.do?sys_id="+act_ele_id);
