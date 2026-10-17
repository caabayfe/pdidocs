// Discovery


var LBModule = Class.create();
LBModule.prototype = {
	discoveredServices : [],
	discoveredPools : [],
	discoveredPoolMembers : [],
	data : [],
	
    initialize: function() {
		this.type = '';
    },
	
	// populate the load_balancer in cmdb_ci_lb_appl
	updateLbTable: function(serverName, ip, lbTable) {
		var appTable = 'cmdb_ci_lb_appl';
		var lbName = this.type+'@'+serverName;
		var curTime = new GlideDateTime();
		
		if (lbTable != undefined)
			appTable = lbTable; 
		var lbGr = new GlideRecord(appTable);
		lbGr.addQuery('name',lbName);
		lbGr.addQuery('ip_address',ip);
		lbGr.query();
		
		if (!lbGr.next()) {
			lbGr.initialize ();
			lbGr.setValue('name', lbName);
			lbGr.setValue('ip_address', ip);
			lbGr.setValue('last_discovered', curTime);
			lbGr.setValue('discovery_source', gs.getProperty('glide.discovery.source_name', "ServiceNow"));
			lbGr.insert();
		} else {
			lbGr.setValue('last_discovered', curTime);
			lbGr.setValue('discovery_source', gs.getProperty('glide.discovery.source_name', "ServiceNow"));
			lbGr.update();
		}
		
		return lbGr;
	},

	updateNginxLbTable: function(serverName, ip, lbTable, hostCISysId, hostTable, webserverSysId) {
		var appTable = 'cmdb_ci_lb_appl';
		var lbName = this.type + '@' + serverName;
		var RunsOn_Runs = '60bc4e22c0a8010e01f074cbe6bd73c3';

		if (lbTable != undefined)
		    appTable = lbTable;
		var lbNginxGr = new GlideRecord(appTable);
		lbNginxGr.addQuery('name', lbName);
		lbNginxGr.query();

		while (lbNginxGr.next()) {

		    // Multiple Nginx load balancers can share same names, hence fetching
		    // the relevant load balancer using the web server it is associated to
		    var webserverGr = new GlideRecord('cmdb_rel_ci');
		    webserverGr.addQuery('parent', webserverSysId);
		    webserverGr.addQuery('child', lbNginxGr.getValue('sys_id'));
		    webserverGr.query();

		    if (webserverGr.next()) {

			/*
			   If Run On::Runs relationship doesn't exist between Nginx load balancer and Host CI,
			   then create one and then call IRE. Previously, IRE was not used to identify the CI
			   and the code was not populating relationship, it was only performing insert/update
			   on CI using GlideRecord. Now when the flow is switched to IRE, it tries to find the
			   dependent relationship, if it doesn't exist it creates a new Nginx Load balancer CI
			   though it exists leading to duplicates. To avoid this duplication, the relationship
			   record is first created in the below code before invoking the IRE
			 */
			new DiscoveryFunctions().createRelationshipIfNotExists(lbNginxGr.getValue('sys_id'), hostCISysId, 'Runs on::Runs');
			break;
		    }
		}

		/* Sample payload
		  {
		     "items": [
			{
			   "className": "cmdb_ci_lb_nginx",
			   "values": {
			      "name": "Nginx@nginxproxyl7mig-jt65"
			   }
			},
			{
			   "className": "cmdb_ci_linux_server",
			   "values": {
			      "sys_id": "e3a0f6828783495038370e19dabb358a"
			   }
			}
		     ],
		     "relations": [
			{
			   "type": "Runs on::Runs",
			   "parent": 0,
			   "child": 1
			}
		     ]
		 }
		*/

		var payload = {
		    "items": [{
			    "className": appTable,
			    "values": {
				"name": lbName
			    }
			},
			{
			    "className": hostTable + '',
			    "values": {
				"sys_id": hostCISysId
			    }
			}
		    ],

		    "relations": [{
			"parent": 0,
			"child": 1,
			"type": "Runs on::Runs"
		    }]
		};
		var json = new JSON();
		var output = json.decode(SNC.IdentificationEngineScriptableApi.createOrUpdateCI(gs.getProperty('glide.discovery.source_name', "ServiceNow"), json.encode(payload)));
		var lbSysId = output.items[0].sysId;
		var lbGr = new GlideRecord(appTable);
		lbGr.get('sys_id', lbSysId);

		return lbGr;
   	},

	// populate the service in cmdb_ci_lb_service table
	updateServiceTable: function(service) {
		var curTime = new GlideDateTime();
		var serviceGr = new GlideRecord('cmdb_ci_lb_service');
		serviceGr.addQuery('name', service.name);
		serviceGr.addQuery('ip_address', service.ip_address);
		serviceGr.addQuery('port', service.port);
		serviceGr.addQuery('load_balancer', service.load_balancer);
		if (service.input_url != undefined)
				serviceGr.addQuery('input_url', service.input_url);
		serviceGr.query();
		
		if (!serviceGr.next()) {
			serviceGr.initialize();
			for (var key in service)
				serviceGr.setValue(key, service[key]);
			
			serviceGr.setValue('last_discovered', curTime);
			serviceGr.setValue('discovery_source', gs.getProperty('glide.discovery.source_name', "ServiceNow"));
			serviceGr.insert();		
			
		} else {
			serviceGr.setValue('last_discovered', curTime);
			serviceGr.setValue('discovery_source', gs.getProperty('glide.discovery.source_name', "ServiceNow"));
			if (serviceGr.install_status == 100)  // if previously 'Absent' update to 'Installed'
				serviceGr.install_status = 1;
			serviceGr.update();
		}
		
		this.discoveredServices.push(serviceGr.sys_id);
		return serviceGr;
	},
	
	// populate pool information  in cmdb_ci_lb_pool table
	updatePoolTable: function(poolName, lbMethod, lbGr, serviceGr) {
		var sysId = lbGr.sys_id+ '';
		var poolSysId = null; 
		var curTime = new GlideDateTime ();
		var poolGr = new GlideRecord('cmdb_ci_lb_pool');
		poolGr.addQuery('name', poolName);
		poolGr.addQuery('load_balancer', sysId);
		poolGr.query ();
		
		if (!poolGr.next ()) {
			poolGr.initialize ();
			poolGr.setValue('name', poolName); 
			poolGr.setValue('load_balancer', sysId);
			poolGr.setValue('load_balancing_method', lbMethod);
			poolGr.setValue('last_discovered', curTime);
			poolGr.setValue('discovery_source', gs.getProperty('glide.discovery.source_name', "ServiceNow"));
			poolSysId = poolGr.insert();
		} else {
			poolGr.setValue('last_discovered', curTime);
			poolGr.setValue('discovery_source', gs.getProperty('glide.discovery.source_name', "ServiceNow"));
			if (poolGr.install_status == 100)  // if previously 'Absent' update to 'Installed'
				poolGr.install_status = 1;
			poolSysId = poolGr.update();
		}
		serviceGr.setValue('pool', poolSysId);
		serviceGr.update();
		// create relation between service service and pool pool 
		if (poolSysId)
			g_disco_functions.createRelationshipIfNotExists(serviceGr.sys_id+'', poolGr.sys_id+'', 'Uses::Used by');
		
		this.discoveredPools.push(poolSysId);
		return poolGr;
		
	},
	
	// populate pool members information  in cmdb_ci_lb_pool_member table
	updatePoolMemberTable: function (lbMember, poolGr) {
		
		var curTime = new GlideDateTime ();
		var memberSysId = null; 
		var pmGr = new GlideRecord('cmdb_ci_lb_pool_member');
		pmGr.addQuery('name', lbMember.name);
		pmGr.addQuery('service_port', lbMember.service_port);
		pmGr.addQuery('load_balancer', poolGr.getValue('load_balancer'));
		if (lbMember.fqdn != undefined)
			pmGr.addQuery('fqdn', lbMember.fqdn);
		else
			pmGr.addQuery('ip_address', lbMember.ip_address);
		
		//pmGr.addQuery('pool',poolGr.getValue('sys_id')+'');
		pmGr.query();
		
		if (!pmGr.next()) {
			pmGr.initialize();
			for (var key in lbMember)
				pmGr.setValue(key,lbMember[key]); 
			pmGr.setValue('last_discovered', curTime);
			pmGr.setValue('discovery_source', gs.getProperty('glide.discovery.source_name', "ServiceNow"));
			pmGr.setValue('pool', poolGr.getValue('sys_id'));
			memberSysId = pmGr.insert (); 
		} else {
			pmGr.setValue ('last_discovered', curTime);
			pmGr.setValue('discovery_source', gs.getProperty('glide.discovery.source_name', "ServiceNow"));
			if (pmGr.install_status == 100)  // if previously 'Absent' update to 'Installed'
				pmGr.install_status = 1;
			pmGr.setValue('pool', poolGr.getValue('sys_id'));
			memberSysId = pmGr.update ();
		}
		// create relation between service tp pool (has to be completed)
		if (memberSysId)
			g_disco_functions.createRelationshipIfNotExists(poolGr.sys_id+'', pmGr.sys_id+'', 'Members::Member of');
		this.discoveredPoolMembers.push(memberSysId);
	},
	
	// reconcile services, pools and pool members of a load balancer. 
	reconcile: function(lbSysId){
		this._reconcile('cmdb_ci_lb_pool_member', this.discoveredPoolMembers, lbSysId);
		this._reconcile('cmdb_ci_lb_pool', this.discoveredPools,lbSysId);
		this._reconcile('cmdb_ci_lb_service', this.discoveredServices, lbSysId);
	},
	
	// reconcile data in a table for a load balancer based on discovered data
	// mark record 'Absent' if not found
	_reconcile: function (table, populatedData, lbSysId) {
		var gr = new GlideRecord(table);
		gr.addQuery('load_balancer', lbSysId);
		gr.query();
		while (gr.next()) {
			var found = false;
			for (var i = 0; i < populatedData.length && !found; i++) {
				if (populatedData[i] == gr.getValue('sys_id'))
					found = true;
			}
			if (!found) { 
				gr.install_status = 100;  // 'Absent'
				gr.update();
			}
		}
	},
	
	/*
	 * not currently called, it was used when we were deleting on reconcile
	 * but now we are marking absent and the relationships are allowed to remain
	 */
	_reconcileRelations: function(delSysId) {
		var relGr = new GlideRecord('cmdb_rel_ci');
		var gr1 = relGr.addQuery('parent', delSysId);
		gr1.addOrCondition('child', delSysId);
		relGr.query();
		relGr.deleteMultiple();
	},
	
    type: 'LBModule'
};
