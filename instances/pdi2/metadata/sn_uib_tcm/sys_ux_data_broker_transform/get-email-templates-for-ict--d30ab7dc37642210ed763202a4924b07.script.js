function transform(input) {
    var output = {
        results: []
    };
    var commTaskId = input.comm_task_id;
    var commTaskTable = input.comm_task_table;
    if (gs.nil(commTaskId))
        return getEmailTemplates();

    var current = new GlideRecord("comm_channel");
    current.addEncodedQuery("comm_channel_config=1513471e870013000e3dd61e36cb0bf2^comm_task=" + commTaskId, true);
    current.setLimit(1);
    current.query();
    if (current.next())
        return getEmailTemplates(current);
    else
        return getEmailTemplates();

    function getEmailTemplates(current) {
        var emailTemplateEncodedQuery = "";
        var communicationManagementUtil = new sn_comm_management.CommunicationManagementUtil();

        if (typeof communicationManagementUtil.getEmailTemplateFilter == "function")
            emailTemplateEncodedQuery = communicationManagementUtil.getEmailTemplateFilter(current);
        else {
            if (gs.nil(commTaskTable))
                return output;
            else
                emailTemplateEncodedQuery = "table=" + commTaskTable;
        }

        var emailTemplateGr = new GlideRecord("sys_email_client_template");
        emailTemplateGr.addEncodedQuery(emailTemplateEncodedQuery, true);
        emailTemplateGr.orderBy("order");
        emailTemplateGr.orderBy("name");
        emailTemplateGr.query();
        while (emailTemplateGr.next()) {
            output.results.push({
                "_row_data": {
                    "displayValue": emailTemplateGr.getDisplayValue(),
                    "uniqueValue": emailTemplateGr.getUniqueValue()
                },
                "body": {
                    "displayValue": emailTemplateGr.getDisplayValue("body"),
                    "value": emailTemplateGr.getValue("body")
                },
                "body_html": {
                    "displayValue": emailTemplateGr.getDisplayValue("body_html"),
                    "value": emailTemplateGr.getValue("body_html")
                },
                "content_type": {
                    "displayValue": emailTemplateGr.getDisplayValue("content_type"),
                    "value": emailTemplateGr.getValue("content_type")
                },
                "name": {
                    "displayValue": emailTemplateGr.getDisplayValue("name"),
                    "value": emailTemplateGr.getValue("name")
                },
                "sys_name": {
                    "displayValue": emailTemplateGr.getDisplayValue("sys_name"),
                    "value": emailTemplateGr.getValue("sys_name")
                }
            });
        }
        return output;
    }

}
