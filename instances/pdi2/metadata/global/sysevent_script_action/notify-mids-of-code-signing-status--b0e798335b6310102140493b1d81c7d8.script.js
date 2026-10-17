(function executeRule(event) {
  new SNC.MidEccSender().broadcastToAllMidServers(
    'Interactive',
    {
      'source' : event.parm2 == 'true' ? 'activatePlugin' : 'deactivatePlugin',
      'topic'  : 'SystemCommand'
    },
    {
      'className': 'com.service_now.mid.security.validation.application.SignatureValidationPlugin'
    } 
  );
})(event);
