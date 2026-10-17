(function executeRule(current, previous /*null when async*/ ) {
    const GLIDE_WIDGETS_PREFIX = '@servicenow/glide-widgets/';
    /**
     * Extracts the call chain from a callee node as an array of names.
     * e.g., this.services.i18n.getMessage → ['this', 'services', 'i18n', 'getMessage']
     * @param {Object} node - Callee node (MemberExpression or Identifier)
     * @returns {string[]} Array of names in the chain
     */

    function getCalleeChain(node) {
        const chain = [];
        let current = node;
        while (current) {
            if (current.type === 'Identifier') {
                chain.unshift(current.name);
                break;
            } else if (current.type === 'MemberExpression') {
                if (current.property && current.property.name) {
                    chain.unshift(current.property.name);
                }
                current = current.object;
            } else if (current.type === 'ThisExpression') {
                chain.unshift('this');
                break;
            } else {
                break;
            }
        }
        return chain;
    }

    /**
     * Checks if a callee chain matches an i18n.getMessage pattern.
     * Supports: i18n.getMessage, this.services.i18n.getMessage
     * @param {string[]} chain - The callee chain
     * @returns {boolean} True if it matches an i18n pattern
     */
    function isI18nGetMessage(chain) {
        const str = chain.join('.');
        return str === 'i18n.getMessage' || str === 'this.services.i18n.getMessage';
    }

    /**
     * Recursively extracts literal values from an AST node.
     * Skips non-literal nodes (e.g., function references, member expressions).
     * @param {Object} node - AST node to extract from
     * @returns {*} Extracted value or undefined if not a literal
     */
    function extractLiteral(node) {
        if (!node) return undefined;
        switch (node.type) {
            case 'Literal':
                return node.value;
            case 'TemplateLiteral':
                // Only extract simple template literals with no interpolation
                if (node.expressions.length === 0 && node.quasis.length === 1) {
                    return node.quasis[0].value.cooked;
                }
                return undefined;
            case 'ArrayExpression':
                return node.elements.map(extractLiteral).filter(v => v !== undefined);
            case 'ObjectExpression': {
                const obj = {};
                node.properties.forEach(prop => {
                    const key = prop.key.name || prop.key.value;
                    const value = extractLiteral(prop.value);
                    if (value !== undefined) {
                        obj[key] = value;
                    }
                });
                return obj;
            }
            default:
                // Skip non-literals (Identifier, MemberExpression, FunctionExpression, etc.)
                return undefined;
        }
    }

    /**
     * Returns true when an AST statement node has no executable effect.
     * Recognizes EmptyStatement and IIFEs whose function body is a
     * BlockStatement containing only empty statements. Concise-body arrows
     * are never empty since their expression body is the script's behavior.
     */
    function isStatementEmpty(node) {
        if (!node) return true;
        if (node.type === 'EmptyStatement') return true;
        if (node.type === 'ExpressionStatement' && node.expression &&
            node.expression.type === 'CallExpression') {
            const callee = node.expression.callee;
            if (callee && (callee.type === 'FunctionExpression' || callee.type === 'ArrowFunctionExpression')) {
                // Concise-body arrow (callee.body is an expression, not a BlockStatement) IS
                // the script's behavior — never empty.
                if (!callee.body || callee.body.type !== 'BlockStatement') return false;
                return callee.body.body.every(isStatementEmpty);
            }
        }
        return false;
    }

    /**
     * Dedupe translation objects by message, code, and comment.
     */
    function dedupeTranslations(translations) {
        return translations.filter((translation, index, self) =>
            index === self.findIndex(t =>
                t.message === translation.message &&
                t.code === translation.code &&
                t.comment === translation.comment
            )
        );
    }

    // Unwraps {label, value} options to their values; passes primitives through.
    function extractOptionValues(options) {
        if (!Array.isArray(options)) return [];
        return options.map(opt => {
            if (opt && typeof opt === 'object' && Object.prototype.hasOwnProperty.call(opt, 'value')) {
                return opt.value;
            }
            return opt;
        });
    }

    function describeType(v) {
        if (v === null) return 'null';
        if (Array.isArray(v)) return 'array';
        return typeof v;
    }

    function checkField(s, field, expectedType, opts) {
        const required = opts && opts.required;
        const errs = [];
        const present = Object.prototype.hasOwnProperty.call(s, field) && s[field] !== undefined;
        if (!present) {
            if (required) errs.push({ issue: 'missing', field: field, expected: expectedType });
            return errs;
        }
        const got = describeType(s[field]);
        if (expectedType === 'array' ? !Array.isArray(s[field]) : got !== expectedType) {
            errs.push({ issue: 'wrong-type', field: field, expected: expectedType, got: got });
        }
        return errs;
    }

    const TYPE_WITH_ARTICLE = {
        string: 'a string',
        number: 'a number',
        boolean: 'a boolean',
        array: 'an array',
        object: 'an object'
    };

    function formatSchemaError(propName, kind, err) {
        const prefix = "Property '" + propName + "' (" + kind + " schema)";
        const expectedWithArticle = TYPE_WITH_ARTICLE[err.expected] || err.expected;
        switch (err.issue) {
            case 'missing':
                return gs.getMessage(
                    "{0}: required field '{1}' ({2}) is missing.",
                    [prefix, err.field, err.expected]
                );
            case 'wrong-type':
                return gs.getMessage(
                    "{0}: '{1}' must be {2}; received {3}.",
                    [prefix, err.field, expectedWithArticle, err.got]
                );
            case 'empty':
                return gs.getMessage(
                    "{0}: '{1}' must contain at least one value.",
                    [prefix, err.field]
                );
            case 'out-of-range':
                return gs.getMessage("{0}: {1}.", [prefix, err.message]);
            case 'invalid-value':
                return gs.getMessage(
                    "{0}: '{1}' value {2} is invalid. Expected {3}.",
                    [prefix, err.field, JSON.stringify(err.value), err.expected]
                );
            case 'custom':
                return gs.getMessage("{0}: {1}.", [prefix, err.message]);
            default:
                return gs.getMessage(
                    "{0}: validation error: {1}",
                    [prefix, JSON.stringify(err)]
                );
        }
    }

    // MAX_NESTING_DEPTH is a stack-safety bound, not a design limit.
    const ALLOWED_FIELD_TYPES = ['string', 'number', 'boolean', 'array', 'object'];
    const MAX_NESTING_DEPTH = 16;

    function validateNestedField(field, where, errs, kindValidators, depth) {
        depth = depth || 1;

        if (depth > MAX_NESTING_DEPTH) {
            errs.push({
                issue: 'custom',
                message: "nesting depth at '" + where + "' exceeds the maximum of " + MAX_NESTING_DEPTH + " levels"
            });
            return;
        }

        if (!field || typeof field !== 'object' || Array.isArray(field)) {
            errs.push({
                issue: 'wrong-type',
                field: where,
                expected: 'object descriptor',
                got: describeType(field)
            });
            return;
        }
        if (!field.type) {
            errs.push({
                issue: 'missing',
                field: where + ".type",
                expected: 'string'
            });
        } else if (!ALLOWED_FIELD_TYPES.includes(field.type)) {
            errs.push({
                issue: 'invalid-value',
                field: where + ".type",
                value: field.type,
                expected: 'one of: ' + ALLOWED_FIELD_TYPES.join(', ')
            });
        }
        if (field.title !== undefined && typeof field.title !== 'string') {
            errs.push({
                issue: 'wrong-type',
                field: where + ".title",
                expected: 'string',
                got: describeType(field.title)
            });
        }
        if (field.description !== undefined && typeof field.description !== 'string') {
            errs.push({
                issue: 'wrong-type',
                field: where + ".description",
                expected: 'string',
                got: describeType(field.description)
            });
        }
        if (field.required !== undefined && typeof field.required !== 'boolean') {
            errs.push({
                issue: 'wrong-type',
                field: where + ".required",
                expected: 'boolean',
                got: describeType(field.required)
            });
        }

        if (field.type === 'object' && field.properties !== undefined) {
            if (typeof field.properties !== 'object' || field.properties === null || Array.isArray(field.properties)) {
                errs.push({
                    issue: 'wrong-type',
                    field: where + ".properties",
                    expected: 'object',
                    got: describeType(field.properties)
                });
            } else {
                Object.keys(field.properties).forEach(key => {
                    validateNestedField(
                        field.properties[key],
                        where + ".properties." + key,
                        errs, kindValidators, depth + 1
                    );
                });
            }
        }

        if (field.type === 'array' && field.items !== undefined) {
            validateNestedField(field.items, where + ".items", errs, kindValidators, depth + 1);
        }

        if (field.type === 'number') {
            ['minimum', 'maximum'].forEach(k => {
                if (field[k] !== undefined && typeof field[k] !== 'number') {
                    errs.push({
                        issue: 'wrong-type',
                        field: where + "." + k,
                        expected: 'number',
                        got: describeType(field[k])
                    });
                }
            });
            if (typeof field.minimum === 'number' && typeof field.maximum === 'number' && field.minimum > field.maximum) {
                errs.push({
                    issue: 'out-of-range',
                    field: where + ".minimum",
                    message: "'minimum' (" + field.minimum + ") must not exceed 'maximum' (" + field.maximum + ")"
                });
            }
            if (field.default !== undefined && typeof field.default !== 'number') {
                errs.push({
                    issue: 'wrong-type',
                    field: where + ".default",
                    expected: 'number',
                    got: describeType(field.default)
                });
            }
        }

        if (field.schema !== undefined) {
            if (typeof field.schema !== 'object' || field.schema === null || Array.isArray(field.schema)) {
                errs.push({
                    issue: 'wrong-type',
                    field: where + ".schema",
                    expected: 'object',
                    got: describeType(field.schema)
                });
                return;
            }
            const xCustom = field.schema['x-ui-control'];
            if (xCustom && typeof xCustom === 'object' && !Array.isArray(xCustom) && xCustom.kind) {
                const k = xCustom.kind;
                const subValidator = kindValidators[k];
                if (!subValidator) {
                    errs.push({
                        issue: 'invalid-value',
                        field: where + ".schema.x-ui-control.kind",
                        value: k,
                        expected: 'one of: ' + Object.keys(kindValidators).join(', ')
                    });
                    return;
                }
                subValidator(xCustom).forEach(subErr => {
                    const anchored = Object.assign({}, subErr);
                    anchored.field = where + ".schema.x-ui-control" + (subErr.field ? "." + subErr.field : "");
                    errs.push(anchored);
                });
            }
        }
    }

    function flattenNestedSchemas(descriptor) {
        if (!descriptor || typeof descriptor !== 'object' || Array.isArray(descriptor)) {
            return;
        }
        if (descriptor.schema && typeof descriptor.schema === 'object' && !Array.isArray(descriptor.schema)) {
            const schemaObj = descriptor.schema;
            delete descriptor.schema;
            Object.keys(schemaObj).forEach(key => {
                // Skip `type` so a stray `schema.type` cannot clobber the Lit-derived type.
                if (key === 'type') return;
                descriptor[key] = schemaObj[key];
            });
        }
        if (descriptor.properties && typeof descriptor.properties === 'object' && !Array.isArray(descriptor.properties)) {
            Object.keys(descriptor.properties).forEach(key => {
                flattenNestedSchemas(descriptor.properties[key]);
            });
        }
        if (descriptor.items) {
            flattenNestedSchemas(descriptor.items);
        }
    }

    function extractPropertiesObject(objectExpression, properties) {
        objectExpression.properties.forEach(prop => {
            const propName = prop.key.name;
            properties[propName] = {};
            if (propName == 'data' || propName == 'server') {
                gs.addErrorMessage(gs.getMessage('{0} is a reserved property name and cannot be used.', propName));
                current.setAbortAction(true);
                return;
            }
            prop.value.properties.forEach(subProp => {
                if (subProp.key.name === 'type') {
                    properties[propName].type = subProp.value.name;
                }
                if (subProp.key.name === 'name') {
                    properties[propName].name = subProp.value.value;
                }
                if (subProp.key.name === 'description') {
                    properties[propName].description = subProp.value.value;
                }
                if (subProp.key.name === 'state') {
                    properties[propName].state = subProp.value.value;
                }
                if (subProp.key.name === 'schema') {
                    properties[propName].schema = extractLiteral(subProp.value);
                }
                if (subProp.key.name === 'required') {
                    properties[propName].required = subProp.value.value;
                }
            });
            if (properties[propName].state === true) delete properties[propName];
        });
    }

    function extractClientToolsObject(objectExpression, clientTools) {
        objectExpression.properties.forEach(toolProp => {
            const toolName = toolProp.key.name || toolProp.key.value;
            clientTools[toolName] = extractLiteral(toolProp.value) || {};
        });
    }

    function getStaticGetterReturnObject(methodNode) {
        const fn = methodNode.value;
        if (!fn || !fn.body || !Array.isArray(fn.body.body)) return null;
        const ret = fn.body.body.find(stmt => stmt.type === 'ReturnStatement');
        if (!ret || !ret.argument || ret.argument.type !== 'ObjectExpression') return null;
        return ret.argument;
    }

    try {
        const {
            acorn
        } = new AcornLatest();
        let ast;
        try {
            ast = acorn.parse(current.component, {
                sourceType: 'module',
                ecmaVersion: 'latest'
            });
        } catch (parseErr) {
            gs.addErrorMessage(gs.getMessage('Component syntax error: {0}', parseErr.message));
            current.setAbortAction(true);
            return;
        }

        const classNames = [];
        let exportDeclarationsFound = 0;
        let exportDeclarationStart = -1;
        const imports = {};
        const importBoundaries = [];
        const widgetDependencies = [];
        const clientTools = {};
        const properties = {};
        const requiredTranslations = [];
        let customElementDefineCalled = false;
        try {
            acorn.walk.simple(ast, {
                ExportNamedDeclaration: function(node) {
                    exportDeclarationsFound++;
                    exportDeclarationStart = node.start;
                },
                ExportDefaultDeclaration: function(node) {
                    exportDeclarationsFound++;
                },
                ClassDeclaration: function(node) {
                    classNames.push(node.id.name);
                },
                ImportDeclaration: function(node) {
                    if (importBoundaries.length === 0) {
                        importBoundaries[0] = node.start;
                    }
                    importBoundaries[1] = node.end;
                    const source = node.source.value;
                    /*
                    - Use @servicenow/glide-widgets/&lt;scope_name&gt;/&lt;widget_name&gt; when importing existing widget into code
                      ( import '@servicenow/glide-widgets/global/user-avatar'; )
                    - No explicit export statement is required
                    - Each widget is default exported automatically
                    - Widgets follow a single-export pattern (only the widget itself can be exported)
                    */
                    if (source.startsWith(GLIDE_WIDGETS_PREFIX)) {
                        const afterPrefix = source.slice(GLIDE_WIDGETS_PREFIX.length);
                        const segments = afterPrefix.split('/');
                        let scope, widgetId;
                        if (segments.length === 1) {
                            scope = 'global';
                            widgetId = segments[0];
                        } else {
                            scope = segments[0];
                            widgetId = segments.slice(1).join('/');
                        }
                        widgetDependencies.push(`${scope}.${widgetId}`);
                    } else {
                        imports[source] = imports[source] || [];
                        imports[source] = imports[source].concat(node.specifiers.map(spec => {
                            if (spec.imported.name === spec.local.name) return spec.local.name;
                            return `${spec.imported.name}~${spec.local.name}`;
                        }));
                    }
                },
                PropertyDefinition: function(node) {
                    if (node.static === true && node.key.name === 'properties') {
                        extractPropertiesObject(node.value, properties);
                    }
                    if (node.static === true && node.key.name === 'client_tools') {
                        extractClientToolsObject(node.value, clientTools);
                    }
                },
                MethodDefinition: function(node) {
                    if (node.static === true && node.kind === 'get' && node.key.name === 'properties') {
                        const objExpr = getStaticGetterReturnObject(node);
                        if (objExpr) extractPropertiesObject(objExpr, properties);
                    }
                    if (node.static === true && node.kind === 'get' && node.key.name === 'client_tools') {
                        const objExpr = getStaticGetterReturnObject(node);
                        if (objExpr) extractClientToolsObject(objExpr, clientTools);
                    }
                },
                CallExpression: function(node) {
                    const chain = getCalleeChain(node.callee);
                    if (isI18nGetMessage(chain)) {
                        const arg = node.arguments[0];
                        if (arg && arg.type === 'TemplateLiteral' && arg.expressions.length > 0) {
                            gs.addWarningMessage(gs.getMessage(
                                'i18n.getMessage() call uses a template literal with interpolation; the translation string cannot be statically extracted. Use a plain string literal instead.'
                            ));
                        }
                        const value = extractLiteral(arg);
                        if (value) {
                            // String: i18n.getMessage('Hello') or Object: i18n.getMessage({code: 'hello', message: 'Hello', comment: '...'})
                            if (value) {
                                if (typeof value === 'string') {
                                    if (value.trim()) {
                                        requiredTranslations.push({
                                            message: value
                                        });
                                    }
                                } else if (typeof value === 'object' && value !== null) {
                                    const translation = {};
                                    if (Object.prototype.hasOwnProperty.call(value, "message") && String(value.message).trim()) {
                                        ["code", "message", "comment"].forEach((prop) => {
                                            if (Object.prototype.hasOwnProperty.call(value, prop)) {
                                                translation[prop] = value[prop];
                                            }
                                        });
                                        requiredTranslations.push(translation);
                                    } else {
                                        gs.addWarningMessage(gs.getMessage('Invalid translation object found'));
                                    }
                                } else {
                                    gs.addWarningMessage(gs.getMessage('Unexpected translation value type: {0}', typeof value));
                                }
                            }
                        }
                    }
                    if (node.callee.object?.name === 'customElements' && node.callee.property.name === 'define') {
                        // not foolproof, does not catch window.customElements.define for example.
                        customElementDefineCalled = true;
                    }
                }
            });
        } catch (walkErr) {
            gs.addErrorMessage(gs.getMessage('Component failed during analysis: {0}', walkErr.message));
            current.setAbortAction(true);
            return;
        }
        if (classNames.length === 0) {
            gs.addErrorMessage(gs.getMessage('Component must define a class.'));
            current.setAbortAction(true);
            return;
        }
        if (classNames.length > 1) {
            gs.addInfoMessage(gs.getMessage('Multiple classes found. {0} will be used for {1}', [classNames[0], current.id]));
        }

        if (exportDeclarationsFound > 0) {
            gs.addWarningMessage(gs.getMessage('Component must not contain export declarations.'));
        }

        let compiledComponent = current.component;

        if (exportDeclarationStart > -1) {
            // stop gap, forgive one export - usually for the main webcomponent class.
            // TODO: we should have acorn -> astring
            compiledComponent = compiledComponent.slice(0, exportDeclarationStart) + compiledComponent.slice(exportDeclarationStart + "export ".length);
        }

        if (customElementDefineCalled) {
            gs.addWarningMessage(gs.getMessage('Component must not call customElements.define'));
        }

        const kindValidators = {
            reference: (s) => {
                const errs = [];
                errs.push.apply(errs, checkField(s, 'table', 'string', { required: true }));
                errs.push.apply(errs, checkField(s, 'displayField', 'string'));
                errs.push.apply(errs, checkField(s, 'qualifier', 'string'));
                return errs;
            },
            table: (s) => {
                const errs = [];
                errs.push.apply(errs, checkField(s, 'baseTable', 'string'));
                errs.push.apply(errs, checkField(s, 'includeExtensions', 'boolean'));
                return errs;
            },
            choice: (s) => {
                const errs = [];
                if (!Array.isArray(s.options)) {
                    errs.push({ issue: 'missing', field: 'options', expected: 'non-empty array' });
                } else if (s.options.length === 0) {
                    errs.push({ issue: 'empty', field: 'options' });
                } else if (s.default !== undefined) {
                    const validValues = extractOptionValues(s.options);
                    if (!validValues.includes(s.default)) {
                        errs.push({
                            issue: 'invalid-value',
                            field: 'default',
                            value: s.default,
                            expected: 'one of the defined options (' + JSON.stringify(validValues) + ')'
                        });
                    }
                }
                return errs;
            },
            multiChoice: (s) => {
                const errs = [];
                if (!Array.isArray(s.options)) {
                    errs.push({ issue: 'missing', field: 'options', expected: 'non-empty array' });
                } else if (s.options.length === 0) {
                    errs.push({ issue: 'empty', field: 'options' });
                }
                if (s.default !== undefined) {
                    if (!Array.isArray(s.default)) {
                        errs.push({
                            issue: 'wrong-type',
                            field: 'default',
                            expected: 'array',
                            got: describeType(s.default)
                        });
                    } else if (Array.isArray(s.options) && s.options.length > 0) {
                        const validValues = extractOptionValues(s.options);
                        s.default.forEach((v, i) => {
                            if (!validValues.includes(v)) {
                                errs.push({
                                    issue: 'invalid-value',
                                    field: "default[" + i + "]",
                                    value: v,
                                    expected: 'one of the defined options (' + JSON.stringify(validValues) + ')'
                                });
                            }
                        });
                    }
                }
                return errs;
            }
        };

        const litTypeToJsonType = {
            String: 'string',
            Number: 'number',
            Boolean: 'boolean',
            Array: 'array',
            Object: 'object'
        };

        let hasSchemaErrors = false;
        Object.keys(properties).forEach(propName => {
            const prop = properties[propName];
            const schema = prop.schema;
            if (!schema) return;

            if (Object.prototype.hasOwnProperty.call(schema, 'type')) {
                gs.addWarningMessage(gs.getMessage(
                    "Property '{0}': 'type' inside schema is redundant; it is derived from the Lit type. Remove it.",
                    [propName]
                ));
            }

            const xCustom = schema['x-ui-control'];
            if (xCustom && typeof xCustom === 'object' && !Array.isArray(xCustom) && xCustom.kind) {
                const validator = kindValidators[xCustom.kind];
                if (!validator) {
                    gs.addErrorMessage(gs.getMessage(
                        "Property '{0}': 'schema.x-ui-control.kind' value '{1}' is not recognized. Valid kinds: {2}.",
                        [propName, xCustom.kind, Object.keys(kindValidators).join(', ')]
                    ));
                    hasSchemaErrors = true;
                    return;
                }
                validator(xCustom).forEach(err => {
                    gs.addErrorMessage(formatSchemaError(propName, xCustom.kind, err));
                    hasSchemaErrors = true;
                });
                return;
            }

            const jsonType = litTypeToJsonType[prop.type];
            if (jsonType !== 'array' && jsonType !== 'object' && jsonType !== 'number') {
                return;
            }

            const virtualField = Object.assign({ type: jsonType }, schema);
            const subErrs = [];
            validateNestedField(virtualField, '', subErrs, kindValidators, 1);
            subErrs.forEach(err => {
                gs.addErrorMessage(formatSchemaError(propName, jsonType, err));
                hasSchemaErrors = true;
            });
        });
        if (hasSchemaErrors) {
            current.setAbortAction(true);
            return;
        }

        let hasServerScript = true;
        if (!current.script || !String(current.script).trim()) {
            hasServerScript = false;
        } else {
            try {
                const scriptAst = acorn.parse(current.script, {
                    sourceType: 'script',
                    ecmaVersion: 'latest'
                });
                if (scriptAst.body.every(isStatementEmpty)) {
                    hasServerScript = false;
                }
            } catch (scriptParseErr) {
                // Defensive: an unparseable script is treated as having content
                // so the client keeps invoking the server (current behavior).
                hasServerScript = true;
            }
        }

        current.dependent_widget_ids = widgetDependencies.join(",") + (widgetDependencies.length > 0 ? "," : "");
        current.component_compile_metadata = JSON.stringify({
            imports,
            elementClassName: classNames[0],
            importBoundaries,
            hasServerScript
        });
        const jsonSchema = {
            type: 'object',
            properties: {}
        };

        Object.keys(properties).forEach(propName => {
            const prop = properties[propName];
            const entry = {};
            entry.type = litTypeToJsonType[prop.type] || 'string';
            if (prop.name) {
                entry.title = prop.name;
            }
            if (prop.description) {
                entry.description = prop.description;
            }

            if (prop.schema && typeof prop.schema === 'object' && Object.keys(prop.schema).length > 0) {
                Object.keys(prop.schema).forEach(key => {
                    // Skip `type` so a stray `schema.type` cannot clobber the Lit-derived `entry.type`.
                    if (key === 'type') return;
                    entry[key] = prop.schema[key];
                });
            }

            flattenNestedSchemas(entry);

            jsonSchema.properties[propName] = entry;
        });

        const requiredProps = Object.keys(properties).filter(propName => properties[propName].required === true);
        if (requiredProps.length > 0) {
            jsonSchema.required = requiredProps;
        }

        current.input_schema = JSON.stringify(jsonSchema);
        current.required_translations = JSON.stringify(dedupeTranslations(requiredTranslations), null, 2);
        current.client_tools = JSON.stringify(clientTools);
    } catch (unexpected) {
        gs.addErrorMessage(gs.getMessage('Unexpected error in validation: {0}', unexpected.message));
        current.setAbortAction(true);
    }
})(current, previous);
