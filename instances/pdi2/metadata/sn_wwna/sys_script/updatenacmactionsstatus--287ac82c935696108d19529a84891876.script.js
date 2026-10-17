(function executeRule(current, previous /*null when async*/ ) {

    // BR for updating the status of the NAcm actions when the status of the skill is changed
    
    let gr = new GlideRecord(sn_wwna.WWNAConstants.TABLES.WWNA_QUICK_ACTIONS);
    gr.addQuery('skill', current.getUniqueValue());
    gr.setValue('active', current.getValue("active"));
    gr.updateMultiple();

})(current, previous);
