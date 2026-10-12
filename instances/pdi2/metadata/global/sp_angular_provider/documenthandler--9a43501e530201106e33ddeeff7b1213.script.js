function() {

    function deleteDocument(documentSysId) {

        var ajaxHelper = new GlideAjax('DocumentObjectManager');
        ajaxHelper.addParam('sysparm_name', 'deleteDocumentFromClient');
        ajaxHelper.addParam('sysparm_document_sys_id', documentSysId);

        ajaxHelper.getXML(function(r){});
    }

    return {
        deleteDocument: deleteDocument
    }
}
