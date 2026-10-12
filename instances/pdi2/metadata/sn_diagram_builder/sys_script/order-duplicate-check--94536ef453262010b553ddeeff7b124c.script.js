(function executeRule(current, previous /*null when async*/ ) {
	
        var myObj = new GlideRecord('sn_diagram_builder_shape_template_m2m');

        // 2. Build query
		myObj.addQuery('parent.sys_id', current.parent.sys_id);

        // 3. Execute query 
        myObj.query();

        // 4. Process returned records
        while (myObj.next()) {
            if (current.sys_id != myObj.sys_id && current.order == myObj.order) {
                gs.addErrorMessage(gs.getMessage("Order has to be unique for child shape templates"));
                current.setAbortAction(true);
            }
        }
	
})(current, previous);
