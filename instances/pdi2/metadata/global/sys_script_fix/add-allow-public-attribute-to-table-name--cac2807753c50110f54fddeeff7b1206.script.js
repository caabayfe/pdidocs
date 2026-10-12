gs.log('Start adding dictionary attribute allow_public for table_name of help_content');
SNC.DictionaryAttribute.set('help_content', 'table_name', 'allow_public', 'true');
gs.log('Finished adding dictionary attribute allow_public for table_name of help_content');

var gr = new GlideRecord("sys_dictionary");
	gr.addActiveQuery();
	gr.addQuery("name", "help_content");
	gr.addQuery("element", "records");
	gr.query();
	
	if(gr.next()) {
		var internalType = gr.getValue("internal_type");
		if(internalType != "glide_list") {
			gs.log("Update internal_type of help_content.records field to glide_list");
			gr.setValue("internal_type", "glide_list");
			gr.update();
		}
	}
