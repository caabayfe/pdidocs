(function executeRule(current, previous /*null when async*/ ) {
    try {
        var operation = current.operation();
        if (operation == 'insert') {
            addOrUpdateActivityDef();
        } else if (operation == 'update') {
            if (current.parent_entity.changes() || current.relation_type.changes() || current.source_field.changes() || current.target_field.changes()) {
                if (!isReferencedChildTableExist(previous)) {
                    deleteActivityDef(previous);
                }
                addOrUpdateActivityDef();
            }
        } else if (operation == 'delete') {
            if (!isReferencedChildTableExist(current)) {
                deleteActivityDef(current);
            }
        }
    } catch (error) {
        gs.error(error);
        current.setAbortAction(true);
        gs.setRedirect(current);
    }

    function addOrUpdateActivityDef() {
        if (gs.nil(current.parent_entity) || current.relation_type != "REFERENCE" || gs.nil(current.source_field) || gs.nil(current.target_field)) {
            return false;
        }
        if (!canCreateActivityDef(current.parent_entity)) {
            gs.addErrorMessage(gs.getMessage('Unable to create grouped activity definition for target field "{0}" in "{1}" parent table configuration', [current.getValue('target_field'), current.parent_entity.getRefRecord().getValue('name')]));
            return false;
        }
        var grActivityDef = new GlideRecord('promin_activity_def');
        grActivityDef.addQuery('entity', current.getValue('parent_entity'));
        grActivityDef.addQuery('field', current.getValue('target_field'));
        grActivityDef.query();
        if (!grActivityDef.next()) {
            grActivityDef.newRecord();
            grActivityDef.setValue('entity', current.getValue('parent_entity'));
            grActivityDef.setValue('field', current.getValue('target_field'));
            grActivityDef.setValue('track_change', true);
            var grTable = new GlideRecord(current.table);
            grActivityDef.setValue('change_name', grTable.getClassDisplayValue() + " attached");
            if (!grActivityDef.insert()) {
                // throw gs.getMessage("Creation of activity definition failed."); //reject update operation if new activity def can't be added
            }
        }
    }

    function deleteActivityDef(grTableConfig) {
        var grActivityDef = new GlideRecord('promin_activity_def');
        grActivityDef.addQuery('entity', grTableConfig.getValue('parent_entity'));
        grActivityDef.addQuery('field', grTableConfig.getValue('target_field'));
        grActivityDef.query();
        if (grActivityDef.next()) {
            grActivityDef.deleteRecord();
        }
    }

    function isReferencedChildTableExist(entity) {
        var grProjectEntity = new GlideRecord("promin_project_entity");
        grProjectEntity.addQuery("relation_type", entity.getValue("relation_type"));
        grProjectEntity.addQuery("parent_entity", entity.getValue("parent_entity"));
        grProjectEntity.addQuery("target_field", entity.getValue("target_field"));
        grProjectEntity.query();
        return grProjectEntity.hasNext();
    }

    // Do not create activity def if parent entity cannot create more
    // default activity defs
    function canCreateActivityDef(entityId) {
        var grActivityDef = new GlideRecord('promin_activity_def');
        grActivityDef.addEncodedQuery('entity=' + entityId + '^type=DEFAULT');
        grActivityDef.query();

        var limit = gs.getProperty('promin.limit.default_activity', 5);

        if (parseInt(grActivityDef.getRowCount()) >= parseInt(limit)) {
            return false;
        }

        return true;
    }

})(current, previous);
