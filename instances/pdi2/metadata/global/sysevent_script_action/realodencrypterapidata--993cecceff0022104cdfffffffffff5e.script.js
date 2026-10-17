var eccQueueParam = {
'source': 'encrypter_api_data_reload',
'topic': 'SystemCommand',
'queue': 'output',
'state': 'ready'
};
var payloadParam = {};
new SNC.MidEccSender().broadcastToAllMidServers('Interactive', eccQueueParam, payloadParam);
