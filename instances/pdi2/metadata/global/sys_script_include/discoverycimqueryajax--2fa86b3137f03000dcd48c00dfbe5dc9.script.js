/**
 * Provides AJAX controller methods for the CIM Query UI Page
 * @author roy.laurie
 */
var DiscoveryCimQueryAjax = Class.create();

// DiscoveryIncludes
var g_array_util = new ArrayUtil();

DiscoveryCimQueryAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    ajaxFunction_query: function() {
        var query = {
          schema: ''+this.getParameter('sysparm_schema'),
          ip: ''+this.getParameter('sysparm_ip'),
          port: ''+this.getParameter('sysparm_port'),
          namespace: ''+this.getParameter('sysparm_namespace'),
          query: ''+this.getParameter('sysparm_query'),
          version: ''+this.getParameter('sysparm_version')			
        };
        
        // select the appropriate MID for the specified IP based on MID IP ranges
        var midFinder = new MIDServerFinder();
        midFinder.setRangesByIPOrHostname(query.ip);
        var midNames = midFinder.getMIDServers();
        if (midNames.length === 0)
          return 'error:' + midFinder.getStatusMessage();

        // save user preferences
        var userId = ''+gs.getSession().getUser().getID();
        for (var shortName in query) {
            var prefQGr = new GlideRecord('sys_user_preference');
            prefQGr.addQuery('user', userId);
            prefQGr.addQuery('name', 'cimquery.' + shortName);
            prefQGr.query();
            if (prefQGr.next()) {
              var prefGr = prefQGr;
            } else {
              var prefGr = new GlideRecord('sys_user_preference');
              prefGr.user = userId;
              prefGr.type = 'string';
              prefGr.name = 'cimquery.' + shortName;
            }

            prefGr.value = query[shortName];
            prefGr.update();
            
        }      

        var probe = new SncProbe();
        probe.setType('CimProbe');
        probe.setName('CIM Query');
        probe.setProbeName('CIM Query');
        probe.setTopic('CimProbe');
        probe.addParameter('source', query.ip);
        probe.addParameter('port', query.port);
        probe.addParameter('namespace', query.namespace);
        probe.addParameter('queries', query.query);
		probe.addParameter('cim_version', query.version);
		probe.addParameter('skip_sensor', "true");
		probe.setEccPriority('0');
        var probeId = probe.create(midNames[0]);
        return probeId;
    },

    ajaxFunction_poll: function() {
        try {
          var probeId = ''+this.getParameter('sysparm_probe_id');
          var eccqGr = new GlideRecord('ecc_queue');
          eccqGr.addQuery('queue', 'input');
          eccqGr.addQuery('response_to', probeId);
          eccqGr.query();
          if (!eccqGr.next())
              return;

		  var payload = new XMLHelper(''+eccqGr.payload).toObject();

          try {
              var queries = new CimProbeResult(payload.result).getQueries();
          } catch (e) {

			  var error = payload['@error'] || payload.error;

			  try {
				  var warning = payload.result.cimqueryset.cimquery.warning;
				  if (error && warning)
					  error += ':' + warning;
				  else
					  error = warning || error;  // If we have cimquery but no warning, don't overwrite error

				  } catch (e2) { }

              return 'error:' + (error || e);
          }

          var json = new JSON().encode(queries[0].result);
          return json;
       } catch (e) {
         return 'error:' + e;
       }
    },

    type: 'DiscoveryCimQueryAjax'
});
