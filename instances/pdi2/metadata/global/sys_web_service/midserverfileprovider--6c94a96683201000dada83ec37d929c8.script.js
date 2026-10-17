// supports two operations: 'open' and 'read'
// open operation requires table and attachment_id; returns information about the attachment
// read operation requires table, attachment_id, sequence, and max_chunks; returns up to max_chunks blocks of attachment document
var op  = request.operation;
var tbl = request.table;
var aid = request.attachment_id;
var seq = request.sequence;
var max = request.max_chunks;

var resp = {'result':{'@code':'OK'}};

if (!gs.hasRole('mid_server')) {
   resp.result['@code'] = 'Error: user does not have the mid_server role';
} 
else {
   switch(op) {
   case 'open':
       handleOpen(tbl, aid, resp);
       break;
       
   case 'read':
       handleRead(tbl, aid, seq, max, resp);
       break;

   default:
       resp.result['@code'] = 'Invalid operation: ' + op;
       break;
   }
}

response.response = new XMLHelper().toXMLDoc(resp);

function handleOpen(tbl, aid, resp) {
    if (!isValidTable(tbl, resp))
        return;
    
    var gr = getAttachment(tbl, aid, resp);
    if (!gr)
        return;
    
    resp.result.compressed      = '' + gr.compressed;
    resp.result.size_bytes      = '' + gr.size_bytes;
    resp.result.size_compressed = '' + gr.size_compressed;
    resp.result.content_type    = '' + gr.content_type;
    resp.result.file_name       = '' + gr.file_name;
    resp.result.created_time    = '' + gr.sys_created_on.getGlideObject().getNumericValue();
    
    if (request.need_signature == 'true') {
        var su = new sn_automation.SignatureUtil(tbl, aid);
		var sig_ver = request.signature_version;
		try {
			var signature = su.getVersionedSignature(sig_ver);
			if (signature)
				resp.result.signature = '' + signature;
		} catch (err) {
			gs.error("The MIDServerFileProvider web service failed to handle the request due to the unsupported signature_version: " + sig_ver + ", error: " + err);
			resp.result['@code'] = 'Unsupported signature_version: ' + sig_ver;
		}
    }
} 

function handleRead(tbl, aid, seq, max, resp) {
    if (!isValidTable(tbl, resp)) 
        return;
    
    if (!getAttachment(tbl, aid, resp))
        return;
    
    var gr = GlideSysAttachment.getAttachmentParts(aid, seq, max);
    var chunk = [];
    while (gr.next()) {
        var datum = {};
        datum.data = '' + gr.data;
        datum.length = '' + gr.length;
        chunk.push(datum);
    }
    if (chunk.length == 0) {
        resp.result['@code'] = 'EOF';
        return;
    }
    
    resp.result.chunk = chunk;
}

/*
 * Returns a GlideRecord for the given sys_attachment sys_id, if the given table matches the one in the attachment.  Returns 
 * null sets an appropriate error message in the response otherwise.
 */
function getAttachment(table, aid, resp) {
    var gr = new GlideRecord('sys_attachment');
    if (!aid || !gr.get('sys_id', aid)) {
        resp.result['@code'] = 'Could not read attachment: sys_attachment:' + aid;
        return null;
    }
    if (gr.table_name == table || gr.table_name == ('ZZ_YY' + table)) {
        return gr;
    } else {
        resp.result['@code'] = 'Given table does not match attachment table:' + table + ' vs. ' + gr.table_name;
        return null;
    }
}

/*
 * Returns true if the tiven table is valid and is extended from ecc_agent_sync_file.  If it
 * returns false, the response's code is set to an error message.
 */
function isValidTable(table, resp) {
    var gr = new GlideRecord(table);
    if (!gr.isValid()) {
        resp.result['@code'] = 'Invalid table: ' + table;
        return false;
    }
    
    var base = '' + GlideDBObjectManager.get().getBase(table);
    if (base != 'ecc_agent_sync_file' && base != 'ecc_agent_attachment') {
        resp.result['@code'] = 'Invalid table base: ' + table;
        return false;
    }
    return true;
}
