current.update();

var td = new GlideTableDescriptor(current.table);
var elementDescriptors = td.getSchemaList();

for (var i = 0; i < elementDescriptors.size(); i++) {
    var ed = elementDescriptors.get(i);
    if (!ed.getName().startsWith('sys_') && ed.getName() != 'template_import_log' &&
        ed.getName() != 'import_set_run') {

        var name = elementDescriptors.get(i).getLabel();
        var field = elementDescriptors.get(i).getName();
        var entitySysID = current.sys_id.toString();
        var definitionSysID = current.sys_rte_eb_definition.toString();

        if (!isExists(name, field, entitySysID, definitionSysID)) {
            var ef = new GlideRecord('sys_rte_eb_etl_field');
            ef.name = name;
            ef.field = field;
            ef.sys_rte_eb_entity = entitySysID;
            ef.sys_rte_eb_definition = definitionSysID;
            ef.insert();
        }

    }

}

gs.setRedirect("sys_rte_eb_etl_entity.do?sys_id=" + current.sys_id);

function isExists(name, label, entitySysID, definitionSysID) {
    var ef = new GlideRecord('sys_rte_eb_etl_field');
    ef.addQuery('name', name);
    ef.addQuery('field', label);
    ef.addQuery('sys_rte_eb_entity', entitySysID);
    ef.addQuery('sys_rte_eb_definition', definitionSysID);
    ef.query();
    return ef.next();
}
