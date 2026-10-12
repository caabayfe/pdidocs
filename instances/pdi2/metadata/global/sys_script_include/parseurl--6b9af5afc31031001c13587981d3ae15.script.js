var ParseURL = Class.create();

(function() {
	var VALID_SYS_ID_REGEX = /^[0-9a-f]{32}$/;

	//passes only valid sys_id format, otherwise '-1'
	function sanitizeIdString(sysId) {
		var val = String(sysId || '');
		return val.length === 32 && VALID_SYS_ID_REGEX.test(val) ? val : '-1';
	}

	ParseURL.prototype = Object.extendsObject(AbstractAjaxProcessor, {
		parseURL: function() {
			var str = this.getParameter('rowId');
			var tableName = this.getParameter('table');
			
			if (str && str.startsWith("__ENC__")) {
				//GlideStringUtil.base64Decode() will decode only first value until the first appearance of '=' sign.
				str = GlideStringUtil.base64Decode(str.substring("__ENC__".length));
			}
			
			str = sanitizeIdString(str);

			var gr, value;

			//get the ciId
			if (tableName) {
				//in case of custom table, we only validate the sys_id with the query and then return it.
				gr = new GlideRecord(tableName);
				value = 'sys_id';

				if (!gr.isValid())
					return '';

			} else {
				//in case of svc_ci_assoc, we return ci_id instead of sys_id
				gr = new GlideRecord('svc_ci_assoc');
				value = 'ci_id';
			}
			gr.addQuery('sys_id', str);
			gr.setLimit(1);

			if (!gr.canRead())
				return '';

			gr.query();

			if (!gr.next())
				return '';
			
			return gr.getValue(value);
		},
		type: 'ParseURL'
	});
}());
