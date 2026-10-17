
		
		addDependentAttributeInAssignedTo(); function addDependentAttributeInAssignedTo() { var gr = new GlideRecord("sys_dictionary"); gr.addQuery("name", "interaction"); gr.addQuery("element", "assigned_to"); gr.query(); while (gr.next()) { gr.setValue("dependent", "assignment_group"); gr.update(); } }
