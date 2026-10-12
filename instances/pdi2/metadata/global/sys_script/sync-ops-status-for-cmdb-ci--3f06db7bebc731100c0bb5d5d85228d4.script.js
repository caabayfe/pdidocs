var OpsStatusSynchronizer = Class.create();
OpsStatusSynchronizer.prototype = {
    initialize: function(currentCIRecord) {
        if (!currentCIRecord)
            return;

        this.current = currentCIRecord;
        if (currentCIRecord.getElement('hardware_status')) {
            this.statusField = 'hardware_status';
            this.baseTable = 'cmdb_ci_hardware';
        } else {
            this.statusField = 'install_status';
            this.baseTable = 'cmdb_ci';
        }
    },

    shouldSync: function() {
        if (!this.current)
            return false;

        var current = this.current;
        var opsChoice = current.getElement('operational_status').getChoiceValueLang('en');
        var statusChoice = current.getElement(this.statusField).getChoiceValueLang('en');

        var retired = gs.getMessageLang('Retired', 'en');
        return opsChoice == retired && statusChoice != retired ||
            opsChoice != retired && statusChoice == retired;
    },

    syncStatus: function() {
        if (!this.current)
            return;

        var current = this.current;
        var statusField = this.statusField;
        var baseTable = this.baseTable;

        var retired = gs.getMessageLang('Retired', 'en');
        var fromOps = {};
        fromOps[retired] = retired;

        var toOps = {};
        toOps[retired] = retired;

        var ops = current.getElement('operational_status');
        var status = current.getElement(statusField);
        if (ops.changes()) { // higher priority for checking Operational Status
            var opsChoice = ops.getChoiceValueLang('en');
            var statusChoice = fromOps[opsChoice];
            var subStatusChoice = ''; // necessary to set Hardware Asset retired
            if (!statusChoice) {
                statusChoice = gs.getMessageLang('Installed', 'en');
                subStatusChoice = gs.getMessageLang('In Use', 'en');
            }
            current.setValue(statusField,
                new SNC.CMDBUtil().getChoiceListByLanguage(baseTable, statusField, 'en').getValueOf(statusChoice));
            if (baseTable == 'cmdb_ci_hardware') {
                var subStatusField = 'hardware_substatus';
                current.setValue(subStatusField, !subStatusChoice ? '' :
                    new SNC.CMDBUtil().getChoiceListByLanguage(baseTable, subStatusField, 'en').getValueOf(subStatusChoice));
            }

        } else {
            statusChoice = status.getChoiceValueLang('en');
            opsChoice = toOps[statusChoice];
            if (!opsChoice)
                opsChoice = gs.getMessageLang('Non-Operational', 'en');
            current.setValue('operational_status',
                new SNC.CMDBUtil().getChoiceListByLanguage(baseTable, 'operational_status', 'en').getValueOf(opsChoice));

        }
    },

    type: 'OpsStatusSynchronizer'
};

var synchronizer = new OpsStatusSynchronizer(current);
if (synchronizer.shouldSync())
    synchronizer.syncStatus();
