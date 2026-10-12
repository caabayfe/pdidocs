// save any updates
if (current.changes())
  current.update();

// redirect to us
gs.setRedirect("ui_page.do?sys_id=" + current.sys_id);
