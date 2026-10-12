var priority = 'Interactive';
var eccParams = {
    'source': 'signature_validation_certs_reload',
    'topic': 'SystemCommand'
};

new SNC.MidEccSender().broadcastToAllMidServers(priority, eccParams, {});
