var DiscoveryPortScanner = Class.create();
DiscoveryPortScanner.prototype = {
    initialize: function() {
        this.firedProbes = [];
    },

    firePortProbeByPort: function(port) {
        var probesFired = 0;
        var isNetworkDiscovery = (g_disco_functions.getDiscoveryType(agent_correlator) == 'Networks');

        if (!isNetworkDiscovery && !g_disco_functions.isInRange(g_device.getSource()))
            return probesFired;

        var portProbes = this.getPortProbes();
        PROBES: while (portProbes.next()) {
            var servicePorts = this.getSPFromPP(portProbes);
            var alreadyFired = g_array_util.contains(this.firedProbes, portProbes.sys_id);
            // if this probe matches our port and we haven't triggered it yet, then lets do so!
            if (g_array_util.contains(servicePorts, port) && !alreadyFired) {
                probesFired += this.scheduleProbe(portProbes, port);
                this.firedProbes.push(new String(portProbes.sys_id));
                continue PROBES;
            }            
        }

        return probesFired;
    },

    scheduleProbe: function(portProbe, port) {
        var probesFired = 0;

        var probe = Probe.getById(portProbe.getValue("triggers_probe"));
        if (probe != null) {
            probe.setSource(g_device.getSource());
            probe.addParameter("use_class", portProbe.getValue("classy"));
            probe.addParameter("port_probe", portProbe.getValue('sys_id'));
            probe.addParameter("port", port);

            if (g_device.getCmdbCi())
                probe.addParameter("cmdb_ci", g_device.getCmdbCi());

            if (GlideHostUtil.isLocalhost(g_device.getSource()))
                probe.addParameter("aka", StringUtil.join(GlideHostUtil.getNonLoopbackIPs()));

            probe.setMidSelectDetails(g_probe.getParameter("mid_selector_details"));
			probe.create(g_probe.getAgent(), g_probe.getEccQueueId());
            probesFired++;
        }

        return probesFired;
    },

    updateCIServicePorts: function(openPorts, scannedPorts, cmdbCi) {
        var availPorts = new GlideRecord('cmdb_ip_service_ci');
        availPorts.addQuery('ci', cmdbCi);
        availPorts.deleteMultiple();

        for (var i = 0; i < openPorts.length; i++) {
            var port = openPorts[i];

            var portGR = g_disco_functions.getService(port);
            availPorts.initialize();
            availPorts.setValue('service', portGR.sys_id);
            availPorts.setValue('ci', cmdbCi);
            availPorts.insert();
        }

        if (openPorts.length)
            g_device.log("Open ports found: " + openPorts.join(", "));
        else
            g_device.log("No open ports found (" + scannedPorts.join(", ") + ")");
    },

    getPortProbes: function() {
        var gr = new GlideRecord("discovery_port_probe");
        gr.initialize();
        gr.addActiveQuery();
        gr.query();

        return gr;
    },

    getPortProbeByName: function(name) {
        var gr = new GlideRecord("discovery_port_probe");
        gr.initialize();
        gr.addActiveQuery();
        gr.addQuery('name', name);
        gr.query();
        gr.next();
        return gr;
    },

    getAllServicePorts: function() {
        var serviceList = [];

        var portProbes = this.getPortProbes();
        while (portProbes.next()) {
            var list = this.getSPFromPP(portProbes);
            for (var i = 0; i < list.length; i++)
                serviceList.push(list[i]);
        }

        return serviceList;
    },

    getSPFromPPId: function(ppid) {
        var gr = new GlideRecord("discovery_port_probe");
        if (ppid)
            gr.get('sys_id', ppid);
        return this.getSPFromPP(gr);
    },

    getSPFromPP: function(portProbe) {
        var serviceList = [];
        var services = portProbe.services.getGlideList().getValues();
        if (services.isEmpty())
            return serviceList;

        var cmdbIPService = new GlideRecord("cmdb_ip_service");
        cmdbIPService.addQuery("sys_id", services);
        cmdbIPService.query();
        while (cmdbIPService.next())
            serviceList.push(new String(cmdbIPService.port));

        return serviceList;
    },

    getPPFromSP: function(servicePort) {
        var cmdbIPService = new GlideRecord('cmdb_ip_service');
        cmdbIPService.addQuery('port', servicePort);
        cmdbIPService.query();
        if (!cmdbIPService.next())
            return null;

        var portProbes = new GlideRecord('discovery_port_probe');
        portProbes.addQuery('services', 'CONTAINS', cmdbIPService.getValue('sys_id'));
        portProbes.query();
        if (!portProbes.next())
            return null;

        return portProbes;
    },

    type: "DiscoveryPortScanner"
}
