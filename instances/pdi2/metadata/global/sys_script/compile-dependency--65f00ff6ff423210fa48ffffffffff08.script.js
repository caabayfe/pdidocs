(function executeRule(current, previous /*null when async*/ ) {
    try {
        if (!current.client_script) {
            current.client_script_compile_metadata = JSON.stringify({
                imports: {}
            });
            return;
        }

        const {
            acorn
        } = new AcornLatest();

        let ast;
        try {
            ast = acorn.parse(current.client_script, {
                sourceType: 'module',
                ecmaVersion: 'latest'
            });
        } catch (parseErr) {
            gs.addErrorMessage(gs.getMessage('Client script syntax error: {0}', parseErr.message));
            current.setAbortAction(true);
            return;
        }

        const imports = {};

        try {
            acorn.walk.simple(ast, {
                ImportDeclaration: function(node) {
                    const source = node.source.value;
                    if (!source || source.startsWith('./')) {
                        return;
                    }

                    imports[source] = imports[source] || [];

                    node.specifiers.forEach(spec => {
                        if (!spec || !spec.local || !spec.local.name) {
                            return;
                        }

                        if (spec.type === 'ImportSpecifier') {
                            const importedName = spec.imported && spec.imported.name;
                            if (!importedName) {
                                return;
                            }
                            if (importedName === spec.local.name) {
                                imports[source].push(spec.local.name);
                            } else {
                                imports[source].push(`${importedName}~${spec.local.name}`);
                            }
                        }
                    });
                }
            });
        } catch (walkErr) {
            gs.addErrorMessage(gs.getMessage('Client script failed during analysis: {0}', walkErr.message));
            current.setAbortAction(true);
            return;
        }

        current.client_script_compile_metadata = JSON.stringify({
            imports
        });
    } catch (unexpected) {
        gs.addErrorMessage(gs.getMessage('Unexpected error in validation: {0}', unexpected.message));
        current.setAbortAction(true);
    }
})(current, previous);
