(function runMailScript( /* GlideRecord */ current, /* TemplatePrinter */ template,
    /* Optional EmailOutbound */
    email, /* Optional GlideRecord */ email_action,
    /* Optional GlideRecord */
    event) {

    // Add your code here
    var baseURL = gs.getProperty('glide.servlet.uri');
    var table = current.getTableName();
    var ipFilter = current.ip_address;

    template.print("<a href=" + baseURL + table + "_list.do?sysparm_query=ip_address%3D" + ipFilter + " target='_blank'>View Entries for " + ipFilter + "</a>");

})(current, template, email, email_action, event);
