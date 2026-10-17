changeFieldTypeForColumn('message_heading', 'string_full_utf8', 'email_script');
changeFieldTypeForColumn('message', 'string_full_utf8', 'email_script');

function changeFieldTypeForColumn(columnName, oldType, newType) {
	var sysDictionaryGr = new GlideRecord('sys_dictionary');
	sysDictionaryGr.addQuery('name', 'sys_notification_va_content');
	sysDictionaryGr.addQuery('element', columnName);
	sysDictionaryGr.query();
	
	if (sysDictionaryGr.next()) {
		var currentType = sysDictionaryGr.internal_type.getRefRecord().getValue('name');

		if (newType === currentType) {
			gs.info('Notification content column {0} is already of type {1}. Nothing to change', columnName, newType);
			return;
		} else if (currentType === oldType) {
			sysDictionaryGr.setValue('internal_type', newType);
			sysDictionaryGr.setValue('dependent', 'notification.table');
			sysDictionaryGr.setValue('dependent_on_field', 'notification.table');
			sysDictionaryGr.update();
			
			gs.info('Successfully updated the type of notification content column {0} from {1} to {2}', columnName, oldType, newType);
		} else {
			// Just in case the customer has changed the type. This will never happen
			gs.info('Skipping notification content column type change. Invalid current type {0}', currentType);
		}
	}
}
