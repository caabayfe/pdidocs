(function refineQuery(current, parent) {
  current.addQuery("opened_for", parent.opened_for);
  current.addQuery('sys_id', '!=', parent.sys_id);
  current.addNotNullQuery('opened_for');
  //5136503cc611227c0183e96598c4f706 is the sysID for the guest user
  current.addQuery('opened_for', '!=', '5136503cc611227c0183e96598c4f706');
})(current, parent);
