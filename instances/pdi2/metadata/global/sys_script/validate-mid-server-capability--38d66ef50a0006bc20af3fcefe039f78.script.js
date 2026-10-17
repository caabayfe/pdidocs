/**
 * Service-now.com
 * 
 * Description: The business rule validates the requirements for adding MID servers to a cluster.
 */

validateMIDCapability();

function validateMIDCapability() {
    var gr = new GlideRecord("ecc_agent_capability_m2m");
    gr.addQuery("agent", current.agent);
    gr.query();
    if (gr.next())
        return;

    current.setAbortAction(true);
    gs.addErrorMessage(gs.getMessage("MID Server {0} must have capabilities assigned", current.agent.name));
}
