
      function onCondition() {
	g_form.setVisible("script", true);
	var script = g_form.getValue('script');
	if (script.length != 0)
		return;
	var template = "(function (/*arg1, arg2, ... argument list*/){" +
		"\n\t// Access additional arguments using JavaScript's implicit array-like arguments[0...]\n\n" +
		"\treturn ''; // return formula function result\n\n}).apply(null, inputs);\n";
	g_form.setValue('script', template);
}
