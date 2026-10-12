var as = new GlideArchiveStatus(current.sys_id);
as.setEstimate(current.sys_id, current.condition);

gs.setRedirect("sys_archive.do?sys_id=" + current.sys_id);
