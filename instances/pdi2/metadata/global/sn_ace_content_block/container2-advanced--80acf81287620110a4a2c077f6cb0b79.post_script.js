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
	context.props_details.stage = 2;
        if (context.children.length > 3)
           context.children = [context.children[0], context.children[1], context.children[2]];
        else {
            var res = context.children.map(function(item) {
                if (item != null) return item;
            });
            context.children = res;
        }
	
})(context);
