(function executeRule(current, previous /*null when async*/) {
    // Query the process definition related to the current help guidance record
    var processDefinition = new GlideRecord('sys_pd_process_definition');
    processDefinition.addQuery('sys_id', current.process_definition);
    processDefinition.query();

    // If a related process definition is found, delete it
    if (processDefinition.next()) {
        gs.info('Deleting related process definition: ' + processDefinition);
        processDefinition.deleteRecord();
    } 
})(current, previous);
