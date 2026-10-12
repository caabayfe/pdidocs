var ep_ReminderSNC = Class.create();
ep_ReminderSNC.prototype = {
    initialize: function () {
        this.REMINDER_TABLE = 'sn_employee_reminder';
        this.currentEmployeeProfile = new sn_employee.employee_profile().getCurrentEmployeeProfile(gs.getUserID()).getUniqueValue();
    },

    /**
     * Object containing fields and options for creating a reminder
     * @typedef {Object} ReminderOptions
     * @property {string} employee - sn_employee_profile sys_id tied to the reminder
     * @property {string} table - table name of the record reminder is for
     * @property {string} reminder_for - record tied to the reminder
     * @property {string} reminder_date - reminder date
     * @property {string} type - reminder type
     */

    /**
     * Creates or updates a reminder record
     * @param {ReminderOptions} fields 
     * @returns { reminerId } - sys_id of the reminder record
     */
    createReminder: function (fields) {
        if (!fields) {return;}

        if (!fields.table || !fields.reminder_for || !fields.reminder_date) {throw new Error(gs.getMessage('Missing mandatory fields'));}

        var employeeProfileId = fields.employee || this.currentEmployeeProfile;
        var reminderForTable = fields.table;
        var reminderFor = fields.reminder_for;
        var date = fields.reminder_date;
        var type = fields.type;
        if (!this.isValidEmployee(employeeProfileId)) 
            throw new Error(gs.getMessage('Employee profile is not valid'))
        
        var gr = new GlideRecord(this.REMINDER_TABLE);
        gr.addQuery('employee', employeeProfileId);
        gr.addQuery('table', reminderForTable);
        gr.addQuery('reminder_for', reminderFor);
        if (type) {gr.addQuery('type', type);}
        gr.query();
        if (gr.hasNext() && gr.next() && gr.canWrite()) {
            gr.setValue('reminder_date', date);
            gr.update();
        } else {
            gr = new GlideRecord(this.REMINDER_TABLE);
            gr.initialize();
            if (!gr.canCreate()) {throw new Error(gs.getMessage('Create access denied'));}
            gr.setValue('employee', employeeProfileId);
            gr.setValue('table', reminderForTable);
            gr.setValue('reminder_for', reminderFor);
            gr.setValue('reminder_date', date);
            gr.setValue('type', type);
            gr.insert();
        }
        return {reminderId: gr.getUniqueValue()};
    },

    /**
     * Delete a reminder record
     * @param {string} employeeProfileId - employee profile sys_id 
     * @param {string} reminderForSysIds - list of sys ids for which the reminder is for
     */
    deleteRemindersByReminderForId: function (employeeProfileId, reminderForSysIds) {
        if (!reminderForSysIds) {return;}

        employeeProfileId = employeeProfileId || this.currentEmployeeProfile;
        if (this.isValidEmployee(employeeProfileId)) {
            var gr = new GlideRecord(this.REMINDER_TABLE);
            gr.addQuery('employee', employeeProfileId);
            gr.addQuery('reminder_for', 'IN', reminderForSysIds);
            gr.deleteMultiple();
        }
    },

    /**
     * Returns an array of all reminders
     * @param {string} employeeProfileId - employee profile sys_id
     * @param {string} type - reminder type
     * @param {string} reminderForTable - table name for which the reminder is for
     *
     * @returns Array of Reminder object
     */
    getAllReminders: function (employeeProfileId, type, reminderForTable) {
        var reminders = [];
        employeeProfileId = employeeProfileId || this.currentEmployeeProfile;
        if (this.isValidEmployee(employeeProfileId)) {
            var gr = new GlideRecord(this.REMINDER_TABLE);
            gr.addQuery('employee', employeeProfileId);
            gr.orderBy('reminder_date');
            if (type) {gr.addQuery('type', type);}
            if (reminderForTable) {gr.addQuery('table', reminderForTable);}
            gr.orderBy('sys_created_on');
            gr.query();
            while (gr.next()) {reminders.push(this._buildReminderObject(gr));}
        }
        return reminders;
    },

    isValidEmployee: function (employeeProfileId) {
        var employee = new GlideRecord('sn_employee_profile');
        if (employeeProfileId && employee.get(employeeProfileId) && employee.canRead()) {
            return new sn_employee.ep_Utils().isValidEmployee(employee.user);
        }
        return false;
    },
 
    /**
     * @params {Gliderecord} reminder - Reminder GlideRecord
     * @returns {Object} ReminderObject
     * {
     *      employeeProfile: {displayValue: string, value: string},
     *      user: {displayValue: string, value: string},
     *      reminderFor: {displayValue: string, value: string},
     *  	reminderForTable: {displayValue: string, value: string},
     *      reminderDate: {displayValue: string, value: string},
     *      type: {displayValue: string, value: string},
     * }
     */
    _buildReminderObject: function (reminder) {
        if (!reminder || !reminder.canRead()) {return;}

        return {
            employeeProfile: {
                value: reminder.getValue('employee'),
                displayValue: reminder.getDisplayValue('employee')
            },
            user: {
                value: reminder.employee.user + '',
                displayValue: reminder.getDisplayValue('employee.user')
            },
            reminderFor: {
                value: reminder.getValue('reminder_for'),
                displayValue: reminder.getDisplayValue('reminder_for')
            },
            reminderForTable: {
                value: reminder.getValue('table'),
                displayValue: reminder.getDisplayValue('table')
            },
            reminderDate: {
                value: reminder.getValue('reminder_date'),
                displayValue: reminder.getDisplayValue('reminder_date')
            },
            type: {
                value: reminder.getValue('type'),
                displayValue: reminder.getDisplayValue('type')
            }
        };
    },

    type: 'ep_ReminderSNC'
};
