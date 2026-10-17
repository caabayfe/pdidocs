populateRequestField();

function populateRequestField() {
	//If we have a request item, get the original request
	if(!current.request_item.nil()) {
		var request_item = new GlideRecord('sc_req_item');
    	if(request_item.get('sys_id', current.request_item)) {
			current.request = request_item.request;
		}
	} else if(current.parent.sys_class_name == 'sc_request'){
		current.request = current.parent;
	}
}
