(function() {
    var CONST_DELETE = "delete";

    var _update_reference_cascade_rule = function(table_name, element, action) {
        var gr = new GlideRecord('sys_dictionary');
        gr.addQuery('name', table_name);
        gr.addQuery('element', element);
        gr.query();
        if (gr.next()) {
            gr.setValue('reference_cascade_rule', action);
            return gr.update();
        }
    };

    if (!pm.isZboot()) {
        var table_elements_map = {
            "ml_cluster_detail": {
                "solution": CONST_DELETE,
                "cluster_id": CONST_DELETE
            },
            "ml_cluster_summary": {
                "solution": CONST_DELETE
            },
            "ml_update_set": {
                "solution": CONST_DELETE
            },
            "ml_cluster_sol_update": {
                "solution": CONST_DELETE
            },
        };

        for (var table_name in table_elements_map) {
            for (var element in table_elements_map[table_name]) {
                var action = table_elements_map[table_name][element];
                _update_reference_cascade_rule(table_name, element, action);
				gs.info("Added reference cascade rules for the following- table: " + table_name + ", column: " + element + ", action: " + action);
            }
        }
    }
    return;
}());
