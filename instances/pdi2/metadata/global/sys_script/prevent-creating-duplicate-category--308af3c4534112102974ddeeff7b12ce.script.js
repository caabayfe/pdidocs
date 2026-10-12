(function executeRule(current, previous /*null when async*/ ) {

    var gr = new GlideRecord('analytics_category');

    if (current.operation() == 'insert') {
        var name = current.category_name;

        if (gr.get('category_name', name)) {
            gs.addErrorMessage(gs.getMessage("Duplicate Category name: {0}", name));

            //This code will prevent creating an empty category in dashboard panel when user tries to create duplicate category and fail
            var removeRedundantM2MGR = new GlideRecord('analytics_category_m2m');
            if (removeRedundantM2MGR.get('category', current.getUniqueValue()))
                removeRedundantM2MGR.deleteRecord();

            current.setAbortAction(true);
        }
    }
    if (current.operation() == 'update') {
        var name = current.category_name;
        if (gr.get('category_name', name) && gr.getUniqueValue() != current.sys_id) {
            gs.addErrorMessage(gs.getMessage("Duplicate Category name: {0}", name));
            current.setAbortAction(true);
        }
    }
})(current, previous);
