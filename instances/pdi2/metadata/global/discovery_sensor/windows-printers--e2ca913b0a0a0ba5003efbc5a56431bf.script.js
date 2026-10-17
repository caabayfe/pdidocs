new DiscoverySensor({
    process: function(result) {
        var currentQueues = this.parsePrintQueues(result);
        var previousQueues = this.getPrintQueuesOnCi();

        for (var i = 0; i < currentQueues.length; i++) {
            var pq = currentQueues[i];
            var pqid = this.findPrintQueue(pq.name, pq.ip_address);

            if (!pqid)
                return;

            if (previousQueues[pqid])
                delete previousQueues[pqid];
            else {
                var gr = new GlideRecord("cmdb_print_queue_instance");
                gr.name = pq.name;
                gr.installed_on = this.getCmdbCi();
                gr.printer = pqid;
                gr.insert();
            }
        }

        for (var pqid in previousQueues) {
            var gr = new GlideRecord("cmdb_print_queue_instance");
            gr.addQuery("installed_on", this.getCmdbCi());
            gr.addQuery("printer", pqid);
            gr.deleteMultiple();
        }
    },

    parsePrintQueues: function(result) {
        var printerList = [];
        var tcpNames = {};
        var tcpIpPrinterPorts = g_array_util.ensureArray(result.Win32_TCPIPPrinterPort);
        for (var i = 0; i < tcpIpPrinterPorts.length; i++) {
            var t = tcpIpPrinterPorts[i];
            if (t.Name && t.HostAddress)
                tcpNames[t.Name] = t.HostAddress;
        }

        var items = g_array_util.ensureArray(result.Win32_Printer);
        for (var i = 0; i < items.length; i++) {
            var item = items[i];

            var addr = tcpNames[item.PortName];
            if (!addr || addr == 'LOCAL')
                continue;

            var printer = {};
            printer.name = item.Name;
            printer.ip_address = addr;
            printerList.push(printer);
        }

        return printerList;
    },

    getPrintQueuesOnCi: function() {
        var printQueues = {};

        // Grab currently installed print queues
        var gr = new GlideRecord("cmdb_print_queue_instance");
        gr.addQuery("installed_on", this.getCmdbCi());
        gr.query();
        while (gr.next())
            printQueues[gr.getValue("printer")] = true;

        return printQueues;
    },

    findPrintQueue: function(name, addr) {
        var gr = new GlideRecord("cmdb_ci_print_queue");
        gr.addQuery("ip_address", addr);
        gr.addQuery("name", name);
        gr.query();
        if (!gr.next()) {
            gr.setValue("name", name);
            gr.setValue("ip_address", addr);
            gr.insert();
        }

        return gr.sys_id;
    },

    zeroResults: function() {
        // do nothing; it's ok to have zero results from this sensor...
    },

    type: "DiscoverySensor"
});
