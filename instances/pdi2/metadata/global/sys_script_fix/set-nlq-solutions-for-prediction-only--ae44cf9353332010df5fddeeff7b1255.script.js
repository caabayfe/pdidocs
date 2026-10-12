(function() {
	var nlqPrefix = 'nlq_model_info';
	var mlSolutionGR = new GlideRecord('ml_solution');
	mlSolutionGR.addQuery('state','waiting_for_training');
	mlSolutionGR.query();
	while (mlSolutionGR.next()) { 
		var solutionName = mlSolutionGR.getValue('solution_name').substring(0,nlqPrefix.length);
		if(solutionName==nlqPrefix){
			mlSolutionGR.setValue('state','solution_complete');
			mlSolutionGR.setWorkflow(false);
			mlSolutionGR.update();
		}
	}
})();
