(function process(g_request, g_response, g_processor) {

	var vCenterTableName = 'cmdb_ci_vcenter';
	var vcenterGR = new GlideRecordSecure(vCenterTableName);
	vcenterGR.query();

	var name, row, relCi, writer, is,
			columnNames = [
				'VMName', 'VMGuestHostName', 'VMGuestOS', 'VMIPAddress'
			],
			rows = [columnNames.join(', ')],
			columns = ['name', 'fqdn', 'guest_os_fullname', 'ip_address'];
	while (vcenterGR.next()) {
		var vmGR = new GlideRecordSecure('cmdb_ci_vmware_instance');
		vmGR.addQuery('vcenter_ref', vcenterGR.sys_id);
		vmGR.addQuery('vcenter_uuid', vcenterGR.instance_uuid);
		vmGR.query();
		while (vmGR.next()) {
			row = [];

			columns.forEach(function(column) {
				if (typeof column == 'string')
					row.push(vmGR[column]);
				else
					row.push(column(vmGR));
			});
			rows.push(row.join(', '));
		}

		if (vmGR.getRowCount() > 0) {
			var vcenter_filename = vcenterGR.name + '-VMs-Information.csv';

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

	var zipName = 'VMs-Information.zip';

	var StringUtil = GlideStringUtil;

	var saGr = new GlideRecordSecure('sys_attachment');
	saGr.addEncodedQuery('file_nameLIKE-VMs-Information.csv^table_nameLIKE' + vCenterTableName);
	saGr.query();

	if (saGr.getRowCount() <= 0)
		gs.addInfoMessage(gs.getMessage('No VM records found for the vcenter(s) to generate the report. Please make sure you have valid records in cmdb_ci_vmware_instance to get the report.'));

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
})(g_request, g_response, g_processor);
