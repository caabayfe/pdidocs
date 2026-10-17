answer = can_write_source();

function can_write_source(){
	if (gs.hasRole("contact_admin") || gs.hasRole("sn_comm_management.comm_plan_admin") || gs.hasRole("sn_comm_management.comm_plan_manager"))
		return true;
	else{
		if (current.table.nil())
			return false;
		else {
			var source = new GlideRecord(current.table);
			return (source.isValid() && source.get(current.document) && source.canWrite());
		}
	}
}
