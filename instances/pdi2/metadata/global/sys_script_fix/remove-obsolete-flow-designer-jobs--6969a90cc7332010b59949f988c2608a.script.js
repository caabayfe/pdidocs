var gr = new GlideRecord("sys_trigger");
gr.addEncodedQuery("name=Flow Engine Event Handler^system_id=ACTIVE NODES^job_context=NULL^ORjob_contextNOT LIKEfcQueue")
gr.deleteMultiple();
