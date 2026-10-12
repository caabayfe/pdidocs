(function(current, previous) {
  if (current.sys_id == '')
     return;

  var tasks = new GlideRecord('sc_task');
  tasks.addQuery('parent', current.sys_id);
  tasks.orderBy('order');
  tasks.query();
  while (tasks.next()) {
    tasks.state = 4;
    tasks.update();
  }
})(current, previous);
