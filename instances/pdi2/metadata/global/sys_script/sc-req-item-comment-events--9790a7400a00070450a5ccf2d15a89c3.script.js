gs.eventQueue("sc_req_item.commented", current, gs.getUserID(), gs.getUserName());
queueAssigneeEvent();

function queueAssigneeEvent() {
   var assigneeArr = [];
   var assignGroupArr = [];
   //Query for non-pending sc_task records
   var catTsk = new GlideRecord('sc_task');
   catTsk.addQuery('request_item', current.sys_id);
   catTsk.addQuery('state', '!=', -5);
   catTsk.query();
   if (!catTsk.hasNext()) {
      gs.addInfoMessage(gs.getMessage('Comment cannot be viewed by technicians until work begins on the Requested Item'));
      return;
   }
   while (catTsk.next()) {
      //notify task assignees
      if (!catTsk.assigned_to.nil())
         assigneeArr.push(catTsk.assigned_to.toString());
      else
         assignGroupArr.push(catTsk.assignment_group.toString());
      //Add Work notes watch list users
      assigneeArr.push(catTsk.work_notes_list.toString());
   }
   gs.eventQueue("sc_req_item.commented.itil", current, assigneeArr, assignGroupArr);
}
