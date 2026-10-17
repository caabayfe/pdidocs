// Fix script for the legacy_field_and_value calculated field on the life_cycle_mapping table
if (!pm.isZboot()) {
    gs.log("Starting fix script for legacy_field_and_value calculated field", "LifeCycleMappingFix");

    try {
        var dictGr = new GlideRecord('sys_dictionary');
        dictGr.addQuery('name', 'life_cycle_mapping');
        dictGr.addQuery('element', 'legacy_field_and_value');
        dictGr.query();

        if (dictGr.next()) {
            gs.log("Found legacy_field_and_value field, checking calculation", "LifeCycleMappingFix");

            // Log the previous calculation script
            var previousCalculation = dictGr.getValue('calculation');
            gs.log("Previous calculation script: " + previousCalculation, "LifeCycleMappingFix");

            // The specific previous script that we want to check for
            var specificPreviousScript = '(function calculatedFieldValue(current) {\n' +
                '\t//get display name of column\n' +
                '\tvar output = \'\';\n' +
                '\tvar colGr = new GlideRecord(\'sys_dictionary\');\n' +
                '\tcolGr.addQuery(\'name\',current.table);\n' +
                '\tcolGr.addQuery(\'element\',current.legacy_field_name);\n' +
                '\tcolGr.query();\n' +
                '\tif(colGr.next()){\n' +
                '\t\toutput += colGr.getValue(\'column_label\') + " - ";\n' +
                '\t} else {\n' +
                '\t\toutput += current.legacy_field_name + " - ";\n' +
                '\t}\n' +
                '\t\t\n' +
                '\t//get display name of value\n' +
                '\tvar lang = gs.getSession().getLanguage();\n' +
                '\tvar tables = new LifeCycleUtil().getParents(current.table);\n' +
                '\ttables.unshift(current.table);\n' +
                '\n' +
                '\tvar gr = new GlideRecord(\'sys_choice\');\n' +
                '\tgr.addQuery(\'language\',lang);\n' +
                '\tgr.addQuery(\'name\',\'IN\', tables);\n' +
                '\tgr.addQuery(\'element\', current.legacy_field_name);\n' +
                '\tgr.addQuery(\'value\',current.legacy_field_value);\n' +
                '\tgr.query();\n' +
                '\tif(gr.next()){\n' +
                '\t\toutput += gr.getValue(\'label\');\n' +
                '\t} else {\n' +
                '\t\toutput += current.legacy_field_value;\n' +
                '\t}\n' +
                '\treturn output;\n' +
                '\n' +
                '})(current);';

            // First normalize, then compare core function body
            var normalizedPrevious = normalizeScript(previousCalculation);
            var normalizedSpecific = normalizeScript(specificPreviousScript);

            // For better accuracy, also try to compare just the function body
            var previousBody = extractFunctionBody(normalizedPrevious);
            var specificBody = extractFunctionBody(normalizedSpecific);

            gs.log("Normalized previous: " + normalizedPrevious.substring(0, 100) + "...", "LifeCycleMappingFix");
            gs.log("Normalized specific: " + normalizedSpecific.substring(0, 100) + "...", "LifeCycleMappingFix");

            // Check if either full script or just the body matches
            var scriptsMatch = normalizedPrevious == normalizedSpecific ||
                previousBody.indexOf('legacy_field_name') > -1;

            // Only update if the previous calculation matches the specific script we're looking for
            if (scriptsMatch) {
                gs.log("Previous calculation matches the specific script we want to update", "LifeCycleMappingFix");

                dictGr.calculation = '(function calculatedFieldValue(current) {\n' +
                    '    //get display name of column\n' +
                    '    var output = \'\';\n' +
                    '    var colGr = new GlideRecord(\'sys_dictionary\');\n' +
                    '    colGr.addQuery(\'name\', current.table);\n' +
                    '    colGr.addQuery(\'element\', current.legacy_field_name);\n' +
                    '    colGr.query();\n' +
                    '    if (colGr.next()) {\n' +
                    '        output += colGr.getValue(\'column_label\') + " - ";\n' +
                    '    } else {\n' +
                    '        output += current.legacy_field_name + " - ";\n' +
                    '    }\n' +
                    '\n' +
                    '    //get display name of value\n' +
                    '    var lang = gs.getSession().getLanguage();\n' +
                    '    var tables = new LifeCycleUtil().getParents(current.table);\n' +
                    '    tables.unshift(current.table);\n' +
                    '\n' +
                    '    var result = {};\n' +
                    '    var gr = new GlideRecord(\'sys_choice\');\n' +
                    '    gr.addQuery(\'language\', lang);\n' +
                    '    gr.addQuery(\'name\', \'IN\', tables);\n' +
                    '    gr.addQuery(\'element\', current.legacy_field_name);\n' +
                    '    gr.addQuery(\'value\', current.legacy_field_value);\n' +
                    '    gr.query();\n' +
                    '    while (gr.next()) {\n' +
                    '        result[gr.getValue(\'name\')] = gr.getValue(\'label\');\n' +
                    '    }\n' +
                    '\n' +
                    '    var labelOutput = \'\';\n' +
                    '    for (var key in tables) {\n' +
                    '        if (result.hasOwnProperty(tables[key])) {\n' +
                    '            labelOutput = result[tables[key]];\n' +
                    '            break;\n' +
                    '        }\n' +
                    '    }\n' +
                    '\n' +
                    '    if (JSUtil.nil(labelOutput)) {\n' +
                    '        output += current.legacy_field_value;\n' +
                    '    } else {\n' +
                    '        output += labelOutput;\n' +
                    '    }\n' +
                    '\n' +
                    '    return output;\n' +
                    '\n' +
                    '})(current);';

                var updateResult = dictGr.update();
                gs.log("Dictionary entry updated: " + updateResult, "LifeCycleMappingFix");
                gs.log("Fix script for legacy_field_and_value completed successfully", "LifeCycleMappingFix");
            } else {
                gs.log("No update needed, current script is different from the one we're targeting", "LifeCycleMappingFix");
            }
        } else {
            gs.log("Error: legacy_field_and_value field not found on life_cycle_mapping table", "LifeCycleMappingFix");
        }
    } catch (e) {
        gs.logError("Error in fix script for legacy_field_and_value: " + e, "LifeCycleMappingFix");
    }
}

// Helper function to normalize script for comparison
function normalizeScript(script) {
    if (!script)
        return '';

    // Remove comments (both single line and multi-line)
    script = script.replace(/\/\/.*?(\r\n|\n|$)/g, ''); // Remove single line comments
    script = script.replace(/\/\*[\s\S]*?\*\//g, ''); // Remove multi-line comments

    // Remove all whitespace (spaces, tabs, newlines)
    script = script.replace(/\s+/g, '');

    // Handle additional normalization
    script = script.replace(/;+/g, ';'); // Normalize multiple semicolons
    script = script.replace(/;}/g, '}'); // Remove trailing semicolons before closing braces
    script = script.replace(/,\s*}/g, '}'); // Remove trailing commas

    // Normalize quotes (try to normalize string literal representations)
    script = script.replace(/"/g, '\''); // Convert double quotes to single quotes

    return script;
}

// Extract the actual function body if it's wrapped in (function...)(...) or eval()
function extractFunctionBody(script) {
    var match = /\(?function\s*[\w$]*\s*\([^)]*\)\s*{([\s\S]*)}\)?/.exec(script);
    if (match) {
        return match[1]; // Return just the function body
    }
    return script;
}
