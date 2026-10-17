var docGR = new GlideRecord('ds_document');
docGR.addEncodedQuery('reviewersISNOTEMPTY');
docGR.query();
while (docGR.next()) {
    var reviewers = docGR.getValue('reviewers');
    if (reviewers && reviewers.trim().length > 0) {
        var reviewerArr = reviewers.trim().split(',');
        for (var i = 0; i < reviewerArr.length; i++) {
            var reviewerGR = new GlideRecord('ds_document_reviewer');
            reviewerGR.initialize();
            reviewerGR.setValue('document', docGR.getValue('sys_id'));
            reviewerGR.setValue('reviewer', reviewerArr[i]);
            reviewerGR.insert();
        }
    }
}

//Disable reviewers column on ds_document
var docDict = new GlideRecord('sys_dictionary');
docDict.addEncodedQuery('GOTOname=ds_document^element=reviewers');
docDict.query();
if (docDict.next()) {
    docDict.setValue('active', false);
    docDict.setValue('read_only', true);
    docDict.update();
}
