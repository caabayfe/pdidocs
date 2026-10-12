
      /**
          N.B. As of Istanbul release CTI implementations must conform to new rules for security reasons.
          
          Existing CTI implementations must be made to conform and tested in a sub-prod instance before upgrading the
          production instance to Istanbul, or the CTI implementation will malfunction in production.

          Please refer to KB0620953 for details
	**/
          
    function cti() {
            var url = null;
            var name = sysparm_caller_name;
            eid = sysparm_caller_id;
            var phone = sysparm_caller_phone;
            var taskID = sysparm_task_id;
            var fQuery = sysparm_query;
            if (fQuery == null)
               fQuery = '';
            var view = sysparm_view;
            if (view == null || view == '')
            	view = "itil";

            var userID = null;
            if (eid != null && eid != '') {
                userID = UserGetSysId("employee_number",eid);
            }
            if (userID == null && name != null && name != '') {
            	userID = UserGetSysId("name", name);            	
            }
            if (userID == null && phone != null && phone != '') {
            	userID = UserGetSysId("phone", phone);
            }
            if (userID != null) {
            	var gr = new GlideRecord("incident");
            	gr.addQuery("active", "true");
            	gr.addQuery("caller_id", userID);
                gr.setWorkflow(false);
            	gr.query();
            	if (gr.next())
            	   url = "sys_user.do?sys_id=" + userID + "&sysparm_view=" + view;
            } else {
            	if (taskID != null && taskID != '') {
                   //var task = new GlideRecord('incident');
                   //task.addQuery('number', taskID);
                   //task.query();
                   //if (task.next()) {
                       //if (typeof(sysparm_work_notes) != 'undefined')
                       //    task.work_notes.setJournalEntry(sysparm_work_notes);                       
                       //if (typeof(sysparm_priority) != 'undefined') 
                       //    task.priority = sysparm_priority;                       
                       //task.update();
                   //}
            	   url = "task.do?sys_id=" + taskID + "&sysparm_view=" + view;            		
            	}
            }
            if (userID != null) {
            	if (fQuery.length > 0)
            		fQuery += "^";
            	fQuery += "caller_id=" + userID;
            }
            if (url == null) {
            	url = "incident.do?sys_id=-1";
            	if (fQuery != null)
            	   url += "&sysparm_query=" + fQuery;
            }
            answer = url;
            return url;
}

function UserGetSysId(field, value) {
  var user = new GlideRecord("sys_user");
  user.addQuery(field, value);
  user.query();
  if (user.next())
     return user.sys_id;
  else
     return null;
}
