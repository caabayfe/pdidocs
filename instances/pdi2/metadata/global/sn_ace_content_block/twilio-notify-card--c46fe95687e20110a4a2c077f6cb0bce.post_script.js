(function(context){
	/*
		context = {
			'block_id': @sysId,
			'name': @String,
			'title': @String,
			'subtitle': @String,
			'order': @Number,
			'type': @Object,
			'children': @Array[context],
			'props_details': @Object
		};
	*/
	//put your code here
	paragraph_open = "<p style='font-family: `Open Sans`;font-style: normal;font-weight: 400;font-size: 12px;'>";
	paragraph_end = "</p>";
	context.props_details.rich_text = paragraph_open + gs.getMessage("Notify provides support for SMS and voice channels on the ServiceNow platform for communicating internally with team members and externally with customers and contractors.") + "<br><br><a href='api/now/v1/context_doc_url/Notify' target='_blank' style='text-decoration: none'>" + gs.getMessage("Learn more") + "</a><br>" + paragraph_end;
	context.props_details.image = '/images/IAR_TWILLIO.png';
	
	
})(context);
