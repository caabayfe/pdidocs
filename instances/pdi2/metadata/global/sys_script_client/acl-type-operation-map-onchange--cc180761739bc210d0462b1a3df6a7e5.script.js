function onChange(control, oldValue, newValue, isLoading, isTemplate) {
      if (isLoading || newValue === '')
        return;

      g_form.clearOptions('sys_select.sys_security_acl.operation');
    
      var validOperations = fetchValidOperations(newValue);
      validOperations.forEach(operation => g_form.addOption('sys_select.sys_security_acl.operation', operation.sys_id, operation.name));

      g_form.setValue('operation', validOperations[0].sys_id);
      g_form.setReadOnly('operation', validOperations.length <= 1);
    }

    // Fetch all the operation types supported for the ACL types as defined in
    // sys_security_obj_oper table
    function fetchValidOperations(type) {
      var allOperations = fetchAllOperations();

      var gr = new GlideRecord('sys_security_obj_oper');
      gr.addQuery('sys_security_type', type);
      gr.query();

      var validOperations = [];
      while (gr.next()) {
        var operation = allOperations.find(op => op.sys_id == gr.sys_security_operation);
        validOperations.push(operation); 
      }

      validOperations.sort((op1, op2) => op1.order - op2.order);
      return validOperations;
    }

    //Fetch all operations available in the sys_security_operation
    function fetchAllOperations() {
      var gr = new GlideRecord('sys_security_operation');
      gr.query();

      var allOperations = [];
      while (gr.next()) {
        allOperations.push({
          name: gr.name,
          sys_id: gr.sys_id,
          order: gr.order
        }); 
      }

      return allOperations;
    }
