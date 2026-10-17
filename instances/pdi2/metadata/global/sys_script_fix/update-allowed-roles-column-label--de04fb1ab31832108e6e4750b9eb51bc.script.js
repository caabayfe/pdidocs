updateColumnLabel();

    function updateColumnLabel() {
        if (pm.isZboot())
            return;
        var oldLabelValue = 'Allowed roles';
        var newLabelValue = 'Anonymization Allowed Roles';

        var gr = new GlideRecord('sys_dictionary');
        gr.addQuery('name', 'dp_channel');
        gr.addQuery('element', 'allowed_roles');
        gr.addQuery('column_label', oldLabelValue);
        gr.query();
        if (gr.next()) {
            gr.setValue('column_label', newLabelValue);
            gr.update();
            gs.info("Updated the column label for the allowed roles field to '{0}' in the dp_channel dictionary.",
                newLabelValue);
        } else {
            gs.info("No dictionary record found for dp_channel field with column label value '{0}'.", oldLabelValue);
        }
    }
    
