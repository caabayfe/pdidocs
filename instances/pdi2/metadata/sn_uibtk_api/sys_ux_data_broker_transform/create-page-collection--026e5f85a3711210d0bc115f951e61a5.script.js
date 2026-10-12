function transform(input) {
    const name = input.name;
    const description = input.description;
    const component = input.component;
    const controller_dependencies = input.controllerDependencies;
    const controller = input.controller || '';
    const app_shell = input.appShell;
    const type = input.type;

    return new ExtensionPoint().createRecord({
        app_shell,
        component,
        type,
        controller,
        controller_dependencies,
        name,
        description
    });
	
}
