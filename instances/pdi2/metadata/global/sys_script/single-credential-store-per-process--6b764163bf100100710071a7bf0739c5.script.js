check();

function check() {
    // Check if credential store is empty:
    if (current.cred_store.nil()) {
        errMsg = gs.getMessage("You must specify a credential store for the process");
        gs.addErrorMessage(errMsg);
        current.setAbortAction(true);
    }
    
    // Check if process is empty:
    if (current.process.nil()) {
        errMsg = gs.getMessage("Process cannot be empty");
        gs.addErrorMessage(errMsg);
        current.setAbortAction(true);
    }
    
    // Prevent having more than one credential-store per process
    var gr = new GlideRecord('pwd_map_proc_to_cred_store');
    gr.addQuery('process', current.process);
    if (current.operation() == 'update') {
        gr.addQuery('sys_id', '<>', current.sys_id);
    }
    gr.query();
    if (gr.hasNext()) {
        var errMsg = gs.getMessage("A credential store is already specified for this process. Only one credential store is allowed for each process");
        gs.addErrorMessage(errMsg);
        current.setAbortAction(true);
    }
}
