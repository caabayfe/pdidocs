ArrayPolyfill;

(function() {

/*
  The code here is all pretty generic.  The probe returns a JS object which gets
written to the database.  Member names of that object are table names.  The
corresponding values are arrays of objects to write to that table.  Objects in
the arrays can have references to each other - these represent referrals in the
database.

The schema below defines the stuff that can't be stored in a JS object (at
least it can't be stored in a natural way.)  The table name is the member name
in the schema. "index" defines the data that uniquely identifies the object -
this is what we use to find the existing object.  "relations" describes the
relationships to be created.
    cmdb_ci_veritas_disk_group: { relations: { disks: 'Contains::Contained by' } }
This says that a cmdb_ci_veritas_disk_group object can have a member named 'disks'.
The disk group "Contains" the disk, while the disk is "Contained by" the group.
disk_group.disks can be an array to represent a one to many relationship.
*/

var deviceSysId,
	poolIdx = ['name', 'hosted_by'],
	schema = {
		cmdb_ci_veritas_subdisk: {
			index: ['partition_number', 'disk']
		},
		cmdb_ci_veritas_disk: {
			index: ['name', 'hosted_by'],
			relations: { physicalDisks: 'Provided by::Provides' }
		},
		cmdb_ci_veritas_volume: {
			index: poolIdx,
			reverseRelations: { disks: 'Provides storage for::Stored on' }
		},
		cmdb_ci_veritas_plex: {
			index: poolIdx
		},
		cmdb_ci_veritas_disk_group: {
			index: poolIdx,
			relations: { disks: 'Contains::Contained by'}
		}
	};

new DiscoveryJSONSensor({ processJSON: processJSON, type: 'VeritasSensor' });

function processJSON() {

	var tableName, gt, fieldNames, table, i, pdiv,
		pdIdx = ['device_id', 'computer'],
		allObjs = current.results,
		results = reattach(allObjs),
		device = this.getCmdbRecord();

	// Apparently device.sys_id only looks like a string.  Convert it to a real string.
	deviceSysId = device && ('' + device.sys_id);

	// pdiv = physical disk index values.  Create the object once for efficiency.  device_id
	// will get set before the object is used.
	pdiv = { computer: deviceSysId, device_id: 0 };

	// Get all the db fields in my tables, so I can ignore any extra data in the JS object.
	for (tableName in schema) {
		gt = new GlideTable(tableName);
		fieldNames = gt.getFieldNames().toArray();

		table = schema[tableName];
		table.fields = { };

		for (i = 0; i < fieldNames.length; i++)
			table.fields[fieldNames[i]] = 1;
	}

	// iterate() walks over the 'results' returned from the probe.  It
	// will walk over all objects in all tables that are in the schema
	// Add .sys_class_name to every object.  writeJsObject() needs to know
	// the table as it traverses a web of objects and this is the most
	// expedient way to do that
	iterate(setTableName);
	// Add a .toString() function to everything, so we can just write
	// objects to log messages.
	iterate(setToString);
	// Set the device's sys_id on everything.  It gets added as both
	// 'hosted_by' and 'computer' because some objects use one but
	// other objects use the other.  Maybe the device's sys_id column
	// name belongs in the schema?
	iterate(setSysId);
	// Write everything to the database
	iterate(writeJsObject);

	// Iterate over all veritas disks and try to find the underlying
	// physical disks.  The first piece of non-generic code in the
	// sensor.
	iterate(findPhysicalDisks, { cmdb_ci_veritas_disk: 1 });

	// Write all the relationships defined
	iterate(writeRelationships);

	// The 2nd piece of non-generic code in the sensor.  Update
	// filesystems, relate the filesystem to the disks that provide it.
	iterate(updateFileSystem, { cmdb_ci_veritas_volume: 1 });

	// This is going to be stringified to be passed to any triggered probes.
	// A bug in the stringification causes a stack overflow which doesn't
	// get caught and keeps this sensor from being marked 'complete'.
	current = { };

	// Try to find the physical disks associated with a Veritas disk.  Add
	// GlideRecords to the Veritas disk object.
	function findPhysicalDisks(disk) {
		disk.physicalDisks = [ ];
		disk.pdn.forEach(function(pdn) {
			pdiv.device_id = pdn;
			var dgr = getRecord(pdiv, pdIdx, 'cmdb_ci_storage_device');
			if (dgr)
				disk.physicalDisks.push(dgr);
		});
	}

	function updateFileSystem(vol) {
		var gr = new GlideRecord('cmdb_ci_file_system');

		// Read the existing file system if we can
		gr.addQuery('mount_point', vol.name);
		gr.addQuery('computer', deviceSysId);
		gr.query();
		gr.setLimit(1);

		if (gr.next()) {
			// Update a couple of fields because they're either
			// empty or incorrect
			gr.provided_by = vol.gr.sys_id;
			gr.file_system = 'vxfs';
			gr.update();

			// Add the volume's disks to the filesystem object so I can
			// use writeRelationships()
			gr.disks = [ ];
			vol.disks.forEach(function(disk) {
				gr.disks = gr.disks.concat(disk.physicalDisks);
			});

			writeRelationships(gr, 0, { disks: 'Provides storage for::Stored on' });
		}
	}

	function iterate(fn, tableList) {
		var tableName, tableData;

		// Allow a table list to be passed in, use the schema as
		// the default.
		tableList = tableList || schema;

		// Iterate over all the tables
		for (tableName in tableList) {
			tableData = results[tableName];
			// Iterate over every object in the table
			tableData.forEach(callFn);
		}

		// Call the function passed to iterate() inside a try/catch so
		// an exception won't abort the entire sensor.  Note that (almost)
		// everything is intentionally executed through iterate() because
		// of this try/catch.
		function callFn(rec) {
			try {
				fn(rec, tableName);
			} catch(e) {
				gs.log(e.toString());
			}
		}
	}

	function setTableName(rec, tableName) {
		rec.sys_class_name = tableName;
	}

	function setToString(rec) {

		rec.toString = function() {

			var name, isNew,
				idxName = [ ],
				tableName = rec.sys_class_name,
				tableSchema = schema[tableName],
				idx = tableSchema && tableSchema.index;

			if (!idx)
				return tableName + ' ' + rec.sys_id;


			idx.forEach(function(name) {
				var val = rec[name];
				if (val === undefined)
					isNew = 1;
				else
					idxName.push(name + ': ' + val);
			});

			idx = idxName.join(', ');

			name = (isNew ? 'new ' : '') + tableName + ': ' + idx;
			if (rec.sys_id)
				name += ' (sys_id ' + rec.sys_id + ')';
			name += rec.isClean ? ' (clean)' : ' (dirty)';
			return '[ ' + name + ' ]';
		};
	}

	function setSysId(rec) {
		rec.computer = deviceSysId;
		rec.hosted_by = deviceSysId;
	}
}

// Write a JS object to the database.  References to other objects will write the sys_id
// of those objects.  If the sys_id isn't available that object will be written first.
// This code tries to be safe, simple & reasonably performant.
// Safe: Objects don't have to be sanitized or ordered before writing.  The probe & sensor
//       can create whatever cross-references are convenient.
// Simple: Write references first, writing their references as necessary.  Don't allow
//         recursion to any object currently on the stack.  Keep trying as long as
//         we're making progress.
// Performant: Keep track of clean objects and cut recursion off as quickly as possible.
//
// Note that we're only trying to write 'obj'.  Anything else that gets written is a side
// effect.
function writeJsObject(obj) {

	var temp, progress,
		stack = [ ],
		deferred = [ ],
		forced = [ ];

	// The objects we're writing to the database are static for the duration of the
	// sensor.  Once I've written an object there's no reason to write it again.
	if (obj.isClean)
		return true;

	// First, just try to write the object, recursing to sub-objects as necessary.
	// The first attempt to write it may fail, so keep trying as long as we're
	// making any progress.
	do {
		progress = false;
		if (writeRec(obj))
			return;
	} while (progress);

	// If we failed to write the object because of missing sys_ids, go back
	// and force write everything that was deferred.
	temp = deferred;
	deferred = [ ];
	writeAll(temp);

	// Forced writes will fail if the missing sys_id is part of the object's
	// index.  These records should be writable now.
	writeAll(deferred);

	// Finally, go back and update any forced writes with sys_ids of the things
	// we couldn't force write the first time.
	writeAll(forced);

	// Really finally, make sure we wrote the object we were asked to write.
	writeRec(obj);

	function writeAll(arr) {

		// Force write any deferred objects.  Forced writes can be deferred if
		// we're missing part of the objects index.
		arr.forEach(function(o) { writeRec(o, true); });
	}

	function writeRec(obj, force) {
		var val, name, gr, idx, fields,
			canWrite = true,                  // Do we have sys_ids for all references?
			tableSchema = schema[obj.sys_class_name];

		// Have to check isClean here!
		if (obj.isClean || !tableSchema)
			return true;

		fields = tableSchema.fields;

		// Try to get a GlideRecord for the object.  This will fail it I don't
		// have the data in the record's index (if the index includes a sys_id
		// of a record I haven't tried to write yet).
		gr = obj.gr || getRecord(obj, tableSchema.index);

		for (name in obj) {

			// Skip anything that's not in the database
			if (fields[name] != 1)
				continue;

			val = obj[name];

			// If it's a reference, we need to write it first
			if (val && (typeof val == 'object')) {

				if (!val.sys_id) {
					// Avoid infinite loops.  Kind of a pain, but
					// the stack should never get very deep.
					if (stack.indexOf(val) != -1) {
						canWrite = false;
						continue;
					}

					stack.push(val);
					canWrite = writeRec(val, force) && canWrite;
					stack.pop();
				}
				val = val.sys_id;
			}

			if (gr)
				gr[name] = val;
		}

		// We may have deferred this object, or it may
		// need to be deferred.
		idx = deferred.indexOf(obj);

		// We won't have gr if we don't have everything in the object's index.
		if (gr && (canWrite || force)) {
            // PRB1363070:The Linux - Storage probe doesn't discover Veritas CIs. It retires all CIs in subclasses of any table
            // it does discover, so it winds up retiring/deleting most Veritas CIs (because the tables extend storage_pool
            // or storage_pool_member) on basis of CiSchema flag  or parent table. This sensor is independent of  Ci and CiSchema script include
			// Reconciling is done here itself. We need to un-retire CIs that were retired
			// incorrectly while processing DiscoveryLinuxStorageSensor.
			if (gr.install_status == 100)
				gr.install_status = 1;

			if (!obj.isClean)
				obj.sys_id = gr.update();

			if (canWrite)
				obj.isClean = true;
			else
				forced.push(obj);

			obj.gr = gr;
			progress = true;

			if (idx != -1)
				deferred.splice(idx, 1);

			return true;
		}

		// We're not writing it.  The first time we choose to defer it counts
		// as progress.
		if (idx == -1) {
			deferred.push(obj);
			progress = true;
		}
	}
}

// Write all the relationships for an object.  By default,
// the relationships come from the schema for obj.tableName,
// but you can pass in the relationships directly.
function writeRelationships(obj, relations, reverseRelations) {
	var name, val, relType, tableSchema;

	// iterate() passes in tableName as the 2nd parameter.  Don't use it
	// as relations.
	if (!relations || (typeof relations != 'object')) {
		tableSchema = schema[obj.sys_class_name];
		relations = tableSchema && tableSchema.relations;
	}

	reverseRelations = reverseRelations || (tableSchema && tableSchema.reverseRelations);

	iterate(relations);
	iterate(reverseRelations, 1);

	function iterate(relations, reverse) {
		if (!relations)
			return;

		for (name in relations) {
			relType = relations[name];
			val = obj[name];
			if (val) {
				if (val instanceof Array)
					val.forEach(writeRelationship);
				else
					writeRelationship(val);
			}
		}

		function writeRelationship(referred) {
			var parent = obj.sys_id,
				child = referred.sys_id;

			if (!parent || !child)
				return;

			g_disco_functions.createRelationshipIfNotExists(reverse ? child: parent, reverse ? parent : child, relType);
		}
	}
}

// Get a GlideRecord for the object.  If an existing object exists (based
// on the index defined in the schema) we'll fetch it.  If no object exists,
// return a new GlideRecord.  If we don't have enough information to tell
// if an object exists (because we don't have everything in its index)
// don't return anything.
function getRecord(obj, idx, tableName) {

	var gr = new GlideRecord(tableName || obj.sys_class_name);

	if (!idx.every(addQuery))
		return;

	gr.query();
	gr.setLimit(1);
	if (gr.next()) {
		obj.sys_id = gr.sys_id;
		obj.gr = gr;
	} else
		gr.initialize();

	return gr;

	function addQuery(name) {
		var val = obj[name],
			ok = true;

		if (val && typeof val == 'object')
			ok = val = val.sys_id;

		if (val === undefined)
			return false;

		gr.addQuery(name, val);
		return ok;
	}
}

// Re-circularize an object after it was de-circularized for serialization.
function reattach(o)
{
	var name, obj, name2, val;

	for (name in o) {
		obj = o[name];
		for (name2 in obj) {
			val = o[obj[name2]];
			if (val)
				obj[name2] = val;
		}
	}

	return o.obj_1;
}

})();
