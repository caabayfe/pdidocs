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
        context.props_details.items_list = [];
        var val = "";
        try {
            var gr = new GlideRecord("sys_cs_auto_resolution_configuration");
            gr.addActiveQuery();
            gr.query();
            while (gr.next()) {
                var tableName = gr.getValue("target_table_name");
                var nowGr = new GlideRecord(tableName);
                context.props_details.items_list.push({
                    "id": gr.getValue("target_table_name"),
                    "label": nowGr.getClassDisplayValue()
                });
            }
            if (context.props_details.items_list.length > 0) {
                val = gs.getUser().getPreference("iar.table_name");
                if (!val || val == undefined || val == "") {
                    val = context.props_details.items_list[0].id;
                    var aceUtil = new global.ACEAppBuilderGlobalScopedUtil();
                    aceUtil.updateRecord("sys_user_preference", "cc49485a87530110a4a2c077f6cb0b04", {
                        value: val
                    });
                }
            }
        } catch (e) {
            gs.addErrorMessage(gs.getMessage("Error occured while fetching tables"));
        }
        context.props_details.selected_item = val;
        context.props_details.value = val;
})(context);
