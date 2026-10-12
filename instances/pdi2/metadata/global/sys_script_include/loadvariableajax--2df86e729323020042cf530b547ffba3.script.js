var LoadVariableAjax = Class.create();
LoadVariableAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    loadVariableTemplate: function() {
        var qId = this.getParameter('jvar_id');
        var result = this.newItem("result");
        if (GlideStringUtil.isEligibleSysID(qId)) {
            var gr = new GlideRecord('item_option_new');

            if (!gr.get(qId) || !gr.canRead())
				return result;

            var jr = new GlideJellyRunner();
            jr.setTwoPhase(true);
            jr.setEscaping(false);
            jr.setRenderProperties(new GlideRenderProperties());
            jr.setVariable("jvar_id", this.getParameter('jvar_id'));
            jr.setVariable("jvar_value", this.getParameter('jvar_value'));
            jr.setVariable("jvar_type", this.getParameter('jvar_type'));
            var template = jr.runMacro("variable_template");
            result.setAttribute("template", template);
        }
        return result;
    }
});
