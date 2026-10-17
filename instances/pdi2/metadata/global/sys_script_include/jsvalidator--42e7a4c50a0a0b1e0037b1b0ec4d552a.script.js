var JSValidator = Class.create();

JSValidator.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    validate: function() {
      var script = this.getParameter('sysparm_js_expression');
      var scopeId = this.getParameter('sysparm_scope');
      var table = this.getParameter('sysparm_table');
      var sysId = this.getParameter('sysparm_id');
      var useEsLatest = this.getParameter('sysparm_use_es_latest') == 'true';
      if (sysId == '-1' && !useEsLatest) 
        return GlideSystemUtilScript._getScriptErrorForTable(script, scopeId, table);
      return GlideSystemUtilScript._getScriptErrorWithToggle(script, scopeId, table, sysId, useEsLatest);
    } 
});
