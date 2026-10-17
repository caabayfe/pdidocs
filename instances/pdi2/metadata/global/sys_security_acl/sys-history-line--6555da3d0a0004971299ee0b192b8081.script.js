answer = getSysHistoryLineAnswer();
	
function getSysHistoryLineAnswer() {
	// first attempt to retrieve the related record. If failing to do so then the line shall not be readable
	if (current.set.isNil())
		return false;
	
	var relatedTable = current.set.table;
	if (relatedTable.isNil())
		return false;
	
	var relatedGR = new GlideRecord(relatedTable);
	if (!relatedGR.get(current.set.id))
		return false;
		
	// if the related record is not readable, none of its history shall be readable
	if (!relatedGR.canRead())
		return false;
		
	// the history for a field of that record shall only be readable if the field itself is readable
	var relatedField = current.field;
	if (relatedGR.isValidField(relatedField))
		return relatedGR[relatedField].canRead();
	
	/*
		We stuff email records in sys_history_line. These email records are not on the related record,
		but instead on sys_email. The relationship manifests with field sys_email.instance containing
		the sys_id of the related record mentioned here. 
	*/ 
	if (relatedField.getValue() == 'email') {
		var emailRecord = new GlideRecord('sys_email');
		emailRecord.addQuery('instance', relatedGR.sys_id);
		emailRecord.query();
		if (emailRecord.hasNext()) {
            while (emailRecord.next()) {
                if (!emailRecord.canRead())
                    return false;
            }

            return true;
		}
	}
	
	// that history line does not reference a valid field. Check if it is possibly a line that has been generated
	// by a legacy feature:
	
	// catalog variables are using this specific prefix in audit records
	var variable_prefix = 'VARIABLE:';
	if (relatedTable == 'sc_req_item' && relatedField.startsWith(variable_prefix)) {
		var variableName = relatedField.substring(variable_prefix.length);
		return relatedGR.variables[variableName].canRead();
	}
	
	// CMDB application is adding those lines to the audits of the new (and former if applicable) parent and child
	// of relationships. The exact relationship record cannot be efficiently retrieved so table level ACL 
	// will be enforced instead
	if (GlideDBObjectManager.getAbsoluteBase(relatedTable) == 'cmdb_ci' && 
		(current.getValue('new') == '(relationship removed)' || current.old == '(relationship added)' ||
		 relatedField == 'relation')) {
		return GlideTableDescriptor.get('cmdb_rel_ci').canRead();
	}

	// if the related record is readable and this is a relation field it should be readable
	if (relatedField == 'relation')
		return true;
		
	// unable to determine if that line should be readable or not, hide it by default
	return false;
}
