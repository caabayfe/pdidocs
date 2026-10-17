var vtableOperation = new GlideRecord('sn_mif_vtable_operation');
vtableOperation.query();
while (vtableOperation.next()) {
    var vtableOperationContext = new GlideRecord('sn_mif_vtable_operation_context');
    if (!vtableOperationContext.get('vtable_operation', vtableOperation.getUniqueValue())) {
      vtableOperationContext.source_table_name = vtableOperation.source_table;
      vtableOperationContext.vtable_name = vtableOperation.table_name;
      vtableOperationContext.vtable_operation = vtableOperation.getUniqueValue();
      vtableOperationContext.filter_condition = vtableOperation.filter_condition;
      vtableOperationContext.insert();
    }
}
