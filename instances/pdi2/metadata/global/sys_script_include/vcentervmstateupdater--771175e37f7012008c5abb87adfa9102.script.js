var VCenterVmStateUpdater;
gs.include("DiscoveryIncludes");

(function() {
var gr, biosUuid, correlationId, vmInstanceUuid, vCenterInstanceUuid, vmObjectId,
	vCenterSysId, datacenterMorId, datacenterSysId, ip, event, evt,
	// The Event object has members for datastore, datacenter, vm, etc.  Each is of a different
	// type - Event.ds is a DatastoreEventArgument, Event.datacenter is a DatacenterEventArgument.
	// For the most part, the EventArgument has a member with the same name that's a reference
	// to the ManagedObject.  So Event.datacenter.datacenter is a ManagedObjectReference to the
	// event's datacenter, etc.  Unfortunately the network is in Event.net.network.  I could
	// pass two names to the function that extracts this argument, or special case 'net' in
	// the function, but it seems slightly cleaner to map event member name to argument member
	// name, using the event member name as the default value for the argument member name.
	// Note that it looks like datastores will have this problem - the member in Event is
	// named 'ds', but the member in the EventArgument is named 'datastore'.  However,
	// DatastoreEvent has another member named 'datastore' (which presumably has the same
	// value as ds).
	memberNames = {
		net: 'network'
	},
	// Events which use the same handler definitely need to be included.  We're going to add those in code below.
	
	powerOnEvtsToUse = [ 'VmPoweredOffEvent', 'VmPowerOffOnIsolationEvent', 'VmShutdownOnIsolationEvent', 'VmSuspendedEvent' ],
	powerOffEvtsToUse = [ 'VmPoweredOnEvent', 'DrsVmPoweredOnEvent', 'VmRestartedOnAlternateHostEvent', 'VmSuspendedEvent' ],
	suspendEvtsToUse = [ 'VmPoweredOnEvent', 'DrsVmPoweredOnEvent', 'VmRestartedOnAlternateHostEvent', 'VmPoweredOffEvent', 'VmPowerOffOnIsolationEvent' ];

VCenterVmStateUpdater = {
	process: process,

	getRecordForEvent: getRecordForEvent,

	// VCenterVmStateUpdater.handlers is used by the "Add Handled vCenter Events"
	// business rule to decide which events get added to new event collectors
	handlers: {
		// VM events
		VmPoweredOnEvent: { fn: poweredOn, evtName: 'vm', compareEvtTime: powerOnEvtsToUse },
		DrsVmPoweredOnEvent: { fn: poweredOn, evtName: 'vm', compareEvtTime: powerOnEvtsToUse },
		VmRestartedOnAlternateHostEvent: { fn: poweredOn, evtName: 'vm', compareEvtTime: powerOnEvtsToUse },  // The host should be updated by a migration event (maybe?)

		VmPoweredOffEvent: { fn: poweredOff, evtName: 'vm', compareEvtTime: powerOffEvtsToUse },
		VmPowerOffOnIsolationEvent: { fn: poweredOff, evtName: 'vm', compareEvtTime: powerOffEvtsToUse },
		VmShutdownOnIsolationEvent: { fn: poweredOff, evtName: 'vm', compareEvtTime: powerOffEvtsToUse },

		VmSuspendedEvent: { fn: suspended, evtName: 'vm', compareEvtTime: suspendEvtsToUse },
		VmRelocatedEvent : { fn: relocated, evtName: 'vm' },
		VmMigratedEvent : { fn: relocated, evtName: 'vm' },
		DrsVmMigratedEvent : { fn: relocated, evtName: 'vm' },
		VmRemovedEvent: { fn: removed, evtName: 'vm' },

		VmClonedEvent: { fn: probeManagedObject, evtName: 'vm' },
		VmCreatedEvent: { fn: probeManagedObject, evtName: 'vm' },
		VmDeployedEvent: { fn: probeManagedObject, evtName: 'vm', ignoreTemplate: true },
		VmDiscoveredEvent: { fn: probeManagedObject, evtName: 'vm' },
		VmRegisteredEvent: { fn: probeManagedObject, evtName: 'vm' },
		VmReconfiguredEvent: { fn: probeManagedObject, evtName: 'vm' },    // TODO: Use the VirtualMachineConfigSpec that's in the event

		VmInstanceUuidAssignedEvent: { fn: updateVmField.bind(0, 'vm_instance_uuid', 'instanceUuid'), evtName: 'vm' },
		VmRenamedEvent: { fn: updateVmField.bind(0, 'name', 'newName'), evtName: 'vm' },
		VmUuidAssignedEvent: { fn: vmUuidAssignedEvent, evtName: 'vm' },

		VmMacAssignedEvent: { fn: probeManagedObject, evtName: 'vm' },
		VmMacChangedEvent: { fn: probeManagedObject, evtName: 'vm' },

		// Cluster events
		ClusterCreatedEvent: { fn: probeManagedObject, evtName: 'computeResource' },
		ClusterReconfiguredEvent: { fn: probeManagedObject, evtName: 'computeResource' },
		ClusterDestroyedEvent: { fn: markStale.bind(0, 'cmdb_ci_vcenter_cluster', 'computeResource'), evtName: 'computeResource' },

		// Datastore events
		DatastoreRenamedEvent: { fn: updateField.bind(0, 'cmdb_ci_vcenter_datastore', 'name', 'datastore', 'newName'), evtName: 'datastore' },

		VMFSDatastoreCreatedEvent: { fn: probeManagedObject, evtName: 'datastore' },
		DatastoreDiscoveredEvent: { fn: probeManagedObject, evtName: 'datastore' },
		NASDatastoreCreatedEvent: { fn: probeManagedObject, evtName: 'datastore' },
		LocalDatastoreCreatedEvent: { fn: probeManagedObject, evtName: 'datastore' },
		VMFSDatastoreExpandedEvent: { fn: probeManagedObject, evtName: 'datastore' },
		DatastoreDestroyedEvent: { fn: markStale.bind(0, 'cmdb_ci_vcenter_datastore', 'datastore'), evtName: 'datastore' },

		// Network events
		DVPortgroupCreatedEvent: { fn: probeManagedObject, evtName: 'net' },
		DVPortgroupRenamedEvent: { fn: updateField.bind(0, 'cmdb_ci_vcenter_dv_port_group', 'name', 'net', 'newName'), evtName: 'net' },
		DVPortgroupDestroyedEvent: { fn: markStale.bind(0, 'cmdb_ci_vcenter_dv_port_group', 'net'), evtName: 'net' },

		// Resourcepool events
		ResourcePoolDestroyedEvent: { fn: markStale.bind(0, 'cmdb_ci_esx_resource_pool', 'resourcePool'), evtName: 'resourcePool' },
		ResourcePoolCreatedEvent: { fn: probeManagedObject, evtName: 'resourcePool' },
		ResourcePoolMovedEvent: { fn: probeManagedObject, evtName: 'resourcePool' },
		ResourcePoolReconfiguredEvent: { fn: probeManagedObject, evtName: 'resourcePool' },

		// DVS events
		DvsCreatedEvent: { fn: probeManagedObject, evtName: 'dvs' },
		DvsRenamedEvent: { fn: updateField.bind(0, 'cmdb_ci_vcenter_dvs', 'name', 'dvs', 'newName'), evtName: 'dvs' },
		DvsDestroyedEvent: { fn: markStale.bind(0, 'cmdb_ci_vcenter_dvs', 'dvs'), evtName: 'dvs' },

		// Datacenter events
		DatacenterCreatedEvent: { fn: probeManagedObject, evtName: 'datacenter' },
		DatacenterRenamedEvent: { fn: updateField.bind(0, 'cmdb_ci_vcenter_datacenter', 'name', 'datacenter', 'newName'), evtName: 'datacenter' },
		
		// Host events
		HostRemovedEvent : { fn : removeHost, evtName: 'host'},
		HostAddedEvent : { fn: probeManagedObject, evtName: 'host' },
		EnteredMaintenanceModeEvent : { fn: hostEnteredMaintenance, evtName: 'host' },
		//Rediscovering Host to capture changes that may have occurred during maintenance
		ExitMaintenanceModeEvent : { fn: probeManagedObject, evtName: 'host' },
		DatastoreRemovedOnHostEvent : { fn: probeManagedObject, evtName: 'host' },
		HostConfigAppliedEvent : { fn: probeManagedObject, evtName: 'host' },
		HostShutdownEvent : { fn: hostShutdown, evtName: 'host' }
	}
};

var name1, name2, handler1, handler2,
	handlers = VCenterVmStateUpdater.handlers,
	errNum = 0;

// We handle all VMWare events in one of two distinct ways:
// 1) If the event contains enough information we update the CI based solely on the event
// 2) Otherwise we trigger a discovery on the CI.
// In the first case we need to make sure we're not overwriting information based on an outdated event,
// so we'll compare the event time (vCenter's timestamp) to other events.  We don't care about pending
// discoveries (because we can't change what happens.)
// In the second case we're going to trigger a discovery.  It doesn't affect the correctness of the
// results if we trigger multiple discoveries but we'd rather avoid it when it's unnecessary.  We
// don't care about unprocessed events because the discovery will get all information about the CI.
for (name1 in handlers) {
	handler1 = handlers[name1];
	// Currently the only functions that trigger a discovery are those with handler probeManagedObject().
	// Other handlers all update the CI based on data in the event.  Among these handlers we want to check event
	// timestamps for all other handlers which affect the same data.  If two handlers are calling the same
	// function then they both affect the same data, e.g. we call poweredOn() for events VmPoweredOnEvent,
	// DrsVmPoweredOnEvent and VmRestartedOnAlternateHostEvent.  The events all affect the power state.
	// Other events affect the power state also but don't call poweredOn(): VmPoweredOffEvent,
	// VmPowerOffOnIsolationEvent, VmShutdownOnIsolationEvent, VmSuspendedEvent.  We have to pre-populate
	// handler.compareEvtTime manually in this case.
	if (handler1.fn == probeManagedObject)
		handler1.checkPendingDisco = true;
	else {
		handler1.compareEvtTime = handler1.compareEvtTime || [ ];
		for (name2 in handlers) {
			handler2 = handlers[name2];
			if (handler1.fn == handler2.fn)
				handler1.compareEvtTime.push(name2);
		}
	}
}

function process(eccQueueSysId, eventName, paramStr) {
	var statusSysId, eccQGr, parm2, gr, errorMsg,
		logIt = true,
		status = 'complete';

	eccQGr = new GlideRecord('ecc_queue');
	eccQGr.get(eccQueueSysId);

	errorMsg = inner();

	// This code is probably overly tricky.  A few points to note:
	// 1. logIt will only be true if inner() returns an error message.  In this
	//    case the error has not been logged elsewhere and needs to be logged here.
	// 2. inner() may return an error message with logIt set to false.  This
	//    indicates that the error has been logged elsewhere.
	// 3. It's possible for an event handler to return both a statusSysId and
	//    and error.  (One short lived version of the code did this, but I don't
	//    think it's happening now.)  In this case the status is 'discovering'.
	// 4. Except for case 3 the presence of an error message indicates an error.
	// 5. We don't know that anything is listening to VCenterVmStateUpdater.processed.
	//    This code has to be self-contained, which only means that any warning or
	//    error has to be logged somewhere in VCenterVmStateUpdater.

	if (logIt)
		gs.warn(errorMsg);

	if (errorMsg) {
		errorMsg = '' + errorMsg;   // It should already be a string, but convert it just in case.
		status = 'error';
	}

	if (statusSysId) {
		statusSysId = '' + statusSysId;    // Convert it to a real string
		status = 'discovering';
	}

	parm2 = {
		statusSysId: statusSysId,
		errorMsg: errorMsg,
		event: '' + paramStr,
		eventName: '' + eventName
	};

	var isUnhandledEventError = errorMsg && errorMsg.indexOf('No handler for configured event') !== -1;

	if (!isUnhandledEventError) {
    	gr = getRecordForEvent(eccQueueSysId, eventName, paramStr);
    	parm2.ciSysId = gr && ('' + gr.sys_id);
    	parm2.ciTable = gr && ('' + gr.getTableName());
	} else {
    	parm2.ciSysId = '';
    	parm2.ciTable = '';
	}

	gs.eventQueue('VCenterVmStateUpdater.processed', eccQGr, status, JSON.stringify(parm2));

	function inner() {
		var fn, handler, ret, mo;

		event = eventName + '';
		if (JSUtil.nil(event))
			return 'VCenterVmStateUpdater: Cannot process the vCenter event, it is null or empty';

		handler = VCenterVmStateUpdater.handlers[event];
		fn = handler && handler.fn;

		if (!handler || !fn || !handler.evtName)
			return 'VCenterVmStateUpdater: No handler for configured event ' + event;

		evt = JSON.parse(paramStr);
		getDatacenterIds(evt);

		if (JSUtil.nil(vCenterInstanceUuid))
			return 'VCenterVmStateUpdater: The vCenterInstanceUuid could not be determined.';

		logIt = false;
		mo = evt.data[handler.evtName][memberNames[handler.evtName] || handler.evtName];  // See the big comment on line 14.

		if (useEvent(eccQGr, mo.val, handler.checkPendingDisco, handler.compareEvtTime))
			ret = fn(evt, handler.evtName, handler);

		if (ret) {
			statusSysId = ret.statusGr && ret.statusGr.sys_id;
			return ret.errorMsg;
		}
	}
}

/*
 * Get the GlideRecord for the CI represented by the event.
 *
 * A note on parameter overloading:
 * A ServiceNow event handler receives a single argument named 'event'
 * which contains data members 'instance', 'parm1' and 'parm2'.  The
 * OOTB event handler for automation.vcenter events pulls these
 * parameters out and calls VCenterVmStateUpdater.process(), which
 * names the parameters 'eccQueueSysId', 'eventName' and 'paramStr'.
 * When you call this function, you can pass the event as a single
 * argument, or you can pass the three data members as they are
 * passed to 'process'.
 */
function getRecordForEvent(eccQueueSysId, eventName, paramStr) {
	var event, evt, handler, ret;

	if (arguments.length == 1) {
		eventName = eccQueueSysId.parm1;
		paramStr = eccQueueSysId.parm2;
		eccQueueSysId = eccQueueSysId.instance;
	}

	event = eventName + '';
	evt = JSON.parse(paramStr);
	handler = VCenterVmStateUpdater.handlers[event];
	ret = makeGrForEvent(evt, handler.evtName, handler);

	return ret.gr;
}

function exploreVmNics(evt) {
	try {
		var vm = evt.data.vm.vm;
		return { statusGr: SNC.DiscoveryVCenterAPI.discoverVmHardware(vCenterSysId, [vm.val], null, evt.data.agent, { nicOnly: 'true' }) };
	} catch (e) {
		return { errorMsg: eventHandlerExceptionMsg(evt, vm, e) };
	}
}

var typeToTable = {
	Datacenter: 'cmdb_ci_vcenter_datacenter',
//	VirtualMachine:  // Special handling below
	Network: 'cmdb_ci_vcenter_network',
	VmwareDistributedVirtualSwitch: 'cmdb_ci_vcenter_dvs',
	DistributedVirtualPortgroup: 'cmdb_ci_vcenter_dv_port_group',
	HostSystem: 'cmdb_ci_esx_server',
	ClusterComputeResource: 'cmdb_ci_vcenter_cluster',
	ComputeResource: 'cmdb_ci_vcenter_cluster',
	ResourcePool: 'cmdb_ci_esx_resource_pool',
	Datastore: 'cmdb_ci_vcenter_datastore',
	StoragePod: 'cmdb_ci_vcenter_datastore',
	Folder: 'cmdb_ci_vcenter_folder'
};

function probeManagedObject(evt, name, handler) {
	var idCollection,
		ret = makeGrForEvent(evt, name, handler),
		mo = ret.mo,
		ex = ret.ex;

	if (ex)
		return { errorMsg: eventHandlerExceptionMsg(evt, mo, ex) };

	if (!ret.noDiscoveryNecessary) {
		idCollection = new SNC.VCenterIdCollection();
		idCollection.putObjectMorId(mo.type, mo.val);
		return { statusGr: SNC.DiscoveryVCenterAPI.discoverManagedObjects(vCenterSysId, datacenterSysId, idCollection, null, evt.data.agent) };
	}

	// TODO: We will infrequently receive (and detect) simultaneous events that
	// require probing the same object.  If we get here then this happened and
	// we decided to probe the object in response to the other event.  We don't
	// have the sys_id of the other status so we can't return it.  This means
	// we're going to trigger a VCenterVmStateUpdater.processed event with
	// status 'complete' even though it isn't.
}

/*
 * Make or find a GlideRecord for the CI represented by the event.  Returns an object
 * that contains:
 *   mo: The managed object (containing 'type' and 'val') for the event
 *   table: The table for the CI
 *   gr: The GlideRecord made/found
 *   noDiscoveryNecessary: Set to true if we tried to create a stub but failed (because
 *     someone else got the mutex, indicating that they created the stub and will discover it.)
 *   ex: Any exception that might occur
 *
 * If an exception occurs then no other values are guaranteed to be present.  If no exception
 * occurs than all values will be present (except noDiscoveryNecessary where absence indicates false.)
 */
function makeGrForEvent(evt, name, handler) {
	var m, gr, mo, ret, table, csName;

	try {
		mo = evt.data[name][memberNames[name] || name];  // See the big comment on line 14.
		table = typeToTable[mo.type];
		ret = { mo: mo, table: table };

		if (mo.type == 'VirtualMachine') {
			table = 'cmdb_ci_vmware_instance';
			if (!handler.ignoreTemplate && evt.data.template)
				table = 'cmdb_ci_vmware_template';
		}

		// We often get multiple events when an object is created, triggering
		// multiple discoveries of the same object.  We don't lock the database
		// during normal discovery, so we can wind up with two records for the
		// new object.  This code avoids both the duplicate record and triggering
		// multiple probes (occasionally) by inserting a new record inside a mutex.
		if (table) {
			ret.gr = findRecord();
			if (!ret.gr) {
				csName = vCenterSysId + ':' + mo.val;
				m = new Mutex(csName);
				m.setMaxSpins(0);

				ret.gr = m.enterCriticalSection(csName, 0, createRecord);

				if (!ret.gr) {
					ret.noDiscoveryNecessary = true;
					// If different thread has the critical section we need
					// to wait for it to create the record before trying
					// to get it.  Just try to get the record in the same
					// critical section, waiting the default amount this
					// time.
					m = new Mutex(csName);
					ret.gr = m.enterCriticalSection(csName, 0, findRecord);
				}
			}
		}
	} catch (ex) {
		ret.ex = ex;
	}

	return ret;

	function findRecord() {
		if(table == 'cmdb_ci_vmware_instance')
			return findVMInstanceRecord();
		var gr = new GlideRecord(table);
		gr.addQuery('object_id', mo.val);
		gr.addQuery('vcenter_ref', vCenterSysId);
		gr.query();
		if (gr.next())
			return gr;
	}

	//Using findVMInstanceRecord() to overcome the issue when VM migrates(where attributes such as bios_uuid, vm_instance_uuid, mor_id changes).
	//This uses the index from VCenterVMsSensor, thus unifying the way Discovery and Event try to identify the VMs from cmdb_ci_vmware_instance

	function findVMInstanceRecord() {

		var schema = VCenterVMsSensor.schema;
		var obj = {
			type: evt.data.vm.vm.type,
			morid: evt.data.vm.vm.val,
			name: evt.data.vm.name,
			correlation_id: VMUtils.turnUuidToCorrelationId(evt.vm_bios_uuid),
			vm_instance_uuid: evt.vm_instance_uuid,
			template: evt.data.template,
			object_id: evt.data.vm.vm.val,
			sys_class_name: 'cmdb_ci_vmware_instance',
			bios_uuid: evt.vm_bios_uuid,
			vcenter_uuid: evt.vcenter_instance_uuid
		};
		
		gr = JsonCi.getRecord(obj,schema.cmdb_ci_vmware_instance,true);
		return gr;

	}
	
	function createRecord() {
		var gr = findRecord();
		if (gr)
			return gr;

		gr = new GlideRecord(table);
		gr.initialize();
		gr.object_id = mo.val;
		gr.morid = mo.val;
		gr.vcenter_ref = vCenterSysId;
		gr.vcenter_uuid = vCenterInstanceUuid;
		gr.name = evt.data[name].name;
		if (table == 'cmdb_ci_vmware_instance') {
			gr.correlation_id = VMUtils.turnUuidToCorrelationId(evt.vm_bios_uuid);
			gr.vm_instance_uuid = evt.vm_instance_uuid;
		}
		
		gr.insert();
		return gr;
	}
}

// process power on event
function poweredOn(evt) {
	var errorMsg = validateVMInstance(evt);
	if (errorMsg)
		return { errorMsg: errorMsg };
	if(gr.install_status != '7') {
		gr.state = 'on';
		gr.update();
	}
}

// process power off event
function poweredOff(evt) {
	var errorMsg = validateVMInstance(evt);
	if (errorMsg)
		return { errorMsg: errorMsg };
	if(gr.install_status != '7') {
		gr.state = 'off';
		gr.update();
	}
}

// process Suspend (paused) event
function suspended(evt) {
	var errorMsg = validateVMInstance(evt);
	if (errorMsg)
		return { errorMsg: errorMsg };
	if(gr.install_status != '7') {
		gr.state = 'paused';
		gr.update();
	}
}

function removed(evt) {
	var errorMsg = validateVMInstance(evt);
	if (errorMsg)
		return { errorMsg: errorMsg };

	var name;
	var isStale = JSON.parse(SNC.DiscoveryCIReconciler.isStale(JSON.stringify([ '' + gr.sys_id ])));
	var staleVms = [ ];

	for (name in isStale) {
		if (!isStale[name])
			staleVms.push(name);
	}

	if (staleVms.length == 1)
		CloudCIReconciler.updateVmwareGuestStaleness(gr, true);
	else if (!staleVms.length)
		gs.warn('VCenterVmStateUpdater: Cannot process the VmRemovedEvent, no CIs found');
	else
		gs.warn('VCenterVmStateUpdater: Unable to determine correct CI for ' + vmObjectId);
}

// process relocated event
function relocated(evt) {
	var dcGr, dcMor, dsGr, dsMor, esxGr, esxMor, clusterGr, clusterMor,
		errorMsg = validateVMInstance(evt);

	if (errorMsg)
		return { errorMsg: errorMsg };

	// validateVMInstance() sets 'vmInstanceUuid' and 'gr' (to the VM's GlideRecord)
	// So don't use 'gr' here!!!

	dsMor = evt.data.ds.datastore.val;
	prevDsMor = evt.data.sourceDatastore.datastore.val;
	if (dsMor != prevDsMor) {
		errorMsg = updateRelationship('child', 'parent', dsMor, prevDsMor, 'cmdb_ci_vcenter_datastore', 'Provides storage for::Stored on');
		if (!errorMsg) {
			// Finally, we need to modify the image path to update the new datastore
			var currentPath = '' + gr.image_path;

			if (currentPath) {
				// The datastore resides between the []'s at the start of the path, update it
				var newPath = currentPath.replace(/\[(.*?)\]/, "[" + evt.data.ds.name + "]");
				gr.image_path = newPath;
				gr.update();
			}
		}
	}

	esxMor = evt.data.host.host.val;
	prevEsxMor = evt.data.sourceHost.host.val;
	if (esxMor != prevEsxMor)
		errorMsg = updateRelationship('parent', 'child', esxMor, prevEsxMor, 'cmdb_ci_esx_server', 'Registered on::Has registered') || errorMsg;

	if (errorMsg)
		return { errorMsg: errorMsg };

	function updateRelationship(vmGen, otherGen, otherMorid, sourceMorid, otherTable, relName) {
		var otherGr = new GlideRecord(otherTable);
		otherGr.addQuery('vcenter_uuid', vCenterInstanceUuid);
		otherGr.addQuery('object_id', otherMorid);
		otherGr.query();
		if (otherGr.getRowCount() != 1)
			return 'Expected 1 but found ' + otherGr.getRowCount() + ' records for ' + otherTable + ' for vCenter ' + vCenterInstanceUuid + ', object_id ' + otherMorid;
		otherGr.next();
		
		if(otherTable == 'cmdb_ci_esx_server') {
			var guestRelGr = new GlideRecord('cmdb_rel_ci');
			guestRelGr.addQuery('type.name','Instantiates::Instantiated by');
			guestRelGr.addQuery('child',gr.sys_id);
			guestRelGr.query();

			if (guestRelGr.getRowCount() == 1) {
				guestRelGr.next();

				var guestESXRelGr = new GlideRecord('cmdb_rel_ci');

				guestESXRelGr.addQuery('type.name','Virtualized by::Virtualizes');
				guestESXRelGr.addQuery('child.sys_class_name','cmdb_ci_esx_server');
				guestESXRelGr.addQuery('parent',guestRelGr.parent.sys_id);
				guestESXRelGr.query();

				if (guestESXRelGr.getRowCount() == 1) {
				    guestESXRelGr.next();
				    guestESXRelGr.child = otherGr.sys_id;
				    guestESXRelGr.update();
				}
			}
		}

		var relGr = new GlideRecord('cmdb_rel_ci');
		relGr.addQuery('type.name', relName);
		relGr.addQuery(vmGen, '' + gr.sys_id);
		relGr.addQuery(otherGen + '.sys_class_name', otherTable);
		if (otherTable == 'cmdb_ci_vcenter_datastore') {
			var sourceDsGr = new GlideRecord(otherTable);
			sourceDsGr.addQuery('vcenter_uuid', vCenterInstanceUuid);
			sourceDsGr.addQuery('object_id', sourceMorid);
			sourceDsGr.query();
			if (sourceDsGr.getRowCount() != 1)
				return 'Expected 1 but found ' + sourceDsGr.getRowCount() + ' records for ' + otherTable + ' for vCenter ' + vCenterInstanceUuid + ', object_id ' + sourceMorid;
			sourceDsGr.next();
			relGr.addQuery(otherGen, '' + sourceDsGr.sys_id);
		}
		relGr.query();
		if (relGr.getRowCount() != 1)
			return 'Expected 1 relationship but found ' + relGr.getRowCount() + ' for ' + relName + ' between ' + gr.sys_id + ' and ' + otherTable;
		relGr.next();

		relGr[otherGen] = otherGr.sys_id;
		relGr.update();
	}
}

function validateVMInstance(evt) {

	var errorMsg = inner();
	errorMsg && gs.warn(errorMsg);
	return errorMsg;

	function inner() {
		try {
			biosUuid = evt.vm_bios_uuid;
			vmInstanceUuid = evt.vm_instance_uuid;
			vmObjectId = evt.data.vm.vm.val;

			if (event == 'VmRemovedEvent')
				gr = VmwareVmCorrelator.getVmInstances(vCenterInstanceUuid, vmObjectId);
			else {
				if(JSUtil.nil(biosUuid))
					return 'VCenterVmStateUpdater: Cannot process this VM BIOS UUID, it is null or empty';

				correlationId = VMUtils.turnUuidToCorrelationId(biosUuid);
				if (correlationId.length == 0)
					return 'VCenterVmStateUpdater: The correlationId could not be generated for BIOS UUID ' + biosUuid;

				if (JSUtil.nil(vmInstanceUuid))
					return 'VCenterVmStateUpdater: The vmInstanceUuid could not be determined.';

				gr = VmwareVmCorrelator.getVmInstance(vmInstanceUuid, vCenterInstanceUuid, correlationId, vmObjectId);
			}
		} catch (ex) {
			return 'VCenterVmStateUpdater: ' + ex.msg || ex.toString();
		}

		if (!gr)
			return 'VCenterVmStateUpdater: Unable to locate a VM Instance record';
	}
}
	
	function removeHost (evt) {
 		if(!evt.data || !evt.data.host || !evt.data.host.host || !evt.data.host.host.val)
			return { errorMsg: 'VCenterVmStateUpdater: Unable to locate the morid for ESX server'};
			
		var morid = evt.data.host.host.val;
		var gr = new GlideRecord('cmdb_ci_esx_server');
		gr.addQuery('morid',morid);
		gr.addQuery('vcenter_uuid',vCenterInstanceUuid);
		gr.query();
		if(gr.next()) {
			gr.setValue('install_status',7);
			gr.update();
			markStale('cmdb_ci_esx_server','host',evt);
		}
		else
			return { errorMsg: 'VCenterVmStateUpdater: No ESX server with morid ' + morid + ' and vCenter UUID ' + vCenterInstanceUuid + ' found.' };
	}
	
function hostEnteredMaintenance(evt) {
	if(!evt.data || !evt.data.host || !evt.data.host.host || !evt.data.host.host.val)
			return { errorMsg: 'VCenterVmStateUpdater: Unable to locate the morid for ESX server'};
	evt.data.install_status = 3;
	updateField('cmdb_ci_esx_server', 'install_status', 'host', 'install_status', evt);
}
	
function hostShutdown(evt) {
	if(!evt.data || !evt.data.host || !evt.data.host.host || !evt.data.host.host.val)
			return { errorMsg: 'VCenterVmStateUpdater: Unable to locate the morid for ESX server'};
	evt.data.power_state = 'poweredOff';
	updateField('cmdb_ci_esx_server', 'power_state', 'host', 'power_state', evt);
}
	

function markStale(tableName, evtObjName, evt) {
	var mo = evt.data[evtObjName][memberNames[evtObjName] || evtObjName],  // See the big comment on line 14.
		gr = VMUtils.getRecForMor(mo, tableName, vCenterInstanceUuid),
		stale = { };

	if (gr) {
		stale[gr.sys_id] = true;
		SNC.DiscoveryCIReconciler.updateStaleness(JSON.stringify(stale), tableName);
	}
	else
		recordNotFoundWarning(mo, tableName, evt);
}

function vmUuidAssignedEvent(evt) {
	var correlationId,
		gr = updateVmField('bios_uuid', 'uuid', evt);

	if (gr) {
		gr.correlation_id = VMUtils.turnUuidToCorrelationId(gr.bios_uuid);
		gr.update();
	}
}

/*
    evt 1 ---> evt input rec ---> disco output rec --> disco input rec
           ^                  ^                     ^                    ^
           |                  |                     |                    |
(1)  evt 2 > evt input rec    |                     |                    |
(2)  evt 2 -------------------> input rec           |                    |
(3a) evt 2 -------------------+---------------------> input rec          |
(3b)                          ^ evt 2 --------------^ input rec          |
(3c)                                          evt 2 ^ input rec          |
(4) evt 2 ---------------------------------------------------------------> input rec

evt 2 happens after evt 1 (i.e. the createTimed in the evt 2 is greater then evt 1's createdTime).
In case (1) we have no choice but to use evt 2 - we don't even know that evt 1 happened.
In case (2) we don't care if we use evt 2 or not - the discovery is going to happen and it
            will overwrite any changes we make anyway.  In this case it will update the CI
			correctly.
In case (3) the timestamp of evt 2 matters.  Like (2) the result will be overwritten so it
            doesn't matter if we use evt 2 or not, but in both (3a) and (3b) the result will be
			correct - the discovery will fetch the same state as what evt 2 has.  In case (3c)
			we don't know if it will be correct because we don't know when the MID server queries
			vCenter.  If it queries before the event the result will be wrong otherwise it will be
			right.  Fortunately, the window for correct results is much shorter than the window
			for incorrect events.  The probe can spend any amount of time in the MID's queue, but
			once it starts it should finish quickly.
In case (4) we want to use evt 2 because it has the correct state.

The conclusion is that we might as well use evt 2 - it either won't matter or it will be correct
or more likely to be correct.  The result is the same if evt 2 triggers a discovery, or if evt 1
doesn't.  If both events want to trigger a discovery we can safely skip the second trigger if the
the output rec from the first trigger hasn't been processed.

The conclusion is complicated by the fact that the events may not impact each other, in which case
we want to use both events.
*/

function useEvent(evtGr, morId, triggersDisco, compareEvtTime) {
	var gr, qc, otherGdt, now,
		gdt = getTimeFromEvt(evtGr),
		since = gs.getProperty('glide.discovery.collector.vcenter.event_window', '600000');
	
	since = since | 0;
	if (since < 0)
		return true;

	if (triggersDisco) {
		// The current event is going to trigger a discovery.
		// We don't want to trigger a discovery if one is already pending
		gr = new GlideRecord('ecc_queue');
		// We don't want to query the entire ECC queue, so we'll limit it
		// to a reasonable time window of 10 minutes.  This may not be long enough on
		// busy instances, but I don't know what value is reasonable if it takes longer.
		now = new GlideDateTime();
		now.subtract(since);
		gr.addQuery('sys_created_on', '>', now);
		gr.addQuery('queue', 'output');
		gr.addQuery('topic', 'VMWareProbe');
		gr.addQuery('payload', 'CONTAINS', vCenterInstanceUuid);
		gr.addQuery('payload', 'CONTAINS', morId);
		qc = gr.addQuery('state', 'ready');
		qc.addOrCondition('state', 'processing');
		gr.setLimit(1);
		gr.query();
		if (gr.hasNext())
			return false;
	} else if (compareEvtTime) {
		// The current event is going to CI data based on data in the event.
		// We don't want to do this if there's a newer event that is going to update
		// the same data.
		// This can happen because events might be processed out of order.
		gr = new GlideRecord('ecc_queue');
		// We want to compare the event's timestamp to the other events' timestamps.
		// We don't want to query the entire ECC queue, so we'll limit it
		// to a reasonable time window of 10 minutes.  This may not be long enough on
		// busy instances, but I don't know what value is reasonable if it takes longer.
		now = new GlideDateTime();
		now.subtract(since);
		gr.addQuery('sys_created_on', '>', now);
		gr.addQuery('queue', 'input');
		gr.addQuery('topic', 'MIDExtension:VCenterExtension');
		gr.addQuery('payload', 'CONTAINS', vCenterInstanceUuid);
		gr.addQuery('payload', 'CONTAINS', morId);
		compareEvtTime.forEach(function(name) {
			if (qc)
				qc.addOrCondition('payload', 'CONTAINS', name);
			else
				qc = gr.addQuery('payload', 'CONTAINS', name);
		});
		gr.query();

		while (gr.next()) {
			otherGdt = getTimeFromEvt(gr);

			if (otherGdt.compareTo(gdt) > 0)
				return false;
		}
	}
	return true;

	function getTimeFromEvt(eventGr) {
		var created, parts,
			payload = new XMLHelper().toObject('' + eventGr.payload),
			gdt = new GlideDateTime();

		payload.parameter.some(function(el)  {
			if (el['@name'] != "event_data")
				return;

			var val = el['@value'];
			val = JSON.parse(val);
			created = val && val.data && val.data.createdTime;
			return created;
		});

		// We should always find createdTime, but we need to do something
		// if we don't.  The created time of the event is the best guess
		// we can make.
		if (!created)
			return new GlideDateTime(eventGr.sys_created_on);

		parts = created.match(/^\s*([0-9]*)\s*([^-: ]*)\s*$/);

		// VMWare documents time as being of type xsd:dateTime, but in the cases
		// I've seen it's not.  The format I've seen is "1541013373621 UTC".  The
		// above regex separates this into numeric value and time zone.  If the value
		// actually is in xsd:dateTime format then the above regex won't match but
		// this one will.
		// xsd:dateTime is documented at https://www.w3.org/TR/xmlschema11-2/#dateTime
		// The format is documented at https://pubs.vmware.com/vsphere-6-5/index.jsp?topic=%2Fcom.vmware.wssdk.apiref.doc%2Fvim.event.VmPoweredOnEvent.html
		if (!parts)
			parts = created.match(/([0-9:\- T]*)(.*)/);

		gdt.setTZ(Packages.java.util.TimeZone.getTimeZone(parts[2]));

		// If the first regex matches then parts[1] is a string representing
		// a numeric value.  The "+parts[1]" will convert this string to a
		// number.  If the 2nd regex matches then +parts[1] will return NaN
		// and we'll set the value to "parts[1]" without converting it to a
		// number.
		gdt.setValue(+parts[1] || parts[1]);
		return gdt;
	}
}

function updateVmField(columnName, evtValueName, evt) {
	var tableName = 'cmdb_ci_vmware_instance';
	if (evt.data.template)
		tableName = 'cmdb_ci_vmware_template';

	return updateField(tableName, columnName, 'vm', evtValueName, evt);
}

function updateField(tableName, columnName, evtObjName, evtValueName, evt) {
	var mo = evt.data[evtObjName][memberNames[evtObjName] || evtObjName],  // See the big comment on line 14.
		gr = VMUtils.getRecForMor(mo, tableName, vCenterInstanceUuid);

	if (gr) {
		gr[columnName] = evt.data[evtValueName];
		gr.update();
	} else
		recordNotFoundWarning(mo, tableName, evt);

	return gr;
}

function recordNotFoundWarning(mo, tableName, evt) {
	gs.warn('VCenterVmStateUpdater: Unable to find record for ' + mo.type + ' ' + mo.val + ' in table ' + tableName + ' (event: ' + JSON.stringify(evt) + ')');
}

function eventHandlerExceptionMsg(evt, mo, e) {
	var msg = 'VCenterVmStateUpdater: Exception when handling event ' + event + ' ' + JSON.stringify(evt);

	if (mo)
		msg += ' on ' + mo.type + ' ' + mo.val;
	msg += ': ' + (e.msg || e.toString());
	gs.warn(msg);

	return msg;
}

// Get datacenter (and vCenter) IDs from a vCenter event.
// Gets: vCenterInstanceUuid, vcenterSysId, ip,
// datacenterMorId, datacenterSysId.
// Values are saved in global variables
function getDatacenterIds(evt) {
	vCenterInstanceUuid = evt.vcenter_instance_uuid;

	var gr = new GlideRecord('cmdb_ci_vcenter');
	gr.addQuery('instance_uuid', vCenterInstanceUuid);
	gr.query();
	if (gr.next()) {
		vCenterSysId = '' + gr.sys_id;
		ip = '' + gr.ip_address;
	}

	datacenterMorId = evt.data.datacenter.datacenter.val;

	gr = new GlideRecord('cmdb_ci_vcenter_datacenter');
	gr.addQuery('vcenter_ref', vCenterSysId);
	gr.addQuery('morid', datacenterMorId);
	gr.query();
	if (gr.next())
		datacenterSysId = '' + gr.sys_id;
}

})();
