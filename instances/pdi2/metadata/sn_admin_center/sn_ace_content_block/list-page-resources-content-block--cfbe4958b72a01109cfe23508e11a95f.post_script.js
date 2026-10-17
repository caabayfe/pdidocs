(function(context){
	/*
		context = {
			'block_id': @sysId,
			'name': @String,
			'title': @String,
			'subtitle': @String,
			'order': @Number,
			'type': @Object,
			'children': @Array[context],
			'props_details': @Object
		};
	*/
	//put your code here
	var vars = {};
	vars['header'] = gs.getMessage('How do adoption blueprints guide your installations?');
	vars['body1'] = gs.getMessage('Each blueprint focuses on a strategic priority. It\'s tailored to you and suggests apps and plugins best suited for the goal. By following the blueprint, you can make measurable progress in each area.');
	vars['body2'] = gs.getMessage('The blueprints suggest an ideal order of installation and adoption. You can follow the suggested order or adjust to fit your needs.');
	context.props_details.vars = JSON.stringify(vars);
	
})(context);
