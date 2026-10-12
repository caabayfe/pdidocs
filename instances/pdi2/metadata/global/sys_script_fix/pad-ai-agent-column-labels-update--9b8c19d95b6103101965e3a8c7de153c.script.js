var tables = ['sys_pd_activity_definition', 'sys_pd_derivative'];

var columnUpdates = [{
        element: 'enable_ai_agent',
        column_label: 'AI agent support'
    },
    {
        element: 'ai_agent_objective',
        column_label: 'AI agent instructions'
    },
    {
        element: 'ai_agent_execution_mode',
        column_label: 'Autonomous support'
    },
    {
        element: 'ai_agent_run_as',
        column_label: 'Run as'
    }
];

for (var i = 0; i < tables.length; i++) {
    var table = tables[i];

    // --- Update sys_dictionary column labels ---
    for (var j = 0; j < columnUpdates.length; j++) {
        var update = columnUpdates[j];
        var dictGR = new GlideRecord('sys_dictionary');
        dictGR.addQuery('name', table);
        dictGR.addQuery('element', update.element);
        dictGR.query();

        if (dictGR.next()) {
            dictGR.setValue('column_label', update.column_label);
            dictGR.update();
        } else {
            gs.error('No sys_dictionary record found for ' + update.element + ' in ' + table);
        }
    }

    // --- Update ai_agent_run_as choice label ---
	var runAsPlaybookUserLabel = 'User who triggered the playbook';
    var choiceGR = new GlideRecord('sys_choice');
    choiceGR.addQuery('name', table);
    choiceGR.addQuery('element', 'ai_agent_run_as');
    choiceGR.addQuery('value', 'playbook_user');
    choiceGR.query();

    if (choiceGR.next()) {
        choiceGR.setValue('label', runAsPlaybookUserLabel);
        choiceGR.update();
    } else {
        gs.error('No sys_choice record found for ai_agent_run_as/playbook_user in ' + table);
    }
}
