ArrayPolyfill;
ObjectPolyfill;

(function() {
 
/*
  This probe processes output from vxprint, vxdisk and vxdmpadm.  "vxprint -AQm" gets run
once, "vxdisk path" gets run once, and vxdmpadm gets run once for each Veritas disk.  Output
from each command is separated by the string "[[==PROBE:section==]]"  (this is similar to
the Linux storage probe except that this  probe uses the same string to separate all
sections).  There's exactly one section for vxprint, one for vxdisk, followed by an
unknown number of sections for vxdmpadm.
  
The vxprint output consists of groups of object descriptors.  Each group looks like:
    dg vxdg1
	rid=0.1234
	version=1
	...
The beginning of the group is marked by a line containing <object type><whitespace><name>.  The group
then contains name value pairs (as <name><equals><value>) on separate lines.  Parsing the output is
data-driven by the variables 'dataMaps' and 'destTables'.  A datamap looks like:
    dm: { pub_len: 'size_bytes' }
This describes what to do with 'dm' object types.  It says take the value from the "pub_len"
name/value input and put it into a JS object as "size_bytes".

In addition to creating a mapped data object (the "destination" object), a JS object that contains all
the input is also created (the "source" object).

A few things happen after all the input for an object has been read:
  1. The source object is placed into a map based on its "rid" - this is Veritas' unique (I hope)
     identifier.
  2. A reference to the destination object is added to the source object
  3. The destination object gets added to the 'results' object that's going to be returned
     from the probe.

After processing the vxprint output, vxdisk and each vxdmpadm section is processed.  All I'm trying
to get from this is the physical disk name and the corresponding DMP node name.  The physical
disk names for each DMP node are added to the disk record.

After all input has been parsed, the results get fixed up a little.  Some values get calculated,
but most of the fixing is to create relationships between the objects, e.g. subdisk.disk gets
set to the parent disk, and disk.partitions (an array) has that subdisk added to it.

The fix up creates JS objects with references that are convenient but also circular, meaning the
object can't be stringified.  The results object gets de-circularized so it can be stringified
and sent to the sensor.

The sensor is going to add the results object to the database as-is.  JS object member names
become database column names.  This is why we do e.g. subdisk.pool = plex instead of calling it
subdisk.plex.
*/

var currentDG, lines,
	spaceRegex = /\s+/,
	digitsRegex = /\D*(\d+)/,
	results = { },
	lineIdx = 0,
	srcMaps = { dg: { }, dm: { }, sd: { }, plex: { }, vol: { } },
	destTables = { dg: 'cmdb_ci_veritas_disk_group', dm: 'cmdb_ci_veritas_disk', sd: 'cmdb_ci_veritas_subdisk', plex: 'cmdb_ci_veritas_plex', vol: 'cmdb_ci_veritas_volume' },
	dataMaps = {
		dg: { name: 'name' },
		dm: { name: 'name', pub_len: 'size_bytes' },
		sd: { name: 'partition_number', dm_offset: 'source_start_offset', pl_offset: 'start_offset', len: 'size_bytes' },
		plex: { name: 'name', len: 'size_bytes', layout: 'layout' },
		vol: { name: 'name', len: 'size_bytes' }
	};

function process() {

	var i, parts, type, src, subdisk, name, plex, partNum, disk, vol, offset, disks, sections, words,
		diskMap = { },
		dmm = srcMaps.dm,		// dmm = disk media map, destined for cmdb_ci_veritas_disk
		sdm = srcMaps.sd,		// sdm = subdisk map, destined for cmdb_ci_veritas_subdisk
		plm = srcMaps.plex,	    // plm = plex map, destined for cmdb_ci_veritas_plex
		volm = srcMaps.vol;	    // volm = volume map, destined for cmdb_ci_veritas_volume

	sections = output.split('[[==PROBE:section==]]');

	// I seem to sometimes get blank lines before the first marker.  I'm creating dummy
	// output to guarantee there's something before the first section.  This line throws
	// the dummy output away.
	sections.shift();

	// Parse the input, as described above.  Parsing is complicated by a couple of factors:
	// 1. The output may begin with an invalid line
	// 2. Nothing indicates the end of an object.
	// Each iteration of the while loop reads a single object.  I had originally planned to
	// fix up or discard these objects as I read them, hence the loop here instead of in
	// fetchData().
	lines = sections.shift().split('\n');
	while (lineIdx < lines.length) {
		parts = lines[lineIdx].split(spaceRegex);
		type = parts[0];
		fetchData(type, parts[1]);
	}
	
	// Map disks based on the device_tag.  Also create an array to hold physical disk names.
	for (name in dmm) {
		disk = dmm[name];
		diskMap[disk.da_name] = disk.dest;
		disk.dest.pdn = [];
	}

	// Process the vxdisk path output.  Add physical disk names to every Veritas disk
	lines = sections.shift().split('\n');

	for (i = 1; i < lines.length; i++) {
		words = lines[i].split(spaceRegex);

		disk = diskMap[words[1]];
		if (disk)
			disk.pdn.push('/dev/' + words[0]);
	}

	// Process the vxdmpadm output.  Add physical disk names to every Veritas disk.
	sections.forEach(function(section) {
		lines = section.split('\n');
		for (i = 1; i < lines.length; i++) {
			words = lines[i].split(spaceRegex);

			disk = diskMap[words[3]];
			if (disk)
				disk.pdn.push('/dev/' + words[0]);
		}
	});

	// Build relationships between objects

	// Set disk.disk_group
	results[destTables.dg].forEach(function(dg) {
		dg.disks.forEach(function(disk) {
			disk.size_bytes = parseInt(disk.size_bytes) * 512;
			disk.disk_group = dg;
		});
	});

	// Fix volume names
	for (name in volm) {
		vol = volm[name].dest;
		vol.size_bytes = parseInt(vol.size_bytes) * 512;
		vol.name = '/' + vol.name;
	}

	// Fix up disk subdisks
	for (name in sdm) {
		src = sdm[name];
		subdisk = src.dest;
		
		// 1. Convert numeric values to numbers.
		subdisk.source_start_offset = parseInt(subdisk.source_start_offset) * 512;
		subdisk.start_offset = parseInt(subdisk.start_offset) * 512;
		subdisk.size_bytes = parseInt(subdisk.size_bytes) * 512;

		// 2. set partition number
		// I don't like this, but the only way to get the partition number seems
		// to be parsing the partition name
		subdisk.name = subdisk.partition_number;
		partNum = digitsRegex.exec(subdisk.partition_number);
		partNum = partNum && partNum.pop();
		subdisk.partition_number = partNum ? parseInt(partNum) : subdisk.start_offset;

		// 3. Set my disk, add me to the disk's partitions
		disk = subdisk.disk = dmm[src.dm_rid].dest;
		disk.partitions = disk.partitions || [ ];
		disk.partitions.push(subdisk);

		// 4. Calculate end_offset from start_offset & size
		offset = subdisk.start_offset;
		subdisk.end_offset = '' + (offset + subdisk.size_bytes);
		subdisk.start_offset = '' + offset;

		// 5. Calculate offsets for this subdisk's position in the plex
		offset = subdisk.source_start_offset;
		subdisk.source_end_offset = '' + (offset + subdisk.size_bytes);
		subdisk.source_start_offset = '' + offset;
		
		// 6. Set the plex the subdisk is part of
		plex = plm[src.plex_rid].dest;
		subdisk.pool = plex;
		disks = plex.disks = plex.disks || [];
		if (disks.indexOf(disk) == -1)
			disks.push(disk);
	}

	// Fix up plexes - put them in the right storage pool
	for (name in plm) {
		src = plm[name];
		plex = src.dest;

		plex.size_bytes = parseInt(plex.size_bytes) * 512;

		vol = volm[src.vol_rid].dest;
		plex.pool = vol;
		if (vol && plex.disks)
			vol.disks = (vol.disks || [ ]).concat(plex.disks);
	}

	current.results = decircularize(results);
}

function fetchData(type, objName) {

	var parts, srcMap, dataMap, destTable, name, val, identifier, converted,
		dest = { },
		src = { dest: dest };

	lineIdx++;
	srcMap = srcMaps[type];
	if (!srcMap || !objName)
		return;
	destTable = destTables[type];
	results[destTable] = results[destTable] || [];
	dataMap = dataMaps[type];

	name = dataMap.name || 'name';
	dest[name] = objName;

	while (lineIdx < lines.length) {

		parts = lines[lineIdx].split('=');
		
		// No "=" indicates that the current object is complete.  At this point, we
		// should have an identifier for the object, so we can map & return it.
		if (parts.length < 2) {

			identifier = src.rid;

			// Special handling required for disk groups because the rid isn't unique.
			if (type == 'dg') {
				currentDG = dest;
				currentDG.disks = [ ];
				identifier = src.dgid;
			}

			if (!identifier)
				return;

			srcMap[identifier] = src;
			results[destTable].push(dest);

			// More special handling for disk groups because disk->disk_group relationship is implicit
			if (type == 'dm')
				currentDG.disks.push(dest);

			return;
		}
	
		lineIdx++;
		name = parts.shift().trim();
		val = parts.join('=');
		// For some reason, veritas prepends a quote to volume names.  Remove it.
		// I'm doing this here instead of during fixup because I don't think we'll
		// ever want the value quoted.
		if (val.startsWith('"'))
			val = val.substr(1);
		src[name] = val;
		name = dataMap[name];
		if (name)
			dest[name] = val;
	}
}

/*
  A simple function to de-circularize object references.  Any reference to another
object is replaced with an object identifier that's created by this function.  We
return an object mapping this identifier to the original object.
*/
function decircularize(o)
{
	var name,
		objects = { },
		objectIdName = '$objectName$',
		nextId = 1;

	try { decirc(o); }
	catch(e) { ms.log(e.toString()); }

	for (name in objects)
		delete objects[name][objectIdName];

	return objects;

	function decirc(o) {
		
		var id = o[objectIdName];
		if (id)
			return id;

		// Generate an ID for the current object, add it to the object.
		// I'd prefer to create a map, but it would need to be keyed by
		// the object.
		id = 'obj_' + nextId;
		o[objectIdName] = id;
		objects[id] = o;
		nextId++;
		
		Object.keys(o).forEach(function(name) {
			var val = o[name];
			if (typeof val == 'object')
				o[name] = decirc(val);
		});

		return id;
	}
}

new ProbePostProcessor({
    process: process,
    type: "ProbePostProcessor"
});

})();
