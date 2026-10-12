(function executeRule(current, previous /*null when async*/ ) {

            var macroponent = current.macroponent.getRefRecord();
            var parentScreens = new GlideAggregate('sys_ux_screen');
            parentScreens.addQuery('macroponent', macroponent.getValue('sys_id'));
            parentScreens.addAggregate('COUNT');
            parentScreens.query();
            if (parentScreens.next()) {
                if (parentScreens.getAggregate('COUNT') == '1') {
                    macroponent.name = current.getValue('name');
                    macroponent.update();
                }
            }

        })(current, previous);
