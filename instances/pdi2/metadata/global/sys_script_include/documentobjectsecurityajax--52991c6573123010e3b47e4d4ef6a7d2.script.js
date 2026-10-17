var DocumentObjectSecurityAjax = Class.create();
DocumentObjectSecurityAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    getDocumentAccess: function() {
        var accessesNeeded = this.getParameter('sysparm_accesses_needed');
        var documentId = this.getParameter('sysparm_documentId');
        var access = {};
        access.canRead = false;
        access.canWrite = false;
        access.canDelete = false;
        if (accessesNeeded) {
            var acs = accessesNeeded.split(',');
            for (var i = 0; i < acs.length; i++) {
                var ac = acs[i];
                var gobs = new global.DocumentObjectSecurity();
                switch (String(ac)) {
                    case 'read':
                        var a = gobs.canReadDocumentId(documentId);
                        access.canRead = a;
                        break;
                    case 'write':
                        var b = gobs.canWriteDocumentId(documentId);
                        access.canWrite = b;
                        break;
                    case 'delete':
                        var c = gobs.canDeleteDocumentId(documentId);
                        access.canDelete = c;
                        break;
                    default:
                }
            }
        }
        var json = new JSON();
        var data = json.encode(access);
        return data;
    },
    type: 'DocumentObjectSecurityAjax'
});
