(function executeRule(current, previous /*null when async*/) {
    
    var parentTable = current.getValue('parent_table');
    var offlineField = 'available_offline';
    
    if (parentTable === 'sys_sg_folder')
        return;

    if (parentTable === 'sys_sg_master_item')
        current.setValue(offlineField, getMasterItemValue());

    if (parentTable === 'sys_sg_map_screen')
        current.setValue(offlineField, getMapScreenValue());


    function getMasterItemValue() {
        var currentValue = current.getValue(offlineField);
        var masterItemId = current.getValue('parent');
        var masterItem = new GlideRecord('sys_sg_master_item');

        if (!masterItem.get(masterItemId))
            return currentValue;

        var screen = masterItem.screen.getRefRecord();

        if (!screen || !screen.isValidRecord())
            return currentValue;

        return screen.getValue(offlineField);
    }

    function getMapScreenValue() {
        var currentValue = current.getValue(offlineField);
        var parentScreen = current.parent.getRefRecord();

        if (!parentScreen || !parentScreen.isValidRecord())
            return currentValue;

        return parentScreen.getValue(offlineField);
    }
        
})(current, previous);
