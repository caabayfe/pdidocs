var priority = 'Interactive';

var eccQueueFields = {
    'source': 'refreshPluginConfig',
    'topic': 'SystemCommand'
};

var payloadParams = {
    'className': 'com.service_now.mid.security.validation.application.SignatureValidationPlugin'
};

new SNC.MidEccSender().broadcastToAllMidServers(priority, eccQueueFields, payloadParams);
