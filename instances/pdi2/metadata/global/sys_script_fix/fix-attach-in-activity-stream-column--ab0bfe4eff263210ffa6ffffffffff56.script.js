/**
 * Updates the label and reference qualifier for the attach_in_activity_stream column in the specified table
 * @param {String} tableName - The name of the table to update
 */
function updateAttachmentColumn(tableName) {
    var COLUMN_NAME = 'attach_in_activity_stream';
    gs.info('Updating label and reference_qual of ' + COLUMN_NAME + ' column in ' + tableName + ' table started');
    try {
        var sysDictGr = new GlideRecord('sys_dictionary');
        sysDictGr.addQuery('name', tableName);
        sysDictGr.addQuery('element', COLUMN_NAME);
        sysDictGr.addQuery('column_label', 'Add attachment to activity stream');
        sysDictGr.query();

        if (sysDictGr.next()) {
            sysDictGr.setValue('column_label', 'Associate attachments to current record');
            sysDictGr.setValue('reference_qual', 'javascript: new SGParameterScreenHelper().getAttachmentInputsRefQual(current);');
            sysDictGr.update();

            gs.info('Updating label and reference_qual of ' + COLUMN_NAME + ' column in ' + tableName + ' table ended');
            return true;
        } else {
            gs.info('Column ' + COLUMN_NAME + ' not found in ' + tableName + ' table');
        }
    } catch (e) {
        gs.error('Error updating ' + COLUMN_NAME + ' in ' + tableName + ': ' + e);
    }
}

var tablesToUpdate = [
    'sys_sg_write_back_action_step',
    'sys_sg_write_back_action_item'
];

tablesToUpdate.forEach(function(tableName) {
    updateAttachmentColumn(tableName);
});
