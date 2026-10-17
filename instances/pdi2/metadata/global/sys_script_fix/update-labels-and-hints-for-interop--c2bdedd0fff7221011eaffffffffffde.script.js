
            
            function renameLabelAndHints(tableName, elementName, newLabel, newHint) {
                if (newLabel && newLabel.length > 0) {
                    var grDictionary = new GlideRecord('sys_dictionary');
                    grDictionary.addQuery('name', tableName);
                    grDictionary.addQuery('element', elementName);
                    grDictionary.query();

                    if (grDictionary.next()) {
                        grDictionary.setValue('column_label', newLabel);
                        gs.log("Changing label for " + elementName + " in sys_dictionary");
                        grDictionary.update();
                    }
                }

                var grDocumentation = new GlideRecord('sys_documentation');
                grDocumentation.addQuery('name', tableName);
                grDocumentation.addQuery('element', elementName);
                grDocumentation.addQuery('language', 'en');
                grDocumentation.query();

                if (grDocumentation.next()) {
                    if (newLabel && newLabel.length > 0) {
                        grDocumentation.setValue('label', newLabel);
                        grDocumentation.setValue('plural', newLabel);
                        gs.log("Changing label for " + elementName + " in sys_documentation");
                    }
                    if (newHint && newHint.length > 0) {
                        grDocumentation.setValue('hint', newHint);
                        gs.log("Changing hint for " + elementName + " in sys_documentation");
                    }
                    grDocumentation.update();
                }
            }

            gs.log("Updating labels and hints for interop tables");

            renameLabelAndHints("sys_ux_interoperable_route", "advanced", "Use scripted evaluation condition", "Use an advanced scripted condition to determine when to render this shared route");
            renameLabelAndHints("sys_ux_interoperable_route", "interoperable_scripted_condition", "Script", "Scripted condition under which this shared route is applicable");
            renameLabelAndHints("sys_ux_interoperable_route", "screens", null, "List of applicable screens from the shared route to be consumed in the target experience. Leave empty if all screens are to be considered.");
            renameLabelAndHints("sys_ux_interoperable_route", "interoperable_order", null, "Order of evaluation when multiple shared pages match");
            renameLabelAndHints("sys_ux_interoperable_route", "interoperable_condition", "Evaluation condition", "Condition under which this shared route is applicable");
            renameLabelAndHints("sys_ux_interoperable_route", "alias_route", null, "Optional alias name to refer the shared source route in target experience");
            renameLabelAndHints("sys_ux_interoperable_route", "source_route", null, "Shared source route to be applied. Only routes enabled to use across experiences are applicable.");
            renameLabelAndHints("sys_ux_interoperable_route", "target_experience", null, "Target experience to render the shared page");
            renameLabelAndHints("sys_ux_interoperable_route", "description", null, "A brief summary or purpose of using this shared page");
            renameLabelAndHints("sys_ux_interoperable_route", "interoperable_name", null, "Unique name to identify this shared page configuration");
            renameLabelAndHints("sys_ux_m2m_interoperable_route_applicability", "audience", null, "The audience to which the shared route should be applicable");

            gs.log("Done updating labels and hints for interop tables");
