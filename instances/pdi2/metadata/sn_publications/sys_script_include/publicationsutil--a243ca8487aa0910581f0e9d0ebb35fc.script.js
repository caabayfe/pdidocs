var PublicationsUtil = Class.create();
PublicationsUtil.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {

    checkApprovalEligibility: function(document_id) {
        var gr = new GlideRecord('sn_publications_publication');
        if (gr.canRead() && gr.get(document_id)) {
            var start = (new GlideDateTime(gr.getValue("publish_date"))).getNumericValue();
            var now = new GlideDateTime().getNumericValue();

            if (now >= start) {
				return true;
            }
			else{
				return false;
			}
        }
    },
    type: 'PublicationsUtil'
});
