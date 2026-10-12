function transform() {
    var isDataSharingOptOut;
    try {
        isDataSharingOptOut = gs.getProperty('sn_generative_ai.data_extraction.opt_out') || 'false';
		
    } catch (error) {
        gs.error('Failed to get the Data extraction opt out property value: '+ error.toString());
    }
    return isDataSharingOptOut === "true";
}
