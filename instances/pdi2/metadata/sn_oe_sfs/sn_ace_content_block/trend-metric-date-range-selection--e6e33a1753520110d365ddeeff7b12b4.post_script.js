	(function(context) {

    context.props_details.items = [{
            "id": "l1",
            "label": gs.getMessage("Last 7 days"),
            "value": {
                "start_date": new GlideDateTime(gs.daysAgo(7)).getDate().toString(),
                "end_date": new GlideDateTime().getDate().toString()
            }
        },
        {
            "id": "l2",
            "label": gs.getMessage("Last 10 days"),
            "value": {
                "start_date": new GlideDateTime(gs.daysAgo(10)).getDate().toString(),
                "end_date": new GlideDateTime().getDate().toString()
            }
        },
        {
            "id": "l3",
            "label": gs.getMessage("Last 30 days"),
            "value": {
                "start_date": new GlideDateTime(gs.daysAgo(30)).getDate().toString(),
                "end_date":  new GlideDateTime().getDate().toString()
            }
        }
    ];
	

})(context);
	
