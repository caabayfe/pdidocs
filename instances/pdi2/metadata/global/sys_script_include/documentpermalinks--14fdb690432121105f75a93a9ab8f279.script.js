var DocumentPermalinks = Class.create();
DocumentPermalinks.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    type: 'DocumentPermalinks',
    create: function(docId, linkType, linkAccessType, linkExpiration, linkActive) {


        var docGR = new GlideRecord('ds_document');

        if (!docId)
            return JSON.stringify({
                success: false,
                error_message: 'Document ID is required'
            });

        if (!docGR.get(docId))
            return JSON.stringify({
                success: false,
                error_message: 'Invalid document'
            });

        if (docGR.getValue('state') == 'expired')
            return JSON.stringify({
                success: false,
                error_message: 'Failed to create Permalink: Document is expired'
            });

        var v = new global.DocumentObjectManager();
        var preCheck = v.checkAndUpdateSharePermission(docId);
        if (preCheck.success == true && preCheck.shareDisabled == true)
            return JSON.stringify({
                success: false,
                error_message: "Failed to create Permalink: Document classification doesn't support permalink creation"
            });

        var input = this.getSysDocPermalink(null, docId, linkType, linkAccessType, linkExpiration, linkActive);
        var docPermalinkAPI = new sn_doc_services.DocumentPermalinkAPI();
        var permalink = docPermalinkAPI.createPermalink(input);
        return JSON.stringify(permalink);

    },
    update: function(sysId, docId, linkType, linkAccessType, linkExpiration, linkActive) {
        var input = this.getSysDocPermalink(sysId, docId, linkType, linkAccessType, linkExpiration, linkActive);
        var docPermalinkAPI = new sn_doc_services.DocumentPermalinkAPI();
        var permalink = docPermalinkAPI.updatePermalink(input);
        return JSON.stringify(permalink);
    },
    deleteLink: function(sysId) {
        var sys_id = sysId || this.getParameter("sys_id");
        var docPermalinkAPI = new sn_doc_services.DocumentPermalinkAPI();
        var results = docPermalinkAPI.deletePermalink(sys_id);
        return JSON.stringify(results);
    },
    getLinks: function(docId) {
        var doc_id = docId || this.getParameter("doc_id");
        var docPermalinkAPI = new sn_doc_services.DocumentPermalinkAPI();
        var response = docPermalinkAPI.getPermalinks(doc_id);
        var results = new Object();
        if (response.success == true) {
            var permalinkList = response.permalinks;
            if (typeof permalinkList !== 'undefined' && permalinkList.length > 0) {
                results = permalinkList[0];
            }
        } else {
            results = response;
        }
        return JSON.stringify(results);
    },
    getSysDocPermalink: function(sysId, docId, linkType, linkAccessType, linkExpiration, linkActive) {
        var sys_id = sysId || this.getParameter("sys_id");
        var doc_id = docId || this.getParameter("doc_id");
        var type = linkType || this.getParameter("type");
        var accessType = linkAccessType || this.getParameter("access_type");
        var expiration = linkExpiration || this.getParameter("expiration") || '';
        var active = linkActive || this.getParameter("active");

        var input = new sn_doc_services.DocumentPermalink();
        input.sysId(sys_id);
        input.documentId(doc_id);
        input.type(type);
        input.accessType(accessType);
        input.expiration(expiration);
        input.active(active);
        return input;
    }
});
