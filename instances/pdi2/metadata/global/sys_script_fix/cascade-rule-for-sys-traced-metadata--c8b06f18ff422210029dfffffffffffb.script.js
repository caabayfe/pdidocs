function fixReferenceColumns() {
    var myObj = new GlideRecord('sys_dictionary');
    myObj.addEncodedQuery("nameSTARTSWITHsys_traced_metadata^elementSTARTSWITHsys_atf_step");
    myObj.query();
    while (myObj.next()) {
        myObj.reference_cascade_rule = 'none';
        myObj.update();
    }
}
fixReferenceColumns();
