var enableDataSnapshots = Class.create();
enableDataSnapshots.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    getInstanceAndTableInfo: function() {
        var sysIDsObj = this.getParameter('sysparm_sysId');
        var sysIDs = String(sysIDsObj);	

        return SNC.EnableMLB.enableMLB(sysIDs);
    },
    type: 'enableDataSnapshots'
});
