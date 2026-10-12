answer = current.insert();
gs.include('ActionUtils');
var au = new ActionUtils();
au.postInsert(current);
new GlideUpdateSet().set(current.sys_id);
