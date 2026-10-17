/**
* Add an attachment to the current record and add a note to comments or work_notes field.
*
*/
var Attachment_NoteActivityHandler = Class.create();
Attachment_NoteActivityHandler.prototype = Object.extendsObject(WFActivityHandler, {

    initialize: function() {
        WFActivityHandler.prototype.initialize.call(this);
    },

    onExecute: function() {
        var attachmentData = this.js(activity.vars.data + '');
        var attachmentName = this.js(activity.vars.name + '');
        var fieldName = "comments";

        if (activity.vars.field != "comments")
            fieldName = "work_notes";

        var sa = new GlideSysAttachment();
        var attachmentId = sa.write(current, attachmentName, attachmentData);
        current[fieldName] = gs.getMessage('Attachment "{0}" added by workflow "{1}".', [attachmentName, context.name]);
    },

    type: 'Attachment_NoteActivityHandler'
});
