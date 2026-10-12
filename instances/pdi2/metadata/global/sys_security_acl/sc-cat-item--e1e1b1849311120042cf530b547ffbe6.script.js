if(current.sc_catalogs.toString()){
	var gr =new GlideRecord('sc_catalog');
	gr.addEncodedQuery('sys_idIN'+current.sc_catalogs.toString());
	gr.addQuery('manager',gs.getUserID()).addOrCondition('editors','CONTAINS',gs.getUserID());
	gr.query();
	if(gr.next())
		answer= true;
}
else
	answer= true;
