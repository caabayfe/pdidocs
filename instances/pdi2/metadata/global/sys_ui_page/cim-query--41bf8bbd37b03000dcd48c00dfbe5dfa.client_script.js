var DEFAULTS = {
  PREFERENCE_PREFIX: 'cimquery.',
  schema: 'http',
  ip: '192.168.8.2',
  port: '5988',
  namespace: 'root/cimv2',
  query: 'CIM_ComputerSystem.*',
  version: 'modern'
};

var CimUI = {
  _CANVAS: $('cqResponse'),

  draw: function(instances) {
    this._CANVAS.innerHTML = ''; // clear canvas
    for (var i = 0, n = instances.length; i < n; ++i) {
      var div = this.createInstanceDiv(instances[i]);
      this._CANVAS.appendChild(div);
    }
  },

  createInstanceDiv: function(instance) {
    var html = "<div class='cqResponseInstanceClass'>" + instance._classname + "</div><table class='cqResponseInstanceProperties'>"
    for (key in instance) {
      if (key.startsWith('_'))
        continue;

	  var value = !instance[key] ? '' : instance[key];
      html += '<tr><th>' + key + '</th><td>' + value + '</td></tr>';
    }
 
    html += '</table>';
    var div = document.createElement('div');
    div.setAttribute('class', 'cqResponseInstance');
    div.innerHTML = html;
    return div;
  }
};

function parseError(message) {
  return message.substring(6);
}

function getPreference(shortName) {
  var preferenceName = DEFAULTS.PREFERENCE_PREFIX + shortName;
  var prefGr = new GlideRecord('sys_user_preference');
  prefGr.addQuery('name', preferenceName);
  prefGr.query();
  if (prefGr.next())
    return ''+prefGr.value;

  return DEFAULTS[shortName];
}

(function() {
  // set initial values
  $('cqSchema').value = getPreference('schema');
  $('cqIp').value = getPreference('ip');
  $('cqPort').value = getPreference('port');
  $('cqNamespace').value = getPreference('namespace');
  $('cqQuery').value = getPreference('query');
  $('cqVersion').value = getPreference('version');
})()

$('cqQueryButton').on('click', function(event) {
  event.stop();
  var query = {
    schema: $('cqSchema').value,
    ip: $('cqIp').value,
    port: $('cqPort').value,
    namespace: $('cqNamespace').value,
    query: $('cqQuery').value,
	version: $('cqVersion').value
  };

  var ajaxQuery = new GlideAjax('DiscoveryCimQueryAjax');
  ajaxQuery.addParam('sysparm_name', 'query');
  for (var field in query)
    ajaxQuery.addParam('sysparm_' + field, query[field]);

  $('cqResponseStatus').value = 'Creating probe ...';
  ajaxQuery.getXML(function(queryResponse) {
    $('cqResponseStatus').innerHTML = 'Querying CIM server ...'; 
    var probeId = queryResponse.responseXML.documentElement.getAttribute('answer');
    if (!probeId || probeId.startsWith('error:')) {
      if (!probeId)
        $('cqResponseStatus').innerHTML = 'Failed to create probe. See logs for details ...';
      else
        $('cqResponseStatus').innerHTML = 'Failed to create probe: ' + parseError(probeId);

      return;
    }

    function poll() {
      var ajaxPoll = new GlideAjax('DiscoveryCimQueryAjax');
      ajaxPoll.addParam('sysparm_name', 'poll');
      ajaxPoll.addParam('sysparm_probe_id', probeId);
      ajaxPoll.getXML(function(pollResponse) {
        var answer = pollResponse.responseXML.documentElement.getAttribute('answer');
        if (!answer) {
            setTimeout(poll, 3000);
            return;
        } else if (answer.startsWith('error:')) {
            $('cqResponseStatus').innerHTML = parseError(answer);
            return;
        }
        var instances = (new Function('return ' + answer + '.instance;'))();
        var schemas = (new Function('return ' + answer + '.schema;'))();
        CimUI.draw(instances);
        var total = instances.length + schemas.length;
        $('cqResponseStatus').innerHTML = 'Retrieved ' + total + (total == 1 ? ' object.' : ' objects.');
      });
    }

    setTimeout(poll, 6000);
  });
});

$('cqResponse').on('click', 'div.cqResponseInstanceClass,div.cqResponseInstanceClassMaximized', function(event, element) {
  event.stop();
  if (element.getAttribute('class') === 'cqResponseInstanceClass') {
      element.setAttribute('class', 'cqResponseInstanceClassMaximized');
      var parent = element.up('div.cqResponseInstance');
      parent.setAttribute('class', 'cqResponseInstanceMaximized');
      parent.down('table.cqResponseInstanceProperties').setAttribute('class', 'cqResponseInstancePropertiesMaximized');
  } else {
      element.setAttribute('class', 'cqResponseInstanceClass');
      var parent = element.up('div.cqResponseInstanceMaximized');
      parent.setAttribute('class', 'cqResponseInstance');
      parent.down('table.cqResponseInstancePropertiesMaximized').setAttribute('class', 'cqResponseInstanceProperties');
  }
});
