(function executeRule(current, previous /*null when async*/ ) {

    var dsAttributeGr = new GlideRecord("ais_datasource_attribute");
    dsAttributeGr.initialize();
    dsAttributeGr.setValue("datasource", current.sys_id);
    dsAttributeGr.setValue("source", current.source);
    dsAttributeGr.setValue("attribute", "2dd8f14753320010ffaaddeeff7b1293"); //SysId for IndexAttachement
    dsAttributeGr.setValue("value", "false");
    dsAttributeGr.insert();

})(current, previous);
