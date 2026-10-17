(function executeRule(current, previous /*null when async*/) {
 
    // delete the COs constructed
    deleteCOObject(current.getValue("source_structure"));
    deleteCOObject(current.getValue("published_source_structure"));


    function deleteCOObject(sysId) {
        if (gs.nil(sysId))
            return;
        var complexObjectGR = new GlideRecord("sys_complex_object");
        if (complexObjectGR.get(sysId) && complexObjectGR.getValue("name").includes("ih_import_")) {
            complexObjectGR.deleteRecord();
        }
    }

})(current, previous);
