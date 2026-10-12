var a = new global.DocumentObjectSecurity();
answer = a.canDeleteDocumentVersion(current) && (current.getValue("version_state") == "draft" || current.getValue("version_state") == "retired");
