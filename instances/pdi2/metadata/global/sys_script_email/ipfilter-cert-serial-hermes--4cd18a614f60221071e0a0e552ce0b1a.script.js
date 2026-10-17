(function runMailScript( /* GlideRecord */ current, /* TemplatePrinter */ template,
    /* Optional EmailOutbound */
    email, /* Optional GlideRecord */ email_action,
    /* Optional GlideRecord */
    event) {

    var dotwalk_serial = current.certificate_serial_number.serial_number;
    //certificate_serial_number may have value that does not correspond to sys_kmf_certificate record
    var serial = current.certificate_serial_number;
    var template_serial = "";
    if (!gs.nil(dotwalk_serial))
        template_serial = dotwalk_serial;
    else if (gs.nil(dotwalk_serial) && !gs.nil(serial))
        template_serial = current.certificate_serial_number.toString() + "<br />**Certificate used does not exist in sys_kmf_certificate table";
    else
        template_serial = "**Certificate serial number was not provided";

    template.print(template_serial);
})(current, template, email, email_action, event);
