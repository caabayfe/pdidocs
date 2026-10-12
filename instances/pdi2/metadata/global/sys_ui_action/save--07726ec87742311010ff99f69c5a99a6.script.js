if (current.product_instance_id) {
	current.product_instance_id = ''; // Clear out the existing PID
}
action.setRedirectURL(current);
current.insert();
gs.include('ActionUtils');
var au = new ActionUtils();
au.postInsert(current);
