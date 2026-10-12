var resp = {'result':{'@code':'OK'}};

if (!gs.hasRole('mid_server')) {
   resp.result['@code'] = gs.getMessage('Error: user does not have the mid_server role');
} else {
	var gr = new GlideRecordSecure(request.table);
	if (!gr.isValid())
		resp.result['@code'] = gs.getMessage('Error: the specified table is invalid');
	else if (request.sys_id && gr.get('sys_id', request.sys_id)) {
		if (gr.isValidField(request.field)) {
            resp.result.field_value = {'#cdata' : new GlideStringUtil().escapeHTML(gr[request.field])}; 
			resp.result.updated_time = '' + gr.sys_updated_on.getGlideObject().getNumericValue();
			resp.result.created_time = '' + gr.sys_created_on.getGlideObject().getNumericValue();
		} else
			resp.result['@code'] = gs.getMessage('Error: the requested field was not valid on the given table');
	} else
		resp.result['@code'] = gs.getMessage('Error: the requested record was not found');
}

response.response = new XMLHelper().toXMLDoc(resp, true);
