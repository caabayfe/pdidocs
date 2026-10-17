(function(context) {
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
    context.props_details.items_list = [{
        "id": "id1",
        "label": gs.getMessage("30 Days")
    }, {
        "id": "id2",
        "label": gs.getMessage("60 Days")
    }, {
        "id": "id3",
        "label": gs.getMessage("90 Days")
    }];
    var val = gs.getUser().getPreference("iar.num_of_days");
    if (!val || val == undefined) {
        val = 30;
        var aceUtil = new global.ACEAppBuilderGlobalScopedUtil();
        aceUtil.updateRecord("sys_user_preference", "cb99485a87530110a4a2c077f6cb0b25", {
            value: val
        });
    }
    switch (String(val)) {
        case '30':
            context.props_details.selected_item = "id1";
            break;
        case '60':
            context.props_details.selected_item = "id2";
            break;
        case '90':
            context.props_details.selected_item = "id3";
            break;

    }
    context.props_details.value = val;

})(context);
