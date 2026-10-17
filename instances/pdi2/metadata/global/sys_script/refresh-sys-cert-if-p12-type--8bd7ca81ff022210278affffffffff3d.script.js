(function executeRule(current, previous /*null when async*/ ) {
    // check if the table_name is sys_certificate
    if (current.table_name != 'sys_certificate')
        return;

    // Query sys_cert and refresh it if its an active p12 type keystore.
    var cgr = new GlideRecord("sys_certificate");
    cgr.addQuery('sys_id', current.table_sys_id);
    cgr.addQuery('type', 'pkcs12_key_store');
    cgr.addQuery('active', 'true');
    cgr.query();

    if (!cgr.next())
        return;

    // update the sys_cert to trigger the cert validation.
    cgr.setForceUpdate(true);
    cgr.update();

})(current, previous);
