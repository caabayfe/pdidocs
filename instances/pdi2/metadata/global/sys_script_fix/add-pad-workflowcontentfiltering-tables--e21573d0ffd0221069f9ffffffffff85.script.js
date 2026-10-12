var valueString = GlidePropertiesDB.get('glide.ui.permitted_tables');
var valueArray;
var doUpdate = false;

// sys_pd_activity_definition taken care of in glidefix.
// don't use const here so that if we update this list, the fix script will run again
var tables = [
    'sys_pd_process_definition',
    'sys_pd_activity',
    'sys_pd_derivative'
];

if (!valueString) {
    valueArray = tables;
    doUpdate = true;
} else {
    // important to do '' + to convert java string to js
    valueArray = ('' + valueString).split(',');

    for (var i = 0; i < tables.length; i++) {
        if (valueArray.indexOf(tables[i]) == -1) {
            valueArray.push(tables[i]);
            doUpdate = true;
        }
    }
}

if (doUpdate) {
    var newString = valueArray.join(',');
    gs.info('Updating property "glide.ui.permitted_tables" to "' + newString + '".');
    GlidePropertiesDB.set('glide.ui.permitted_tables', newString);
}
