var DocumentUserCanAccess = Class.create();
var TABLE_NAME = 'ds_document_user_can_access_mtom';

DocumentUserCanAccess.prototype = {
    initialize: function() {},
    type: 'DocumentUserCanAccess'
};

DocumentUserCanAccess.isDuplicate = function(current) {
    var d = current.document;
    var u = current.user;
    var p = current.permission;
    var gr = new GlideRecord(TABLE_NAME);
    gr.addQuery('document', d);
    gr.addQuery('permission', p);
    gr.addQuery('user', u);
    gr.addQuery('sys_id', '!=', current.sys_id);
    gr.setLimit(1);
    gr.query();
    if (gr.next()) {
        return true;
    }
    return false;
};
