(function executeRule(current, previous /*null when async*/ ) {
    var serviceId = current.getUniqueValue();
    if (gs.nil(serviceId)) { 
      return;
    }

    var newDelegateId = current.getValue('service_owner_delegate');
    var oldDelegateId = (previous && previous.isValidRecord()) ? previous.getValue('service_owner_delegate') : '';

    // No effective change
    if (newDelegateId === oldDelegateId) { 
      return;
    }

    var typeId = '2a5b4f61b7df62105c5d2a16de11a9aa';

    // Remove only the specific old delegate row if it existed
    if (!gs.nil(oldDelegateId)) {
        var del = new GlideRecord('cmdb_rel_person');
        del.addQuery('ci', serviceId);
        del.addQuery('type', typeId);
        del.addQuery('user', oldDelegateId);
        del.deleteMultiple();
    }

    // If cleared, nothing to add
    if (gs.nil(newDelegateId)) { 
      return;
    }

    // Only insert if a matching row doesn't already exist
    var existing = new GlideRecord('cmdb_rel_person');
    existing.addQuery('ci', serviceId);
    existing.addQuery('type', typeId);
    existing.addQuery('user', newDelegateId);
    existing.setLimit(1);
    existing.query();
    if (existing.next()) { 
      return;
    }

    var rel = new GlideRecord('cmdb_rel_person');
    rel.initialize();
    rel.setValue('ci', serviceId);
    rel.setValue('user', newDelegateId);
    rel.setValue('type', typeId);
    rel.insert();
})(current, previous);
