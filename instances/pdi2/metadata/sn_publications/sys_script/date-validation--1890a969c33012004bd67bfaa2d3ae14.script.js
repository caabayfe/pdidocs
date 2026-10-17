(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	if((!current.publish_date.nil()) && (!current.expiry_date.nil()) && (current.stage=='review' || (current.stage=='author' && previous.stage!='review'))){
		var now = new GlideDateTime().getNumericValue();
		var start = (new GlideDateTime(current.getValue('publish_date'))).getNumericValue();  
		var end = (new GlideDateTime(current.getValue('expiry_date'))).getNumericValue();
		
		if (now > start && !(current.operation()=="update" && current.stage=="author" && previous.stage!="author")) {
			gs.addErrorMessage(gs.getMessage('Publish date must be after current time'));
			current.setAbortAction(true);
		}
		
		if (start >= end) {
			gs.addErrorMessage(gs.getMessage('Publish date must be before Expiry date'));
			current.setAbortAction(true);
		}
		
		//compare with recurrence start/end date
		if (!current.recurrence.nil()){
			var gr = new GlideRecord('sn_publications_recurrence');
			if(gr.get(current.recurrence)){
				var rec_start = new GlideDateTime(gr.getValue('recurrence_start'));
				var rec_end = new GlideDateTime(gr.getValue('recurrence_end'));
				
				if(start < rec_start.getNumericValue() || end > rec_end.getNumericValue()){
					var linkTxt = gs.getMessage("recurrence");
					var link = "<b><a href='/sn_publications_recurrence.do?sys_id="+current.recurrence+"'>"+linkTxt+"</a></b>";
					var warnMsg = gs.getMessage("This publication is associated with this {0} between From: {1}  To : {2}",[link,rec_start.getDisplayValue(),rec_end.getDisplayValueInternal()]);
					gs.addErrorMessage(warnMsg);
					current.setAbortAction(true);
				}
		
			}

		}
		
	}
})(current, previous);
