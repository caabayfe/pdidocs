// save any updates
if (current.changes())
  current.update();

// redirect to us
gs.setRedirect("sys_gauge_preview.do?sys_id=" + current.sys_id + '&sysparm_tryit=yes');
