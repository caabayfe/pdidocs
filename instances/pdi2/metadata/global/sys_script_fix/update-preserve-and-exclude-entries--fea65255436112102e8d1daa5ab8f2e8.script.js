updateExisting();

function updateExisting() {
    //update table name used in clone records
    _updateExistingRecords();

    //update clone records
    _updatePreservers();
    _updateExcludes();
}

//updates preserve entries for hermes/kafka tables to default=true
function _updatePreservers() {
    var grPreserver = new GlideRecord("clone_data_preserver");
    //sys_ids are for sys_kafka_topic and sys_kafka_namespace
    grPreserver.addEncodedQuery("tableLIKEhermes_^ORsys_id=94fe33b2430331101f401daa5ab8f25a^ORsys_id=3fbe7f72430331101f401daa5ab8f25d");
    grPreserver.setValue("default", true);
    grPreserver.updateMultiple();
}

//updates exclude entries for hermes/kafka tables to default=true
function _updateExcludes() {
    var grExclude = new GlideRecord("clone_data_exclude");
    //sys_ids are for sys_kafka_topic and sys_kafka_namespace
    grExclude.addEncodedQuery("nameLIKEhermes_^ORsys_id=a1914c07430331101f401daa5ab8f241^ORsys_id=dc810c07430331101f401daa5ab8f228");
    grExclude.setValue("default", true);
    grExclude.updateMultiple();
}

//updates reference to hermes_app_ids to hermes_app_services
function _updateExistingRecords() {
    var grPreserver = new GlideRecord("clone_data_preserver");
    grPreserver.addQuery("sys_id", "7f4da990431331103464827cfbb8f2c5");
    grPreserver.query();
    if (grPreserver.next()) {
        grPreserver.setValue("name", "Hermes Application Services Preserver");
        grPreserver.setValue("table", "hermes_app_services");
        grPreserver.update();
    }

    var grExclude = new GlideRecord("clone_data_exclude");
    grExclude.addQuery("sys_id", "ee6d6d90431331103464827cfbb8f24e");
    grExclude.query();
    if (grExclude.next()) {
        grExclude.setValue("name", "hermes_app_services");
        grExclude.update();
    }
}
