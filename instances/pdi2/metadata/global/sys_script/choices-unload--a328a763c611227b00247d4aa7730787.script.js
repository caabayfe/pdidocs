if (current.operation() == 'update') {
	if ((current.name && previous.name && current.name != previous.name) ||
	(current.element && previous.element && current.element != previous.element)) {
		var choiceSetGR = new GlideRecord('sys_choice_set');
		choiceSetGR.addQuery('name', current.name);
		choiceSetGR.addQuery('element', current.element);
		choiceSetGR.query();
		if (!choiceSetGR.next()) {
			choiceSetGR.initialize();
			choiceSetGR.name = current.name;
			choiceSetGR.element = current.element;
			choiceSetGR.insert();
		}
	}
}

gs.unloadChoices(current.name, current.element);
// a sys_choice can have the table and element edited, resulting in an add to a choice set but also a
// removal from the original choice set
// in that case we want to export both choice sets
if ((current.name && previous.name && current.name != previous.name) ||
	(current.element && previous.element && current.element != previous.element))
	gs.unloadChoices(previous.name, previous.element);
