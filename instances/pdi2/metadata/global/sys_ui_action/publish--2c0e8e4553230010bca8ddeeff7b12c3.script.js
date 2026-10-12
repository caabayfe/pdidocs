// save any changes
current.update();

var result = new sn_ais.Synchronizer().publishDictionary(current.name);
deleteTermsMarkedForDeletion();
if (result) {
	updateStatusForPublishedTerms();
	gs.addInfoMessage(gs.getMessage("Dictionary is published"));
}
else {
    gs.addErrorMessage(gs.getMessage("Failed to publish Dictionary, please check log for more details"));
}
function updateStatusForPublishedTerms() {
    var terms = new GlideRecord('ais_dictionary_term');
    terms.addQuery('dictionary', current.sys_id);
    terms.addActiveQuery();
    terms.query();
    while (terms.next()) {
        terms.state = 'PUBLISHED';
        terms.setWorkflow(false); //Will not fire BR/email notifications   
        terms.update();
    }
}

function deleteTermsMarkedForDeletion() {
    var terms = new GlideRecord('ais_dictionary_term');
    terms.addQuery('dictionary', current.sys_id);
	terms.addQuery('marked_for_deletion', true);
    terms.query();
	terms.setWorkflow(false);
    terms.deleteMultiple();
}
