var resp = {'result':{'@code':'OK'}};
var gr;

if (canSnap()) {
    // first we build a map (by parent) of arrays of object representing an entry in our table...
    gr.addActiveQuery();
    gr.query();
    var byParent = {};
    while (gr.next()) {
        var name = ('' + gr.name).replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); 
        var parent = '' + gr.parent;
        var id = '' + gr.sys_id;
		
		// construct and append our record entry...
		var rec = {};
		rec.name = name;
		rec.parent = parent;
		rec.id = id;
		rec.checksum = '';
		rec.use_attachment = false;

		if (request.attachments != 'false') {
			// find the most recent attachment...
			var agr = new GlideSysAttachment().getAttachments(gr.getTableName(), gr.getUniqueValue());
			var attName;
			var attID;
			var attTimestamp;
			while (agr.next()) {
				rec.file_name = '' + agr.file_name;
				rec.file_id = '' + agr.sys_id;
				rec.file_time = '' + agr.sys_created_on.getGlideObject().getNumericValue();
				rec.use_attachment = true;
			}
		} else {
			// looking for field based content
			if (!gr.directory) {
				rec.file_name = name;
				rec.file_id = id;
				rec.file_time = gr.sys_updated_on.getGlideObject().getNumericValue();

				// --- Is the script using an attachment?
				// Attachment takes precedence over the script field
				if (gr.use_attachment) {
					// Make sure we have an actual attachment
					if (gr.script_attachment != null && gr.script_attachment != "") {
						rec.use_attachment = true;
						rec.file_name = '' + gr.script_attachment.file_name;
						rec.file_id = '' + gr.script_attachment.sys_id;

						//Use the timestamp of attachment
						var agr = new GlideRecord('sys_attachment');
						if (gr.script_attachment.sys_id && agr.get('sys_id', gr.script_attachment.sys_id))
							rec.file_time = '' + agr.sys_created_on.getGlideObject().getNumericValue();
						
					} else {
						rec.use_attachment = false;
						gs.warn("No attachment found for " + name);
					}
				}
			}
		}

		if (!byParent[parent])
			byParent[parent] = [];

		if (shouldDownloadFile('' + gr.getTableName(), '' + rec.file_name))
			byParent[parent].push(rec);
    }

    // now build our hierarchy from the root down, recursively...
    var root = {'@name':''};
    addDir(root, byParent[''], byParent);
    resp.result.dir = root;
}

response.response = new XMLHelper().toXMLDoc(resp);

function addDir(currentDest, currentSource, byParent) {
    // iterate through the objects in the current subdirectory...
    for (var i = 0; i < currentSource.length; i++) {
        var fsObj = currentSource[i];

        // do we have a subdirectory here?
        if (byParent[fsObj.id]) {
            var src = byParent[fsObj.id];
            if (!currentDest.dir)
                currentDest.dir = [];
            var dst = {};
            dst['@name'] = fsObj.name;
            currentDest.dir.push(dst);
            addDir(dst, src, byParent);
        }

        // do we have a file here?
        else if (fsObj.file_id) {
            if (!currentDest.file)
                currentDest.file = [];
            var file = {};
            file['@name'] = fsObj.file_name;
            file['@id'] = fsObj.file_id;
            file['@time'] = fsObj.file_time;
			file['@useAttachment'] = fsObj.use_attachment;
			file['@checksum'] = fsObj.checksum;
			currentDest.file.push(file);
        }
    }
}

function canSnap() {
    if (!gs.hasRole('mid_server')) {
        resp.result['@code'] = 'Error: user does not have mid_server role';
        return false;
    }
    var target = request.type;
	var base = '' + GlideDBObjectManager.get().getBase(target);
    if (base != 'ecc_agent_sync_file') {
        resp.result['@code'] = 'Error: invalid synchronization target table: ' + target;
        return false;
    }
    gr = new GlideRecord(target);
    if (!gr.canRead()) {
        resp.result['@code'] = 'Error: user not authorized to read synchronization target table: ' + target;
        return false;
    }
    return true;
}

function shouldDownloadFile(tableName, fileName) {
	// do not download a jar with invalid filename characters ('/', '\', or null)
	if (tableName == 'ecc_agent_jar')
		return !/\\|\/|\0/.test(fileName);

	return true;
}
