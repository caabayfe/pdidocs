(function($sp, input, data, options) {
    var display_field = 'short_description';
    var secondary_fields = ['number', 'category', 'publish_date','expiry_date'];
    data.list = [];
    data.count = 0;
	data.list_label = gs.getMessage("Publications");
    var gr = new GlideRecord('sn_publications_publication_contact_m2m');
    gr.addQuery('user', gs.getUser().getID());
    gr.addQuery('publication.stage', 'published');
    gr.orderByDesc('sys_updated_on');
    gr.setLimit(50);
    gr.query();
    while (gr.next()) {
        var record = {};
        var publication = gr.publication.getRefRecord();
		record.sys_id = publication.getValue('sys_id');
        var content = publication.getValue('content_type') == 'wiki' ? publication.getDisplayValue('wiki') : publication.getDisplayValue('text');
        if (!gs.nil(content)) {
            content = content.replace(/(<([^>]+)>)/ig,"");
            content = (content.length > 503) ? content.substr(0, 500) + "..." : content;
        }
        record.text = content;
        record.title = publication.getDisplayValue('short_description');
		record.secondary_fields = [];
		for (var i = 0; i < secondary_fields.length; i++) {
			record.secondary_fields.push(getField(publication, secondary_fields[i]));
		}
        data.list.push(record);
    }
    
	function getField(gr, name) {
		var f = {};
		f.display_value = gr.getDisplayValue(name);
        f.aria_label = gr.getDisplayValue(name);
		f.value = gr.getValue(name);
		var ge = gr.getElement(name);
		if (ge == null)
			return f;
      	if (name == "publish_date") {
			f.display_value = gs.getMessage("Published {0}", [new GlideDateTime(gr.getValue(name)).getLocalDate()]);
			f.aria_label = gs.getMessage("Published on {0}", [new GlideDateTime(gr.getValue(name)).getLocalDate().getByFormat("dd MMMM yyyy")]);
		}
		else if (name == "expiry_date") {
			f.display_value = gs.getMessage("Expires {0}", [new GlideDateTime(gr.getValue(name)).getLocalDate()]);
			f.aria_label = gs.getMessage("Expires on {0}", [new GlideDateTime(gr.getValue(name)).getLocalDate().getByFormat("dd MMMM yyyy")]);
		}
		f.type = ge.getED().getInternalType();
		f.label = ge.getLabel();
		
		return f;
	}

})($sp, input, data, options);
