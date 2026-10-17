if(event.parm1) {
	var gr = new GlideRecord("pa_rw_aggregate");
	gr.addEncodedQuery('channel_idSTARTSWITH/par/aggregate/^sys_created_by='+(event.parm1));
	gr.deleteMultiple();
} else
	gs.error("Unable to clear PAR record watchers for single score");
