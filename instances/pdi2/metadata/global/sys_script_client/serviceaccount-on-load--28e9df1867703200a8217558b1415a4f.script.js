function onLoad() {
    g_form.setMandatory("account_id", true);
    var datacenterType = g_form.getValue("datacenter_type");
    if (datacenterType == "cmdb_ci_vcenter_datacenter")
        g_form.setMandatory("datacenter_url", true);


    if (datacenterType == 'cmdb_ci_azure_datacenter') {
        g_form.setLabelOf('is_master_account', "Is Management Group");
        g_form.setReadOnly('is_master_account', true);
    }

    if (datacenterType == 'cmdb_ci_google_datacenter') {
        g_form.setLabelOf('is_master_account', "Is Folder");
        g_form.setReadOnly('is_master_account', true);
    }

    g_form.setVisible("exclude_from_discovery", false);
    g_form.setReadOnly("exclude_from_discovery", true);
}
