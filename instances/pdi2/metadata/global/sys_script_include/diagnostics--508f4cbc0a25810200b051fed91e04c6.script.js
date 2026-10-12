gs.include("PrototypeServer");

var Diagnostics = Class.create();
Diagnostics.prototype = {

    initialize: function() {
        this.fillConditions();
        this.fillNodes();
        this.fillEventCounts();
        this.fillLogCounts();
        this.fillEmailCounts();
        this.fillLogSizes();
        this.nodeIndex = -1;
    },

    nextNode: function() {
        if (this.nodeIndex <= this.nodes.length)
            this.nodeIndex++;

        return (this.nodeIndex < this.nodes.length);
    },

    getNode: function() {
        if (this.nodeIndex < this.nodes.length)
            return this.nodes[this.nodeIndex];

        return null;
    },

    fillConditions: function() {
        this.conditions = {};
        var gr = new GlideRecord('sys_properties');
        gr.addQuery('name', 'STARTSWITH', 'diagnostics.condition.');
        gr.query();
        while (gr.next()) {
            var n = gr.name.toString().substring(22);
            var v = gr.value.toString();
            this.conditions[n] = v;
        }
    },

    fillNodes: function() {
        this.nodes = [];
        var gr = new GlideRecord('sys_cluster_state');
        gr.query();
        while (gr.next()) {
            var node = this._fillNode(gr);
            if (node)
                this.nodes.push(node);
        }
    },

    _fillNode: function(gr) {
        var systemId = gr.system_id.toString();
        var node;

        if (systemId == GlideServlet.getSystemID()) {
            node = this._fillFromLocal(gr);
        } else {
            node = this._fillFromClusterState(gr);
        }

        node.nameLink = "<a class='linked' href='sys_cluster_state.do?sys_id=" + gr.sys_id.toString() +
            "&sys_target=node_stats.stats&XML=&sysparm_stack=no' target='_new'>" + node.name + "</a>";

        return node;
    },

    _fillFromLocal: function(gr) {
        var node = {};
        node.name = gr.system_id.toString();
        node.status = gr.status.toString();
        node.lastDate = gr.nowDateTime();
        node.lastDateDiff = gs.dateDiff(node.lastDate, gs.nowDateTime(), true);

        node.stats = this._getInitNodeStats();

        try {
            var nodeStats = new GlideXMLStats().toStringWithInclude(gs.getProperty("glide.cluster.xmlstats"));
            // PRB1593473: the dashboard that uses this code path does 
            // not display or use mid-server info and including mid slows 
            // down dashboard load for instances with many mid-servers.
            if (gs.getProperty("glide.diagnostics.cluster.xmlstats.mid.disable", 'true') == 'true')
                nodeStats = this._trimMidFromXML(nodeStats);
            var xml = new XMLHelper(nodeStats);
            node.stats = xml.toObject();
        } catch (ex) {
            gs.log("ERROR: " + ex);
        }

        return node;
    },

    _fillFromClusterState: function(gr) {
        var node = {};
        node.name = gr.system_id.toString();
        node.status = gr.status.toString();
        node.lastDate = gr.most_recent_message.getDisplayValue();
        node.lastDateDiff = gs.dateDiff(node.lastDate, gs.nowDateTime(), true);

        node.stats = this._getInitNodeStats();

        if (!gr.node_stats.stats.nil()) {
            try {
                var nodeStats = gr.node_stats.stats.toString();
                // PRB1593473: the dashboard that uses this code path does 
                // not display or use mid-server info and including mid slows 
                // down dashboard load for instances with many mid-servers.
                if (gs.getProperty("glide.diagnostics.cluster.xmlstats.mid.disable", 'true') == 'true')
                    nodeStats = this._trimMidFromXML(nodeStats);
                var xml = new XMLHelper(nodeStats);
                node.stats = xml.toObject();
            } catch (ex) {
                gs.log("ERROR: " + ex);
            }
        }

        return node;
    },

    _trimMidFromXML: function(nodeStats) {
        var startTag = "<mids>";
        var endTag = "</mids>";
        var startIndex = nodeStats.indexOf(startTag);
        var endIndex = nodeStats.indexOf(endTag, startIndex);
        if (startIndex !== -1 && endIndex !== -1)
            nodeStats = nodeStats.substring(0, startIndex) + nodeStats.substring(endIndex + endTag.length);
        return nodeStats;
    },

    _getInitNodeStats: function() {
        nodeStats = {};
        nodeStats['system.memory.max'] = '?';
        nodeStats['system.memory.in.use'] = '?';

        return nodeStats;
    },

    fillEventCounts: function() {
        var agg = new GlideAggregate('sysevent');
        agg.addQuery('state', '=', 'ready');
        agg.addAggregate("COUNT");
        agg.query();
        this.eventCount = 0;
        if (agg.next())
            this.eventCount = agg.getAggregate("COUNT");
    },

    fillLogCounts: function() {
        var agg = new GlideAggregate('syslog');
        agg.addQuery('sys_created_on', '>', gs.minutesAgo(60));
        agg.addAggregate("COUNT");
        this.logCount = 0;
        agg.query();
        if (agg.next())
            this.logCount = agg.getAggregate("COUNT");
    },

    fillEmailCounts: function() {
        var oneHourAgo = gs.minutesAgo(60);
        var agg = new GlideAggregate('sys_email');
        agg.addQuery('type', 'received');
        agg.addQuery('sys_created_on', '>', oneHourAgo);
        agg.addAggregate("COUNT");
        agg.query();
        this.emailReceivedCount = 0;
        if (agg.next())
            this.emailReceivedCount = agg.getAggregate("COUNT");

        agg = new GlideAggregate('sys_email');
        agg.addQuery('type', 'sent');
        agg.addQuery('sys_created_on', '>', oneHourAgo);
        agg.addAggregate("COUNT");
        agg.query();
        this.emailSentCount = 0;
        if (agg.next())
            this.emailSentCount = agg.getAggregate("COUNT");

        this.pop3Status = '';
        this.smtpStatus = '';
        var gr = new GlideRecord('sys_status');
        gr.addQuery('name', 'glide.pop3.status');
        gr.query();
        if (gr.next())
            this.pop3Status = gr.value.toString();

        gr.initialize();
        gr.addQuery('name', 'glide.smtp.status');
        gr.query();
        if (gr.next())
            this.smtpStatus = gr.value.toString();
        else
            this.smtpStatus = gs.getMessage('No emails sent yet');
    },

    fillLogSizes: function() {

    },

    type: 'Diagnostics'
}
