function transform(input) {
	if (input.aggregateObject.data.GlideAggregate_Query.length) {
		for (var i = 0; i < input.aggregateObject.data.GlideAggregate_Query.length; i++) {
			var obj = input.aggregateObject.data.GlideAggregate_Query[i];
			
			if(obj.count == 1) {
				input.aggregateObject.data.GlideAggregate_Query[i].groupBy[0].plural = obj.groupBy[0].displayValue.toLowerCase();
			} else {
				var userLanguage = gs.getSession().getLanguage();
				var sd = new GlideRecord('sys_documentation');
				sd.addQuery('name', obj.groupBy[0].value);
				sd.addQuery('language', userLanguage);
				sd.addNullQuery('element');
				sd.query();
				sd.next();
				input.aggregateObject.data.GlideAggregate_Query[i].groupBy[0].plural = sd.plural.toLowerCase();
			}
		}
	}
	return input.aggregateObject;
}
