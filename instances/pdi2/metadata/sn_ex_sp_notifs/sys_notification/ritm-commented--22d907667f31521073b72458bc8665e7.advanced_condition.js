answer = true;
//Check if requested for does not have role customer
if(!gs.nil(current.request)){
	
	var requested_for = current.request.requested_for;
	if(!gs.nil(requested_for)){
		var gr = new GlideUser().getUserByID(requested_for);
		if(gr.hasRole("sn_customerservice.customer") && !gr.hasRole("admin")){
			answer = false;
		}
	}
}
