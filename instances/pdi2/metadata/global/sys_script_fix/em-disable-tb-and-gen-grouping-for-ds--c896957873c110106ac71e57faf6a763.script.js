gs.log("Run 'EM - Disable TB and Gen Grouping for DS' fix script.");
//Text Based and CI Class Based Grouping are part of Alert Grouping improvements introduced in Paris.
var EM_analytics_generalized_patterns_enabled = "sa_analytics.generalized_patterns_enabled";
var EM_text_based_group_enabled = "sa_analytics.text_based_group_enabled";
var EM_Properties = [EM_analytics_generalized_patterns_enabled, EM_text_based_group_enabled];

if (gs.getProperty("glide.sys.domain.partitioning") === "true") {
	gs.log("The 'EM - Disable TB and Gen Grouping for DS' is running on domain separated instance");
    var propertiesGr = new GlideRecord('sys_properties');
    propertiesGr.addQuery("name", "IN", EM_Properties);
    propertiesGr.query();
    while (propertiesGr.next()) {
        if (propertiesGr.getValue("value") == "true") {
            propertiesGr.setValue("value", false);
            propertiesGr.update();
            gs.log("'EM - Disable TB and Gen Grouping for DS' new value of " + propertiesGr.getValue("name") + " is " + propertiesGr.getValue("value"));
        }
    }
}
gs.log("Finish to run 'EM - Disable TB and Gen Grouping for DS' fix script after EM upgrade.");
