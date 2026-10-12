showAffectedCIs(this);

function showAffectedCIs(node) {
   var w = new GlidePane("show_list", "task_ci_list");
   w.setTitle("Affected CI Tasks");
   w.addParm('table', 'task_ci_list');
   w.addParm('sysparm_view', 'bsm');
   var query = 'ci_item=' + node.getID() + '^task.active=true';
   w.addParm('sysparm_query', query);
   w.render();
}
