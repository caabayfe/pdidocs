if (current.product_instance_id) {
	current.product_instance_id = ''; // Clear out the existing PID
}
answer = current.insert();
gs.include('ActionUtils');
var au = new ActionUtils();
au.postInsert(current);
