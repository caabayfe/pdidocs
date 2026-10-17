/**
 * Handle a loader.tables.processed event when the sys_kmf_module_crypto_spec 
 * table is loaded to by generating automatic key exchange requests 
 * 
 *   parm1 - comma-separated list of table names loaded from update set
 *   parm2 - unused
 */
generateAutoKeyExchangeRequests();

function generateAutoKeyExchangeRequests() {
    // If the KMF crypto spec table was not loaded to,
    // 	then there are no new auto key exchange requests to generate.
    if (!event.parm1.includes('sys_kmf_module_crypto_spec'))
        return;

    var log = new GSLog(null, 'KMFGenAutoKEReqsAction');
    log.setLevel(GSLog.DEBUG);
    log.setLog4J();

    // Prevent automation from generating auto key exchange requests.
    if (gs.getProperty('glide.test_instance', 'false') == 'true') {
        log.debug('Determined this is an instance used for automation. ' +
            'Skipping generation of automatic key exchange requests');
        return;
    }

    try {
        // Generate auto key exchange requests.
        log.debug('Generating automatic key exchange requests');
        var jsonOutput = new SNC.KMFAutoKeyExchangeRequestGeneratorAPI().generateAutoKeyExchangeRequests();

        // Log the results.
        var output = JSON.parse(jsonOutput);
        if (output.success == 'true') {
            log.debug('Successfully generated automatic key exchange requests');
        } else {
            log.warn('Could not generate automatic key exchange requests because of: ' + output.message);
        }
    } catch (err) {
        log.error('Encountered an error while generating automatic key exchange requests: ' + err);
    }
}
