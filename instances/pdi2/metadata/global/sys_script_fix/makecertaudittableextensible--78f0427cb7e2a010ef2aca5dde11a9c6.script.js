(
    function() {
        var source = 'MakeCertAuditTableExtensible';
        var sysDBObjectGr = new GlideRecord("sys_db_object");
        if (!sysDBObjectGr.get("name", "cert_audit")) {
            gs.logError(source + ': cert_audit not found in sys_db_object.', source);
            return;
        }

        sysDBObjectGr.setValue("is_extendable", true);
        if (sysDBObjectGr.update()) {
            gs.log(source + ': Update sys_db_object successful, set is_extendable to true.', source);
        } else {
            gs.logError(source + ': Updating sys_db_object trying to set is_extendable to true.', source);
        }
    })();
