var FormulaValidator = Class.create();
FormulaValidator.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    type: 'FormulaValidator',
	validate: function() {
      var formula = this.getParameter('sysparm_formula_expression');
      var table = this.getParameter('sysparm_table');
      var scopeId = this.getParameter('sysparm_scope_id');
      return FormulaValidatorJS.validateFormula(formula, table, scopeId);
    }
});
