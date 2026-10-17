(function(context, pageParams){  
  
	var text = '<h3 style=\'font-weight:600;font-size: 16px;\'>' + gs.getMessage('Available Channels') + '</h3>';
    var vars = {
        message: text
    };
	
    context.props_details.vars = JSON.stringify(vars);

})(context, pageParams);
