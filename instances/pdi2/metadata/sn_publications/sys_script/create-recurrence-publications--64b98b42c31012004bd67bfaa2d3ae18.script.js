(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	var content_type;
	var category;
	var short_description;
	var text;
	var wiki;
	var recipient_lists;
	var target_email_template;
	var include_attach_links;
	var skip_notifications;
	var template_id = current.publication_template;
	var pub = new GlideRecord('sn_publications_publication');
	if (pub.get(current.publication_template)) {
		content_type = pub.getValue('content_type');
		category = pub.getValue('category');
		short_description = pub.getValue('short_description');
		text = pub.getValue('text');
		wiki = pub.getValue('wiki');
		recipient_lists = pub.getValue('recipient_lists');
		target_email_template = pub.getValue('target_email_template');
		include_attach_links = pub.getValue('include_attach_links');
		skip_notifications = pub.getValue('skip_notifications');
	}
	
	var recurrence = current.sys_id;
	var interval_type = current.recurrence_interval;
	var custom_interval = parseInt(current.custom_interval_in_days);
	var from = current.recurrence_start;
	var to = current.recurrence_end;
	var gdt_from = new GlideDateTime(from);
	var gdt_to = new GlideDateTime(to);
	var count = 0;
	
	while(gdt_from.compareTo(gdt_to)<0){

		var gr = new GlideRecord("sn_publications_publication");
		gr.initialize();
		gr.publish_date = gdt_from;
		switch(String(interval_type)){
			case 'daily':
				gdt_from.addDaysUTC(1);
				break;
			case 'weekly':
				gdt_from.addWeeksUTC(1);
				break;
			case 'biweekly':
				gdt_from.addWeeksUTC(2);
				break;
			case 'monthly':
				gdt_from.addMonthsUTC(1);
				break;
			case 'custom':
				gdt_from.addDaysUTC(custom_interval);
				break;
			default:
				gdt_from.addDaysUTC(1);
		}
		if(gdt_from.compareTo(gdt_to)>0)
			gr.expiry_date = gdt_to;
		else
			gr.expiry_date = gdt_from;
		gr.recurrence = recurrence;
		gr.content_type = content_type;
		gr.category = category;
		gr.short_description = short_description;
		gr.text = text;
		gr.wiki = wiki;
		gr.publication_template = template_id;

		//copy recipient list
		gr.recipient_lists = recipient_lists;
		gr.include_attach_links = include_attach_links;
		gr.target_email_template = target_email_template;
		gr.skip_notifications = skip_notifications;
		
		var gr_id = gr.insert();
		count++;
		
		//copy attachment
		new GlideSysAttachment.copy("sn_publications_publication", template_id, "sn_publications_publication", gr_id);
		
	}
	if(count==1)
		gs.addInfoMessage(gs.getMessage("1 publication has been created!"));
	else
		gs.addInfoMessage(gs.getMessage("{0} publications have been created!", count));	
})(current, previous);
