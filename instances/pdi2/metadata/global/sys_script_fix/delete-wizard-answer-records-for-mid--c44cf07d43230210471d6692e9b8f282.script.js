deleteUnwantedWizardAnswerRecords();

function deleteUnwantedWizardAnswerRecords() {
    var wizardAnswers = ['SNMP Trap Collector Context',
        'ECC Agent Memory Metric',
        'ECC Agent RGR Metric',
        'ECC Agent Counter Metric',
        'ECC Agent Scalar Metric',
        'vCenter Event Collector Context'
    ];

    var gr = new GlideRecord('sys_wizard_answer');
    gr.addQuery('active', true);
	gr.addQuery('name', 'IN', wizardAnswers);
    gr.query();

    while (gr.next()) {
        gs.info(gs.getMessage("Deleted sys_wizard_answer record: {0}", gr.getValue('name')));
        gr.deleteRecord();
    }
}
