function process(record) {
    var table = record.getField('table');
    if (!table || table.getValue() != 'sys_user') {
        return;
    }

    var formattedLocation = '';

    var locationField = record.getField('location');
    if (!locationField) {
        return;
    }

    var locationRef = locationField.getValue();
    locationField.setDisplayValue(formattedLocation);
    if (!locationRef) {
        return;
    }

    var locationGr = new GlideRecord('cmn_location');
    locationGr.get(locationRef);
    var locationArr = [];
    locationArr[0] = locationGr.getDisplayValue('city');
    locationArr[1] = locationGr.getDisplayValue('state');
    locationArr[2] = locationGr.getDisplayValue('country');

    locationArr.forEach(function(elm) {
        elm = elm ? elm.trim() : elm;
        if (elm) {
            formattedLocation = formattedLocation ? (formattedLocation + ', ' + elm) : (formattedLocation + elm);
        }
    });

    locationField.setDisplayValue(formattedLocation);

    return record;
}
