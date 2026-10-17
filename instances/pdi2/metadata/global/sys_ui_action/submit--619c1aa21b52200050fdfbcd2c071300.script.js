answer = current.insert();
gs.include('ActionUtils');
var au = new ActionUtils();
au.postInsert(current);
gs.setRedirect(current.model_1.sys_class_name + ".do?sys_id=" + current.model_1.sys_id);
