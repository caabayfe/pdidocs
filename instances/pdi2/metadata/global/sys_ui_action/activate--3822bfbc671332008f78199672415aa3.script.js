action.setRedirectURL(current);
var solution = new GlideRecord('ml_solution');
solution.addQuery('ml_capability_definition',current.getValue('ml_capability_definition'));
solution.addQuery('active', true);
solution.query();
while (solution.next()) {
	solution.setValue('active', false);
	solution.setValue('last_activated_date',new GlideDateTime());
	solution.update();
}
current.setValue('active', true);
current.update();
