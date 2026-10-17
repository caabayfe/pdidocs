var Validators = Class.create();

Validators.isValidAttachment = function isValidAttachment(sysId) {
    var res = {
        isValid: true
    };

    var gr = new GlideRecordSecure(TBWConstants.SYS_ATTACHMENT);
    gr.addQuery("sys_id", sysId);
    gr.query();

    if (!gr.hasNext()) {
        res.isValid = false;
        res.message = gs.getMessage('No attachment found');
    }

    return res;
};

Validators.prototype = {
    initialize: function() {},

    type: 'Validators'
};
