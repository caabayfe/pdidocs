answer = current.insert();
gs.include('ActionUtils');
var au = new ActionUtils();
au.postInsert(current);
gs.setRedirect("asmt_metric_type.do?sys_id=" + current.metric_category.metric_type.sys_id);
