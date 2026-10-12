addLoadEvent(tcColumnRequestForIndex('$[sysparm_table_name]'));
function buildSelectList() {
    var sel1 = document.getElementById('columns_1')
    var selected = document.getElementById('sysparm_fields')
    saveAllSelected([ sel1 ], [ selected ], ',', '\\', '--None--');
}
