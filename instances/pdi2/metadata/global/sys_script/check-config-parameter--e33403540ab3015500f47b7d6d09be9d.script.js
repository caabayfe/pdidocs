checkDupeName();
checkMidStatus();

function checkDupeName() {
    if (current.operation() == 'delete' || (current.operation() == 'update' && !current.param_name.changes()))
        return;


    // see if we have a record out there...
    var gr = new GlideRecord('ecc_agent_config');
    gr.addQuery('param_name', current.param_name);
    gr.addQuery('ecc_agent', current.ecc_agent);
    gr.query();
    if (!gr.next())
       return;

    current.setAbortAction(true);
    gs.addErrorMessage(gs.getMessage('Action would create a duplicate parameter record -- not allowed'));
    gs.log('Check for duplicate name on ecc_agent_config found duplicate name');
}
/**
 * Abort any operation on Down MID Servers
 **/
function checkMidStatus() {
	var gr = new GlideRecord('ecc_agent');
	gr.addQuery('sys_id', current.ecc_agent);
	gr.query();
	if (!gr.next())
		return;
	
	if (gr.getValue('status') == 'Down') {
		gs.addInfoMessage(gr.getValue('status'));
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage('{0} a parameter is not allowed for "Down" MID Servers', current.operation()));
		gs.log(gs.getMessage('operation {0} is aborted for the {1} with status = "Down"', 
										[current.operation(), gr.getValue('name')]));
	}
}
   
