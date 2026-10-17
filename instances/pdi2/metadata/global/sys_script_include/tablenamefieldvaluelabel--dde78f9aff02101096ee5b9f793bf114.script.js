var TableNameFieldValueLabel = Class.create();
TableNameFieldValueLabel.prototype = Object.extendsObject(AbstractAjaxProcessor, {

	type: 'TableNameFieldValueLabel',
	process: function() {
		var name = this.getParameter('sysparm_name');
		if (!name)
			return '';
		var td = GlideTableDescriptor.get(name);
		if (td.isValid()) {
			var label = td.getLabel();
			if (label)
				return label + ' [' + name + ']';
		}
		return name;
	}
});
