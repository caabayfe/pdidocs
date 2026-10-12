(function executeRule(current, previous /*null when async*/ ) {
    var gr = new GlideRecord('contract_rel_ci');
    // For insert operation
    if (current.operation() === 'insert' && current.contract) {
        // Create a record in contract_rel_ci table
        gr.initialize();
        gr.contract = current.contract;
        gr.ci_item = current.sys_id;
        gr.insert();
        gs.log('Created contract_rel_ci record for new offering: ' + current.sys_id);
    }
    // For update operation
    else if (current.operation() === 'update' && current.contract.changes()) {
        // If previous contract exists, we need to remove that relationship
        if (previous && previous.contract) {
            var grDelete = new GlideRecord('contract_rel_ci');
            grDelete.addQuery('ci_item', current.sys_id);
            grDelete.addQuery('contract', previous.contract);
            grDelete.query();
            if (grDelete.next())
                grDelete.deleteRecord();
        }
        // If new contract exists, create the relationship
        if (current.contract) {
            // Check if a record already exists, then do nothing since we don't want dupes
            var gr = new GlideRecord('contract_rel_ci');
            gr.addQuery('contract', current.contract);
            gr.addQuery('ci_item', current.sys_id);
            gr.query();
            // If no record exists, create one
            if (!gr.hasNext()) {
                gr = new GlideRecord('contract_rel_ci');
                gr.initialize();
                gr.contract = current.contract;
                gr.ci_item = current.sys_id;
                gr.insert();
            } // else relationship already exists
        }
    }
})(current, previous);
