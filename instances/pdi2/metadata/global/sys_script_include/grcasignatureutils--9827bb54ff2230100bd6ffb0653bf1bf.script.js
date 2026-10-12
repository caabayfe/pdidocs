var GRCASignatureUtils = Class.create();
GRCASignatureUtils.prototype = {
    initialize: function() {
    },
	
	hasSignatureRecord: function(grRca) {
		var grSignature = new GlideRecord('sn_kmf_record_signature');
		grSignature.addQuery('document_id', grRca.getUniqueValue());
		grSignature.setLimit(1);
		grSignature.query();
		return grSignature.next();
	},

    type: 'GRCASignatureUtils'
};
