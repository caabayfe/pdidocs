/**
  * Show the list of tasks for this CI
 **/ 

showTaskListDialog(this);

function showTaskListDialog(node) {
   var w = new GlidePane("show_list", "task_list");
   w.setTitle("Related Issues");
   w.addParm('table', 'task_list');
   w.addParm('sysparm_view', 'bsm');
   var query = 'cmdb_ci=' + node.getID() + '^active=true';
   w.addParm('sysparm_query', query);
   w.render();
}
 
