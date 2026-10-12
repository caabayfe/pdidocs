function addQualifiers() {
    // add qualifier for source scope
    var gr = new GlideRecord("sys_dictionary");
    gr.addQuery("name", "sys_restricted_caller_access");
    gr.addQuery("element", "source_scope");
    gr.query();
    gr.next();
    gr.setValue("use_reference_qualifier", "advanced");
    gr.setValue("reference_qual", "javascript:new GlobalRCAScopeReferenceQualifier().sourceQualifier(current)");
    gr.update();

    // add qualifier for target scope
    gr = new GlideRecord("sys_dictionary");
    gr.addQuery("name", "sys_restricted_caller_access");
    gr.addQuery("element", "target_scope");
    gr.query();
    gr.next();
    gr.setValue("use_reference_qualifier", "advanced");
    gr.setValue("reference_qual", "javascript:new GlobalRCAScopeReferenceQualifier().targetQualifier(current)");
    gr.update();
}

addQualifiers();
