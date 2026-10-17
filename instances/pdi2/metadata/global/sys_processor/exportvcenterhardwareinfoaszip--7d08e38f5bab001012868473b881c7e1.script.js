(function process(g_request, g_response, g_processor) {
	var vCenterTableName = 'cmdb_ci_vcenter';
	var vcenterGR = new GlideRecordSecure(vCenterTableName);
	vcenterGR.query();

	var name, row, relCi, writer, is,
		columnNames = [
			'VCenterServerName', 'VCenterVersion', 'HostName', 'IsStandAlone', 'DataCenter', 'Cluster', 'VMs',
			'Vendor', 'Model', 'FullName', 'Version', 'CpuModel', 'CpuMhz', 'CPU',
			'CpuCores', 'HyperThreading', 'CpuThreads', 'PowerState', 'ConnectionState', 'Datastores', 'ManagedByServer'
		],
		rows = [columnNames.join(', ')],
		columns = [getVcenterName, getVcenterVersion, 'name', isStandAlone, getDatacenter, getCluster, getVms,
				   getManufacturer, getModel, getOsName, getOsVersion, 'cpu_type', 'cpu_speed', 'cpu_count',
				   getCoreCount, 'hyper_threading', 'logical_processor', 'power_state', 'connection_state', getDatastores, getManagementServerIP
				  ];
	while (vcenterGR.next()) {
		var esx = new GlideRecordSecure('cmdb_ci_esx_server');
		esx.addQuery('vcenter_ref', vcenterGR.sys_id);
		esx.addQuery('vcenter_uuid', vcenterGR.instance_uuid);
		esx.query();

		while (esx.next()) {
			row = [];

			columns.forEach(function(column) {
				var value = "";

				if (typeof column == 'string')
					value = esx[column];
				else
					value = column(esx);


				if (typeof value == 'string')
					row.push(value.replace(/,/g, '%2C'));
				else
					row.push(value);
			});

			rows.push(row.join(', '));
		}

		if (esx.getRowCount() > 0) {
			var vcenter_filename = vcenterGR.name + '-HW-Inventory-Information.csv';

			var sysAttachmentGR = new GlideRecordSecure('sys_attachment');
			sysAttachmentGR.addQuery('file_name', vcenter_filename);
			sysAttachmentGR.addQuery('table_name', vCenterTableName);
			sysAttachmentGR.query();
			if (sysAttachmentGR.next())
				sysAttachmentGR.deleteRecord();
			var content = rows.join('\n');
			var digest = new GlideDigest();
			var md5Hash = digest.getMD5Hex(content);
			content = content + '\n' + md5Hash;
			var sa = new GlideSysAttachment();
			sa.write(vcenterGR, vcenter_filename, 'application/csv', content);
		}
	}

	var zipName = 'HW-Inventory-Information.zip';

	var StringUtil = GlideStringUtil;

	var saGr = new GlideRecordSecure('sys_attachment');
	saGr.addEncodedQuery('file_nameLIKE-HW-Inventory-Information.csv^table_nameLIKE' + vCenterTableName);
	saGr.query();

	if (saGr.getRowCount() <= 0)
		gs.addInfoMessage(gs.getMessage('No Hardware records found for the vcenter(s) to generate the report. Please make sure you have valid records in cmdb_ci_esx_server to get the report.'));

	else if (saGr.hasNext()) {
		g_response.setHeader('Pragma', 'public');
		g_response.addHeader('Cache-Control', 'max-age=0');
		g_response.setContentType('application/zip');
		g_response.addHeader('Content-Disposition', 'attachment;filename=' + zipName);

		var out = new Packages.java.util.zip.ZipOutputStream(g_response.getOutputStream());

		while (saGr.next()) {
			sa = new GlideSysAttachment();
			var binData = sa.getBytes(saGr);
			var file = saGr.file_name;
			addBytesToZip(out, zipName, file, binData);
		}

		//Complete the ZIP file
		out.close();
	}

	function addBytesToZip(out, dir, file, stream) {
		// Add ZIP entry to output stream.
		out.putNextEntry(new Packages.java.util.zip.ZipEntry(file));
		out.write(stream, 0, stream.length);
		out.closeEntry();
	}

	// Column 1: VCenterServerName
	function getVcenterName(gr) {
		return gr.vcenter_ref.fqdn ? gr.vcenter_ref.fqdn : gr.vcenter_ref.name;
	}

	// Column 2: VCenterServerName
	function getVcenterVersion(gr) {
		return gr.vcenter_ref.api_version;
	}

	// Column 4: IsStandAlone
	function isStandAlone(gr) {
		return getCluster(gr) ? 'FALSE' : 'TRUE';
	}

	// Column 5: Datacenter
	function getDatacenter(gr) {
		var cluster, dc;

		// If the host is in a cluster it won't have a direct relationship to the datacenter, so
		// check for the cluster relationship first
		cluster = getAncestor(gr, 'cmdb_ci_vcenter_cluster', '55c913d3c0a8010e012d1563182d6050'); // Members::Member of

		// Host and cluster have the same relationship type to the datacenter
		gr = cluster || gr;
		dc = getAncestor(gr, 'cmdb_ci_vcenter_datacenter', '55c95bf6c0a8010e0118ec7056ebc54d'); // Contains::Contained by

		if (dc)
			return dc.name;
	}

	// Column 6: Cluster
	function getCluster(gr) {
		var cluster = getAncestor(gr, 'cmdb_ci_vcenter_cluster', '55c913d3c0a8010e012d1563182d6050'); // Members::Member of
		if (cluster)
			return cluster.name;
	}

	// Column 7: VMs
	function getVms(gr) {
		return getAllAncestors(gr, 'cmdb_ci_vmware_instance', 'aa9434870ab301544ce2943bf03fd7a8'); // // Registered on::Has registered
	}

	// Column 8: Vendor
	function getManufacturer(gr) {
		return gr.manufacturer.name;
	}

	// Column 9: Model
	function getModel(gr) {
		return gr.model_id.name;
	}

	// Column 10: FullName
	function getOsName(gr) {
		var name = gr.os_version + '',
			osName = /^\s*([^\d]*)\s+/,
			match = osName.exec(name);

		if (match)
			return match[1];
	}

	// Column 11: Version
	function getOsVersion(gr) {
		var name = gr.os_version + '',
			osVersion = /^\s*[^\d]*\s+([0-9.]*)\s+/,
			match = osVersion.exec(name);

		if (match)
			return match[1];
	}

	// Column 15: CpuCores
	function getCoreCount(gr) {
		return gr.cpu_core_count * gr.cpu_count;
	}

	// Column 20: Datastores
	function getDatastores(gr) {
		return getAllAncestors(gr, 'cmdb_ci_vcenter_datastore', '6afd799338a02000c18673032c71b87b');
	}

	//Column 21: ManagedByServer
	function getManagementServerIP(gr) {
		return gr.vcenter_ref.ip_address;
	}

	function getAllAncestors(gr, parentClass, relType) {
		var names = [],
			relGr = new GlideRecordSecure('cmdb_rel_ci');

		relGr.addQuery('child', gr.sys_id);
		relGr.addQuery('parent.sys_class_name', parentClass);
		relGr.addQuery('type', relType);
		relGr.query();
		while (relGr.next())
			names.push(relGr.parent.name);

		return names.join(';');
	}

	function getAncestor(gr, parentClass, relType) {
		var ancestor;

		while (gr) {
			relCi = new GlideRecordSecure('cmdb_rel_ci');
			relCi.addQuery('child', gr.sys_id);
			relCi.addQuery('parent.sys_class_name', parentClass);
			relCi.addQuery('type', relType);
			relCi.query();
			if (!relCi.next())
				break;
			ancestor = relCi.parent;
			gr = relCi.parent;
		}

		return ancestor;
	}
})(g_request, g_response, g_processor);
