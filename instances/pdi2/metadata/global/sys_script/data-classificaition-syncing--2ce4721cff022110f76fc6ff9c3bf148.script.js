(function executeRule(current, previous /*null when async*/ ) {

    oldClassifications = previous.classification.split(",");
    newClassifications = current.classification.split(",");
    for (var i = 0; i < oldClassifications.length; i++) {
        if (!newClassifications.includes(oldClassifications[i])) {
            var newGr = new GlideRecord('cmdb_data_classification_mapping');
            newGr.addQuery("data_classification", oldClassifications[i]);
            newGr.addQuery("information_object", current.sys_id);
            newGr.query();
            if (newGr.next()) {
                newGr.setWorkflow(false);
                newGr.deleteRecord();
            }
        }
    }
    for (var j = 0; j < newClassifications.length; j++) {
        if (!oldClassifications.includes(newClassifications[j])) {
            if (newClassifications[j] != "") {
                var oldGr = new GlideRecord('cmdb_data_classification_mapping');
                oldGr.initialize();
                oldGr.data_classification = newClassifications[j];
                oldGr.information_object = current.sys_id;

                var checkGr = new GlideRecord('cmdb_data_classification_mapping');
                checkGr.addQuery("data_classification", newClassifications[j]);
                checkGr.addQuery("information_object", current.sys_id);
                checkGr.query();
                if (!checkGr.next()){
					checkGr.setWorkflow(false);
                    oldGr.insert();
				}
            }
        }
    }

})(current, previous);
