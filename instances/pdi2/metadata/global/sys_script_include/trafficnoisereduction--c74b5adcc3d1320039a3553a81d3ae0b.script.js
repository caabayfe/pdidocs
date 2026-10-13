var TrafficNoiseReduction = Class.create();
TrafficNoiseReduction.prototype = {
    initialize: function() {
    },
    
    classifyExplain: function(cl) {
        this.reason = '';
        var res = this.evaluateModel(cl, true);
        cl.reason = this.reason;
        cl.update();
    },

    // run again on the existing sa_ml_feature_data and evaluate using the typically new model
    evalModelAll: function() {
        var gr = new GlideRecord('sa_ml_feature_data');
        gr.query();
        while (gr.next()) {
            this.evaluateModel(gr);
            gr.update();
        }
    },

    classifyAll: function() {
        
        // predict cmdb_tcp
        var tcp = new GlideRecord('cmdb_tcp');
        tcp.addQuery('type', 'to');
        tcp.orderBy('process');
        tcp.orderBy('ip');
        tcp.query();
        gs.print('query: ' + tcp.getEncodedQuery());
        while (tcp.next()) {
            var cls = this.classifyTcp(tcp);
            gs.print('sys_id: ' + tcp.sys_id + ', prediction: ' + cls.prediction );
        }

        gs.print('predicted ' + tcp.getRowCount() + ' rows.');

    },
    
       classifyListeners: function() {
        
        // predict cmdb_tcp
        var tcpon = new GlideRecord('cmdb_tcp');
        tcpon.addQuery('type', 'on');
        tcpon.query();
        var onprocs = [];
        while (tcpon.next()) {
            onprocs.push('' + tcpon.process.sys_id);
        }
        var tcp = new GlideRecord('cmdb_tcp');
        tcp.addQuery('type', 'to');
        tcp.addQuery('process', 'IN', onprocs);
        tcp.orderBy('process');
        tcp.orderBy('ip');
        tcp.query();
        gs.print('query: ' + tcp.getEncodedQuery());
        while (tcp.next()) {
            var cls = this.classifyTcp(tcp);
            gs.print('sys_id: ' + tcp.sys_id + ', prediction: ' + cls.prediction );
        }
        gs.print('predicted ' + tcp.getRowCount() + ' rows.');
    },
    
    
    key2arr: function(map) {
        var arr = [];
        for (var key in map)
            arr.push(key);
        return arr;
    },

    classifyEps: function() {

        // predict cmdb_tcp
        var eps = this.findEndpoints();
        gs.print('eps: ' + JSON.stringify(eps));
        var tcpon = eps.tcpon;
        tcpon.query();
        gs.print('found ' + tcpon.getRowCount() + ' tcp listeners');
        var comp_map = {};
        while (tcpon.next()) {
            comp_map['' + tcpon.computer] = true;
        }
        var comp_ids = this.key2arr(comp_map);
        gs.print('found ' + comp_ids.length + ' computers');

        var tcp = new GlideRecord('cmdb_tcp');
        tcp.addQuery('type', 'to');
        tcp.addQuery('computer', 'IN', comp_ids);
        tcp.orderBy('process');
        tcp.orderBy('ip');
        tcp.query();
        gs.print('query: ' + tcp.getEncodedQuery());
        while (tcp.next()) {
            var cls = this.classifyTcp(tcp);
            gs.print('sys_id: ' + tcp.sys_id + ', prediction: ' + cls.prediction );
        }

        gs.print('predicted ' + tcp.getRowCount() + ' rows.');

    },
    
    classifyTcp: function(tcp) {
        // In case we already classified this cmdb_tcp record or another record with the same 
        // computer, ip, port, source process we will only update the record in sa_ml_feature_data
        // table with the correct reference to cmdb_tcp record
        var gr = new GlideRecord('sa_ml_feature_data');
        var idCon = gr.addQuery('netsat_con', tcp.sys_id); 
        var paramsCon = idCon.addOrCondition('ip', tcp.ip);
        paramsCon.addCondition('port', tcp.port); 
        paramsCon.addCondition('computer', tcp.computer); 
        paramsCon.addCondition('source_process', tcp.process); 
        gr.query();
        if (gr.next()) {
            // Update sa_ml_feature_data and reclassify if older than configurable time (default is 1 day)
            var refreshTimeMinutes = gs.getProperty('sa.cmdb_tcp_classification_refresh_time_minutes', 1440);
            var time = new GlideDateTime();
            time.subtract(refreshTimeMinutes * 60000);
            var updated = gr.sys_updated_on.getGlideObject();
            if (time.compareTo(updated) > 0) {
                if (this._classifyTcp(gr, tcp)) {
                    // Force update of the record in order to update sys_updated_on field. Otherwise, _classifyTcp function will be called each time
                    gr.setValue('computer', tcp.computer);
                    gr.setValue('netsat_con', tcp.sys_id);
                    gr.setForceUpdate(true);
                    gr.update();
                }
            }
        } else {
            if (this._classifyTcp(gr, tcp))
                gr.insert();
        }
        return gr;
    },
    
    _classifyTcp: function(cl, tcp) {
        if (!this.featureExtract(cl, tcp))
            return false;
        this.evaluateModel(cl);
        return true;
    },
    
    featureExtract: function(featureGr, conGr) {
        // gs.print('extracting features');
        if (!conGr.process.sys_created_on || !conGr.computer.sys_created_on)
            return false;

        // First set up some auxilary fields, for convinience mainly
        featureGr.netsat_con = conGr.sys_id;
        featureGr.ip = conGr.ip;
        featureGr.computer = conGr.computer;
        featureGr.source_process = conGr.process;
        featureGr.port = conGr.port;
        var port = conGr.port;
        // If the port is blacklisted skip classification alltogether
        // if (this.portBlacklisted(port) == 'yes') {
        //     cl.prediction = 'remove';
        //     return true;
        // }        

        if (conGr.ip == '127.0.0.1') {
            this.hosts = new GlideStringList();
            this.hosts.add('' + conGr.computer.sys_id);
            featureGr.target_tcp_exists = this.target_tcp_exists = 'yes';
        } else if (conGr.ip != this.ip) {
            this.hosts = SNC.HostIdentificationUtil.findHostsByIP(conGr.ip);
            featureGr.target_tcp_exists = this.target_tcp_exists = this.targetTcpExists();
        } else {
            featureGr.target_tcp_exists = this.target_tcp_exists;
        }

        this.setTargetProcAndCi(conGr, featureGr);
        

        // Now set all the features
        featureGr.port_category = this.portCategory(conGr);
        featureGr.source_process_category = this.processCategory(conGr.process, true);
        featureGr.port_high = this.portHigh(port);
        featureGr.target_host_found = this.targetHostFound(conGr, this.hosts);
        featureGr.is_localhost = this.isLocalhost(conGr, this.hosts);
        featureGr.frequency = this.calculateFrequency(conGr, featureGr);
        this.countConnections(conGr, featureGr);
        return true;
    },
    
    evaluateModel: function(cl, explain) {
        // gs.print('evaluating the model');
        var parentRule = this.getCachedModel();
        var result = this.evaluateRule(parentRule, cl, explain);
        if (result && result.length > 0) {
            cl.prediction = result[0];
            if (result.length > 1)
                cl.confidence = result[1];
        }
        return result;
    },

    evaluateRule: function(rule, cl, explain) {
        // check the rule condition
        if (rule.always_true || cl.getValue(rule.field) == rule.value) {
            if (explain) {
                this.reason = this.reason + (rule.always_true ? 'root' : rule.field +'=' + rule.value) +' k:' + rule.keep +',r:' + rule.remove + '\n';
            }
            
            //gs.print('rule: ' + JSON.stringify(rule));
            if (rule.label) 
                return [rule.label, this.confidence(rule.label, rule)];

            for (var i = 0; i < rule.children.length; i++) {
                var childRule  = rule.children[i];
                var childRuleEval = this.evaluateRule(childRule, cl, explain);
                if (childRuleEval)
                    return childRuleEval;
            }

            // none of children evaluations succeeded - predict based on keep/remove ratio
            return rule.keep > rule.remove ? ['keep', this.confidence('keep', rule)] : ['remove', this.confidence('remove', rule)];
        }
        return '';
    },
    
    confidence: function(label, rule) {                
        // gs.print('conf: label=' + label + ', rule[label]=' +rule[label] + ', rule=' + JSON.stringify(rule));
        if (rule.keep + rule.remove == 0) 
            return 0;

        return rule['' + label] / (rule.keep + rule.remove);
    },

    getCachedModel: function() {
        var rules = GlideCacheManager.get('sa.ml.model', 'traffic.rules');
        if (rules == null) {
            gs.print('Loadin the model...');
            var gr = new GlideRecord('sa_ml_model');
            gr.addQuery('name', 'Traffic Noise');
            gr.query();
            if (gr.next()) {
                rules = JSON.parse('' + gr.rules);
                GlideCacheManager.put('sa.ml.model', 'traffic.rules', rules);
            }
        }
        return rules;
    },


    has_str: function() {
        var str = arguments[0];
        for (i = 1; i < arguments.length; i++) {
            if (str.indexOf(arguments[i]) != -1)
                return true;
        }
        return false;
    },


    processCategory: function(process, source) {
        
        // gs.print('sys_id' + process.sys_id + 'process name is: ' + process.name);
        if (!process.name)
            return 'notfound';

        var pn = process.name.toLowerCase();
        if (this.has_str(pn, 'healthservice', 'nscd', 'wrapper', 'agent', 'monitoring', 'graphite', 'iexplore', 'nbdisco'))
            return 'agent';
        if (this.has_str(pn, 'httpd', 'w3wp', 'nginx', 'apache', 'httpsd.worker', 'httpsd.worker', 'webservd'))
            return 'webserver';
        if (this.has_str(pn, 'java', 'python', 'tomcat', 'redis', 'php'))
            return 'middleware';
        if (this.has_str(pn, 'sqlservr', 'mysqld', 'postgres', 'ora', 'tnslsnr', 'pmon', 'mongod'))
            return 'database';
        if (this.has_str(pn, 'exchange', 'edgetransport', 'umservice', 'umworkerprocess'))
            return 'mail';
        if (this.has_str(pn, 'squid', 'proxy'))
            return 'proxy';

        if (this.hasInvalidPrefix(process, source))
            return 'invalid';

        return 'unknown';
    },

    portCategory: function(conGr) {
        switch (Number(conGr.port)) {
            case 389:
            case 3268:
            case 636:
            case 135:
            case 5722:
            case 9389:
                return 'directory';
            case 80: // http
            case 8080: // alt http
            case 443: // https
            case 8443: // alt https
            case 9080:  // websphere http
            case 8081:  // alt https
            case 9081: // alt websphere https
            case 7443: // oracle app server
            case 5988: // wbem http
            case 5989: // wbem https
            case 5990: // wbem export https 
                return 'http';
            case 5432:  //postgres
            case 2638:  // sybase
            case 3306:  // mysql
            case 33060: // mysqlx
            case 1521:  // oracle
            case 1433:  //mssql
            case 27018:  // mongodb
            case 27019:  // mongodb
            case 28017:  // mongodb
            case 27017:  // mongodb
                return 'database';
            case 23:    // telnet
            case 22:    // ssh
            case 21:    // ftp
            case 3389:  // rdp
            case 5900:  // vnc
                return 'remoting';
            case 25:    // smtp
            case 143:   // imap
            case 110:   // pop3
            case 995:   // pop3s
            case 993:   // imaps
                return 'mail';
            case 26379:  // redis
            case 6380:   // redis
                return 'cache';
            case 10050: // zabix
                return 'agent';
        }
        return 'unknown';
    },

    targetHostFound: function(conGr, hosts) {
        if (hosts == null || hosts.isEmpty())
            return 'notfound';

        //check os
        // var host = hosts.get(0);    
        // var os = '' + host.os;    
        // if (os == 'Windows' || os == 'Windows ME' || os.indexOf('Windows 9') != -1 || os.indexOf('Windows X') != -1 || os.indexOf('Mac O') != -1)
            // return 'desktop'

        return 'found';
    },

    isLocalhost: function(conGr, hosts) {
        if (conGr.ip == '127.0.0.1')
            return 'yes';

        if (hosts == null || hosts.isEmpty())
            return 'no';

        for (var i = 0; i < hosts.size(); i++)
            if (hosts.get(i) == conGr.computer)
                return 'yes';

        return 'no';

    },

    countConnections: function(conGr, featureGr) {
        // gs.print('find process connections counts');
        if (conGr.process == this.process) {
            featureGr.many_connections = this.many_connections;
            featureGr.cluster_connections = this.cluster_connections;
            featureGr.multicon_same_ip = this.multicon_same_ip;
            return;
        }
        var gr = new GlideRecord('cmdb_tcp');
        gr.addQuery('type', 'to');
        gr.addQuery('process', conGr.process);
        gr.addQuery('sys_id', '!=', conGr.sys_id);
        gr.query();
        featureGr.many_connections = this.many_connections = gr.getRowCount() >= 20 ? 'many' : 'few';

        var sameip = 0;
        var sameport = 0;
        while (gr.next()) {
            if (gr.port == conGr.port) 
                sameport++;
            if (gr.ip == conGr.ip)
                sameip++;            
        }
        featureGr.cluster_connections = this.cluster_connections = sameport > 0 ? 'yes' : 'no';
        featureGr.multicon_same_ip = this.multicon_same_ip = sameip > 5 ? 'many' : (sameip > 0 ? 'few' : 'no');
        this.process = '' + conGr.process;
    },

    connectionRecent: function(conGr) {
        var updated = conGr.sys_updated_on.getGlideObject();
        var adayago = new GlideDateTime();
        adayago.addDays(-1);
        var threedaysago = new GlideDateTime();
        threedaysago.addDays(-3);
        if (threedaysago.compareTo(updated) > 0)
            return 'ancient';

        if (adayago.compareTo(updated) > 0)
            return 'old';

        return 'recent';
    },

    findTargetPort: function(conGr) {
        var tcpon = new GlideRecord('cmdb_tcp');
        tcpon.addQuery('type', 'on');
        tcpon.addQuery('port', conGr.port);
        tcpon.addQuery('absent', false);
        tcpon.orderByDesc('count');
        tcpon.orderByDesc('sys_updated_on');
        tcpon.order('pid');        
        if (conGr.ip == '127.0.0.1') {
            tcpon.addQuery('computer', conGr.computer);
        } else {
            tcpon.addQuery('ip', conGr.ip);
        }
        tcpon.query();
        return tcpon;
    },

    targetTcpExists: function() {
        if (this.hosts == null || this.hosts.isEmpty())
            return 'no';
        
        var tcpon = new GlideRecord('cmdb_tcp');
        tcpon.addQuery('computer', this.hosts.get(0));
        tcpon.query();
        return tcpon.getRowCount() > 0 ? 'yes' : 'no';
    },

    setTargetProcAndCi: function(conGr, featureGr) {
        
        // gs.print('conGr.ip: ' + conGr.ip + ', this.ip: ' + this.ip + ', conGr.port: ' + conGr.port + ' this.port: ' + this.port);
        if (conGr.ip == this.ip && conGr.port == this.port && conGr.computer.sys_id == this.comp_id) {            
            featureGr.target_process = this.target_process;
            featureGr.target_process_category = this.target_process_category;
            return;
        }        
        this.ip = '' + conGr.ip;
        this.port = '' + conGr.port;
        this.comp_id = '' + conGr.computer.sys_id;

        var tcpon = this.findTargetPort(conGr);
        // gs.print('target proc for: ' + conGr.process.name + '@' + conGr.computer.name + ' found ' + tcpon.getRowCount() + ' proceesses');
        featureGr.target_process = this.target_process = '';
        featureGr.target_process_category = this.target_process_category = 'notfound';

        if (!tcpon.next()) 
            return;      
        
        if (!tcpon.process.name)
            return;

        // gs.print('proc is: [' + tcpon.process + '] - ' + tcpon.process.name);
        featureGr.target_process = this.target_process = '' + tcpon.process;
        featureGr.target_process_category = this.target_process_category = this.processCategory(tcpon.process, false);
    },

    hasInvalidPrefix: function(process, source) {
        var command = process.command || "";
        command.toLowerCase();
        
        // When system process is the target on windows it could be the iis really listening there but when it's the source it's probably noise
        if (command == 'system' && source)
            return true;

        var bad = ['system32', 'wininit.exe', 'winlogon.exe', 'lsass.exe', 'fsearchctrl.exe'];
        for (var i = 0; i < bad.length; i++) {
            if (command.indexOf(bad[i]) != -1)
                return true;
        }
        return false;
    },

    portHigh: function(port) {
        return port > 49151 ? 'yes' : 'no';
    },

 
    portBlacklisted: function(port) {
        var blacklist = [88,123,135,137, 138, 139,161,445,111,2049,53,860,3260,3389,5355,49154,49155,49156,49157,49158];
        return blacklist.includes(port) ? 'yes' : 'no';
    },


    findEndpoints: function() {
        // -- Find all the endpoints with ip & port, gather ids, host, ports and compose cmdb_tcp query condition
        var ep_hp = {};
        var ep_ids = [];
        var hp_set = {};
        var ep = new GlideRecord('cmdb_ci_endpoint');
        //var cnd = ep.addNotNullQuery('ip_address');
        //cnd.addOrCondition('host', 'ISNOTEMPTY', null);
        //ep.addNotNullQuery('port');
        ep.query();
        var tcpon = new GlideRecord('cmdb_tcp');
        tcpon.addQuery('type', 'on');
        var ors, inner, ipp, key, arr;
        gs.print('found eps: ' + ep.getRowCount());
        while (ep.next()) {
            var ip = '' + ep.ip_address;
            if (!ip) {
                if (SncAddress32Bit.validate('' + ep.host_name))
                    ip = '' + ep.host_name;
                else if (SncAddress32Bit.validate('' + ep.host))
                    ip = '' + ep.host;
            }
            ep_hp['' + ep.sys_id] = {ip: ip, port: '' + ep.port, clazz: '' + ep.sys_class_name, host: '' + ep.host};
            ep_ids.push('' + ep.sys_id);        

            // gs.print('' + ep.sys_id + ':ep: ' +  ip + ':' + ep.port);
            if (ip && ep.port) {
                if (hp_set[ip + ':' + ep.port]) // dont add the condition for same ip:port more than once
                    continue;
                hp_set[ip + ':' + ep.port] = true;

                if (!ors) 
                    ors = tcpon.addQuery('type', 'off'); // a trick to get ... and (type = off or (ip='ip1' and port=80) or (ip='ip2' and port=82))
                inner = ors.addOrCondition('ip', ip);
                inner.addCondition('port', ep.port);            
            }
        }
        return {ep_hp: ep_hp, ep_ids: ep_ids, tcpon: tcpon};
    },

    // Validation related methods
    walkp1: function(ids, rel_type, eps) {
        if (ids.length == 0) return {};
        var res = [];
        var rels = new GlideRecord('cmdb_rel_ci');
        rels.addQuery('parent', 'IN', ids);
        rels.addQuery('type', rel_type);
        gs.print('rels query: ' + rels.getEncodedQuery());
        rels.query();
        while (rels.next()) {
            res.push({parent: '' + rels.parent, child: '' + rels.child});
        }       
        return res;
    },

    queryQualifiers: function(ids) {
        var children = {};
        if (ids.length == 0)
            return {};

        var ci = new GlideRecord('cmdb_ci_qualifier');
        ci.addQuery('sys_id', 'IN', ids);
        ci.query();
        while (ci.next()) {
            children['' + ci.sys_id] = '' + ci.sys_class_name;
        }
        return children;
    },

    countBs: function(ep_ids) {
        var assoc_count = {};
        var assoc = new GlideAggregate('svc_ci_assoc');
        assoc.addAggregate('count');
        assoc.addQuery('ci_id', 'IN', ep_ids);
        assoc.groupBy('ci_id');
        assoc.query();
        while (assoc.next()) {
            assoc_count['' + assoc.ci_id] = '' + assoc.getAggregate('count');
        }
        gs.print('assoc_count: ' + JSON.stringify(assoc_count));
        return assoc_count;
    },

    walkAllEps: function(ep_hp, ep_ids) {

        // gs.print('hp_ep: ' + JSON.stringify(hp_ep));
        // gs.print('ep_hp: ' + JSON.stringify(ep_hp));
        var children = ep_ids;
        var qual_to_source = {};
        var z = 0;
        var fin = [];

        while (children.length > 0 && z++ < 4) {
            var rels = this.walkp1(children, '85d98503ff100200d699ffffffffff8c' /* Applicative Flow To */);      
            children = [];
            gs.print(z + ':rels: ' + JSON.stringify(rels));
            for (var i = 0; i < rels.length; i++) {
                var rel = rels[i];
                epdata = ep_hp[rel.child];
                var traffic = false;
                var src = qual_to_source[rel.parent];
                if (src != null) {
                    rel.parent = src.src;
                    rel.traffic = src.traffic || false;
                    // gs.print('changing parent: ' + JSON.stringify(rel));
                }
                if (epdata) {
                    fin.push(rel);
                } else {
                    // potential qualifiers
                    children.push(rel.child);
                    qual_to_source[rel.child] = {src: rel.parent};
                }
            }
            // gs.print('in while children: ' + JSON.stringify(children));
            // gs.print('in while qual_to_source: ' + JSON.stringify(qual_to_source));
            var qq = this.queryQualifiers(children);
            // gs.print('qq: ' + JSON.stringify(qq));
            children = [];
            for (var id in qq) {
                if (qq[id] == 'cmdb_ci_qualifier_traffic_based_connection')
                    qual_to_source[id].traffic = true;
                children.push(id);
            }
        }
        // gs.print('children: ' + JSON.stringify(children));
        // gs.print('qual_to_source: ' + JSON.stringify(qual_to_source));
        return fin;
    },

    skipInclusions: function(fin, ep_hp) {
        // -- skip inclusion endpoint
        var i = fin.length;
        var inc_ep_to_next = {};
        while (i--) {
            var con = fin[i];
            var ep = ep_hp[con.parent];
            if (ep && GlideDBObjectManager.get().isInstanceOf(ep.clazz, 'cmdb_ci_endpoint_inclusion')) {
                (inc_ep_to_next[con.parent] = inc_ep_to_next[con.parent] || []).push(con);
                
            }
        }
        gs.print('inc_ep_to_next: ' + JSON.stringify(inc_ep_to_next));

        i = fin.length;
        while (i--) {
            var con = fin[i];
            var next = inc_ep_to_next[con.child];
            if (next) {
                fin.splice(i, 1);
                for (var j = 0; j < next.length; j++) {
                    fin.push({parent: con.parent, child: next[j].child, traffic: con.traffic || next[j].traffic});
                }
            }
        }
        return fin;
    },

    validationExists: function(gr) {
        var ex = new GlideRecord('sa_ml_traffic_validation');
        ex.addQuery('source_ip', gr.source_ip);
        ex.addQuery('source_port', gr.source_port);
        ex.addQuery('target_ip', gr.target_ip);
        ex.addQuery('target_port', gr.target_port);
        ex.addQuery('mapping', gr.mapping);
        ex.query();
        if (ex.next()) {
            if (ex.src_bs_count != gr.src_bs_count || ex.trg_bs_count != gr.trg_bs_count) {
                ex.src_bs_count = Math.max(ex.src_bs_count, gr.src_bs_count);
                ex.trg_bs_count = Math.max(ex.trg_bs_count, gr.trg_bs_count);
                ex.update();
            }
            return true;
        }
        return false;
    },

    validate: function() {
        // -- Find all the endpoints with ip & port, gather ids, host, ports and compose cmdb_tcp query condition
        var proc_ids = [];
        var eps = this.findEndpoints();
        var tcpon = eps.tcpon;
        var ep_ids = eps.ep_ids;
        var ep_hp = eps.ep_hp;
        var hp_set = {};

        var hp_ep = {};
        var fin = [];
        if (ep_ids.length > 0) {
            // gs.setProperty('glide.db.trace', true);  
            tcpon.query();
            // gs.setProperty('glide.db.trace', false);
            gs.print('found '  + tcpon.getRowCount() + ' listeners for eps');
            while (tcpon.next()) {
                hp_ep[tcpon.ip + ':' + tcpon.port] = {process:'' + tcpon.process, computer:'' + tcpon.computer}; 
                proc_ids.push('' + tcpon.process);
            }

            var assoc_count = this.countBs(ep_ids);

            for (var ep_sys_id in ep_hp) {
                var epdata = ep_hp[ep_sys_id];
                if (epdata) {
                    epdata.count = assoc_count[ep_sys_id] ? assoc_count[ep_sys_id] : 0;
                }
            }
            gs.print('ep_hp: ' + JSON.stringify(ep_hp));
            fin = this.walkAllEps(ep_hp, ep_ids);

        } else {
            gr.print('ep_ids is empty!');
        }

        gs.print('fin[' + fin.length + ']: ' + JSON.stringify(fin));

        var fin = this.skipInclusions(fin, ep_hp);
        gs.print('fin after inclusion skip [' + fin.length + ']: ' + JSON.stringify(fin));

        // -- end skip inclusion

        // -- collect per process all the outgoing tcp connections and their predictions
        var procs = {};
        var pfd = new GlideRecord('sa_ml_feature_data');

        pfd.addQuery('source_process', 'IN', proc_ids);
        gs.print('features query: ' + pfd.getEncodedQuery());
        pfd.query();
        gs.print('found ' + pfd.getRowCount() + ' features for ' + proc_ids.length + ' process ids');
        while (pfd.next()) {
            if (!pfd.source_process)
                continue;
            var prarray = procs['' + pfd.source_process] = procs['' + pfd.source_process] || [];
            var prcon = {ip: '' + pfd.ip, port: '' + pfd.port, prediction: '' + pfd.prediction, source_process: '' + pfd.source_process, 
                target_process: '' + pfd.target_process, computer: '' + pfd.computer, feat: '' + pfd.sys_id};
            // gs.print('add proc ' + pfd.sys_id + ' ' + JSON.stringify(prcon));
            prarray.push(prcon);
        }

        gs.print('hp_ep: ' + JSON.stringify(hp_ep));
        // -- write to sa_ml_traffic_validation
        gs.print('clean up sa_ml_traffic_validation');
        var gr = new GlideRecord('sa_ml_traffic_validation');
        gr.deleteMultiple();
        for (var i = 0; i < fin.length; i++) {
            var con = fin[i];   
            var parent = ep_hp[con.parent];
            var child = ep_hp[con.child];
            var pr_comp = hp_ep[parent.ip + ':' + parent.port];
            if (parent && parent.ip && parent.port && child && child.ip && child.port) {        
                gr.initialize();
                gr.source_ip = parent.ip;
                gr.source_port = parent.port;
                gr.src_bs_count = parent.count;

                gr.trg_bs_count = child.count;
                gr.target_ip = child.ip;
                gr.target_port = child.port;
                gr.mapping = con.traffic ? 'traffic' : 'pattern';
                if (this.validationExists(gr))
                    continue;

                if (pr_comp) {
                    gr.computer = pr_comp.computer;
                    gr.source_process = pr_comp.process;
                    // gs.print('1.1 setting source_process: ' + pr_comp.process);
                    var ppr = procs[pr_comp.process];
                    if (ppr) {
                        // Per each process take all the outgoing connecitons with their predictions, for those that exist in mapping 
                        // set mapping = true, for others set noise = true
                        for (var j = 0; j < ppr.length; j++) {
                            // gs.print('pr = ' + JSON.stringify(pr) + ', child = ' + JSON.stringify(child));
                            var pr = ppr[j];
                            if ((pr.ip == child.ip || pr.ip == child.host) && pr.port == child.port) {
                                gr.traffic_prediction = pr.prediction;
                                gr.feat = pr.feat;
                                // gs.print('1.2 setting target_process: ' + pr.target_process);
                                gr.target_process = pr.target_process;
                                pr.mapping = true;                      
                            } else {
                                if (!pr.mapping) {
                                    pr.noise = true;
                                    pr.source_ip = parent.ip;
                                    pr.source_port = parent.port;
                                }
                            }
                        }
                    }
                }
                gr.insert();
            }
        }


        gs.print('procs=' + JSON.stringify(procs));

        for (var key in procs) {
            var ppr = procs[key];
            for (var j = 0; j < ppr.length; j++) {
                var pr = ppr[j];
                // gs.print('pr: ' + JSON.stringify(pr));
                if (pr.mapping || !pr.noise)
                    continue;
                // gs.print('pr is noise');
                var trgr = new GlideRecord('sa_ml_traffic_validation');
                trgr.source_ip = pr.source_ip;
                trgr.source_port = pr.source_port;
                trgr.target_ip = pr.ip;
                trgr.target_port = pr.port;
                trgr.source_process = pr.source_process;
                trgr.target_process = pr.target_process;
                // gs.print('2. setting target_process: ' + pr_comp.target_process +  ', source_process: ' + pr_comp.source_process);
                trgr.computer = pr.computer;
                trgr.traffic_prediction = pr.prediction;
                trgr.feat = pr.feat;
                trgr.insert();  
            }
        }

    },
    
    calculateFrequency: function(conGr, featureGr) {
        if (!conGr.fqdn.nil() && conGr.fqdn != 'localhost') 
            featureGr.fqdn_category = 'resolves';
        else
            featureGr.fqdn_category = 'none';

        if (conGr.count.nil() || conGr.process.count.nil() || conGr.process.count == 0) 
            return 'none';

        if (conGr.count == 1) 
            return 'once';

        var fr = conGr.count / conGr.count;
        return fr > 0.3 ? 'high' : 'low';
    },
    
    
    
    type: 'TrafficNoiseReduction'
};
