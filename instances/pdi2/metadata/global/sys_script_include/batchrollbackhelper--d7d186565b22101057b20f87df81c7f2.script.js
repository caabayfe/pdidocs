var BatchRollbackHelper = Class.create();
BatchRollbackHelper.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    getRollbackInformation: function() {
      var sysId = this.getParameter('sysparm_id');
      var type = this.getParameter('sysparm_type');
      var json = sn_batch_install.BatchInstallAPI.getRollbackInfoAsJSON(sysId, type);
      return json;
    },

    type: 'BatchRollbackHelper'
});
