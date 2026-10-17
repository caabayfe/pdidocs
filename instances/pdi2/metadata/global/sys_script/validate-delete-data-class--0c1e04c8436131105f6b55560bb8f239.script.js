(function executeRule(current, previous /*null when async*/ ) {

    var sysID = current.sys_id;
    var link = "";
    var anonymizationPolicies = new GlideRecord('dp_configuration');
    anonymizationPolicies.addQuery("data_class", sysID);
    anonymizationPolicies.query();
    if (anonymizationPolicies.hasNext()) {
        link = "dp_configuration_list.do?sysparm_query=data_class%3D" + sysID;
    }
    if (link) {
        if (anonymizationPolicies.canRead()) {
            var hyperlink = '<a href="' + link + '">' +
                sn_i18n.Message.getMessage("com.glide.data_classification", "anonymization policy") + '</a>';
            var message = sn_i18n.Message.getMessage(
                "com.glide.data_classification",
                "This data class is currently being used by an {link}. You must remove it from the policy before you can delete it.", {
                    link: hyperlink
                }
            );
        } else {
            message = sn_i18n.Message.getMessage("com.glide.data_classification",
                "This data class cannot be deleted. Please change your permissions or contact your admin for help."
            );
        }
        gs.addErrorMessage(message);
        current.setAbortAction(true);
    }

})(current, previous);
