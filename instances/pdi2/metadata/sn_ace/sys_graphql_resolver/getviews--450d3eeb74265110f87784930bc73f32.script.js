(function process( /*ResolverEnvironment*/ env) {

    var views = [];
    var table = env.getArguments().table;

    var formGr = new GlideRecord('sys_ui_form');
    formGr.addQuery('name', table);
    formGr.query();

    while (formGr.next()) {
        views.push({
            id: formGr.getValue('view'),
            name: formGr.getDisplayValue('view.name'),
            label: formGr.getDisplayValue('view.title')
        });
    }

    return views;

})(env);
