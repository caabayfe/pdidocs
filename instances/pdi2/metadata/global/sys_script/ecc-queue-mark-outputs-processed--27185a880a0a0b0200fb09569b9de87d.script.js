/*
 *  When an input record comes in, it checks for the corresponding output record and sets the processed to "processed". 
 *  In Discovery, this basically means we set the probe to processed when MID Server sent back the result payload for sensor processing.
 */

setProbeProcessed(current.getValue('response_to'));

function setProbeProcessed(sys_id) {
    if (!sys_id)
        return;
    var gr = new GlideRecord('ecc_queue');
    // get() is used here to ensure that the fetch of the record is as efficient as possible
    // using query() results in a union across multiple shards
    if (!gr.get(sys_id))
        return;

    // Check that the agent of the record matches the agent of the input message being processed 
    // to ensure this script does not modify records that belong to another MID. In certain rare 
    // scenarios, failover may have occurred and changed ownership of an ECC output message to another
    // MID server before the current MID server had a chance to return the response input message
    if((gr.agent || "").toUpperCase().trim() != (current.agent || "").toUpperCase().trim())
        return;

    gr.state = 'processed';
    gr.processed = new GlideDateTime();
    gr.update();
}
