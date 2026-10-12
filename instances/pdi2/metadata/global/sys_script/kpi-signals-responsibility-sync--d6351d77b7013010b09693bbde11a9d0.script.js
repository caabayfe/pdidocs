(function executeRule(current, previous /*null when async*/) {
  var usersStr = current.responsible_users;
  var sysId = current.sys_id;
  var users = usersStr.split(',');
  var rgr = new GlideRecord('pa_responsibility');
  rgr.setWorkflow(false);
  rgr.addQuery('entity', sysId);
  rgr.query();

  if (sys_action == 'delete') {
    while (rgr.next()) {
      rgr.deleteRecord();
    }
    return;
  }

  // remove items missing from the list
  while (rgr.next()) {
    var userId = rgr.getValue('user');
    var index = users.indexOf(userId);
    if (index >= 0) {
      users.splice(index, 1);
    } else {
      rgr.deleteRecord();
    }
  }
  if(JSUtil.nil(usersStr))
	return;
  // add items from the list not already persisted
  var ins = new GlideRecord('pa_responsibility');
  for (var i=0; i < users.length; i++) {
	ins.initialize();
	ins.setWorkflow(false);
    ins.setValue('user', users[i]);
    ins.setValue('entity', sysId);
    ins.setValue('table', 'pa_xmr_processes');
	ins.insert();
  }
})(current, previous);
