var rtype = new GlideRecord('sys_aw_renderer_type');
rtype.query();
var rtype_sysid = {};
//{layout: "bfacd1a10f517300bb57f4a1ff767e92", record: "56a1aaa10f513300bb57f4a1ff767ede"}
while(rtype.next()){
	rtype_sysid[rtype.getValue("renderer_type")] = rtype.getValue("sys_id");
}
var gr = new GlideRecord('sys_aw_renderer');
gr.query();
while(gr.next()){
	var val = gr.getValue("renderer_type") || "";
	// var dval = gr.getDisplayValue("renderer_type");
	
	// if new record renderer_type then check if value in existing renderer types(rtype_sysid)
	if (val in rtype_sysid){ // old record
		var sys_id = rtype_sysid[val];
		// update renderer type to sys_id instead
		gr.type_ext = sys_id;
		gr.update();
	}
	else{ 
		// if val not in dict, then it could be either new record with sys_id or old record which is not either a 'record' or 'layout' but a new custom one.
		// if not a sys_id, then insert the value in sys_aw_renderer_type and update the record
		if (val.length > 0 && val.length < 32 && val !== 'record' && val!=='layout'){
			// insert into sys_aw_renderer_type, get sys_id and update gr
			var rtype_ins = new GlideRecord('sys_aw_renderer_type');
			rtype_ins.initialize();
			rtype_ins.renderer_type = val;
			var newsysid = rtype_ins.insert();
			// get renderer record
			rtype_ins = new GlideRecord('sys_aw_renderer');
			rtype_ins.addQuery('sys_id',gr.getValue('sys_id'));
			rtype_ins.query();
			// update sysid
			while(rtype_ins.next()){
				rtype_ins.type_ext = newsysid;
				rtype_ins.update();
			} 
		} else if (val.length == 32){
			var updquery = new GlideRecord('sys_aw_renderer');
			updquery.type_ext = val;
			updquery.update();
		}
	}
}
