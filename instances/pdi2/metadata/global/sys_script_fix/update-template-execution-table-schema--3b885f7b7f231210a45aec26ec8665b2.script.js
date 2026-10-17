gs.info("Started schema update of table dp_app_profile_template_execution and modification of package info of template tables.");
execute();

function execute() {
    /** 
     * Since this fix script is moved to OOB classification plugin, it should check following scenarios:
     * 1) Existing customer upgrade Y to Z. If privacy installed in Y, modify the schema and package info.
     * 2) Existing customer upgrade Y to Z. If privacy is not installed in Y, do not modify the schema and package info.
     * 3) Any new customer onboarded with SNOW will not have privacy, hence do not modify the schema and package info.
     */
    if (!isPrivacyInstalled()) {
        gs.info("Skipping schema update of table dp_app_profile_template_execution and modification of package info of template tables as privacy is not installed.");
        return;
    }
    var classificationPckgId = getClassificationPackageId();
    if (classificationPckgId) {
        updateTemplateSchemaPackages(classificationPckgId);
        updateTemplateAclPackages(classificationPckgId);
        updateTemplateAclRolePackages(classificationPckgId);
    } else {
        gs.info("Skipping package update for template tables as com.glide.data_classification package info is not present");
    }
    updateAttributes();
    removeValueJsonColumn();
}

function isPrivacyInstalled() {
    var gr = new GlideRecord("sys_db_object");
    gr.addQuery("name", "dp_job");
    gr.query();
    return gr.hasNext();
}

function getClassificationPackageId() {
    var gr = new GlideRecord("sys_package");
    gr.addQuery("source", "com.glide.data_classification");
    gr.query();
    if (gr.next()) {
        return gr.getValue("sys_id");
    }
    return null;
}

function updateTemplateSchemaPackages(classificationPckgId) {
    var gr = new GlideRecord("sys_db_object");
    gr.addQuery("name", "IN", "dp_app_profile,dp_app_profile_dataclass,dp_app_profile_db_channel_category,dp_app_profile_template,dp_app_profile_template_execution,dp_app_profile_template_has_dc");
    gr.setValue("sys_package", classificationPckgId);
    gr.updateMultiple();
}

function updateTemplateAclPackages(classificationPckgId) {
    var gr = new GlideRecord("sys_security_acl");
    gr.addQuery("name", "STARTSWITH", "dp_app_profile");
    gr.setValue("sys_package", classificationPckgId);
    gr.updateMultiple();
}

function updateTemplateAclRolePackages(classificationPckgId) {
    var gr = new GlideRecord("sys_security_acl_role");
    gr.addEncodedQuery("sys_security_acl.nameSTARTSWITHdp_app_profile");
    gr.setValue("sys_package", classificationPckgId);
    gr.updateMultiple();
}

function updateAttributes() {
    gs.info("Now removing the mandatory attribute from dp_app_profile_template_execution[template]");
    SNC.DictionaryAttribute.set("dp_app_profile_template_execution", "template", "mandatory", false);
}

function removeValueJsonColumn() {
    gs.info("Now dropping dp_app_profile_template_execution[value_json]");
    gs.dropColumn("dp_app_profile_template_execution", "value_json");
}
