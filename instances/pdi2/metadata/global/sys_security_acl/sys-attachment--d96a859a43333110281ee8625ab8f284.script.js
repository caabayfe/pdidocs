answer = hasAccessToJournalField();

function hasAccessToJournalField() {
	var journalFieldGr = new GlideRecord('sys_journal_field');
	if (!journalFieldGr.get(current.table_sys_id))
		return false;

	var document = new GlideRecord(journalFieldGr.name);
	if (!document.get(journalFieldGr.element_id))
			return false;

	var element = document.getElement(journalFieldGr.getValue('element'));
	return (element !== null) ? element.canRead() : false;
}
