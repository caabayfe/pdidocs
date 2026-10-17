function doInsertAndStay() {
	var saveMe = current;
	if (current.product_instance_id) {
		current.product_instance_id = ''; // Clear out the existing PID
	}
	/* eslint-disable-next-line no-undef */
	insertRecord(saveMe);
	action.setRedirectURL(saveMe);
}
doInsertAndStay();
