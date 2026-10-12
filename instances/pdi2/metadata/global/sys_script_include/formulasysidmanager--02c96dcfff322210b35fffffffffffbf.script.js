var FormulaSysIdManager = Class.create();
FormulaSysIdManager.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    updateSessionForIndicatorMap: function() {
        var variableName = this.getParameter('sysparm_session_var');
        var variableValue = this.getParameter('sysparm_var_value');
        gs.getSession().putProperty(variableName, variableValue);
    },
    type: 'FormulaSysIdManager'
});
