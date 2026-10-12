var AuthenticationHelper = Class.create();
AuthenticationHelper.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    getInstanceURL: function() {
        return SNC.AuthenticationHelper.getInstanceURL();
    },
    type: 'AuthenticationHelper'
});
