var rec = new GlideRecord('sys_sg_screen');

if (rec.getElement('parent') !== null)
	answer = "sys_sg_screen";
else
	/*
		since the 'parent' field was removed in a previous release
		its removal causes the query to returns all the records
		and we want no records to be returned in that case.
	*/	
	answer = "";
