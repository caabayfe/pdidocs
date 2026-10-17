answer = current.insert();
gs.include('ActionUtils');
var au = new ActionUtils();
au.postInsert(current);
gs.setRedirect(current.sys_class_name + ".do?sys_id=" + current.sys_id);
