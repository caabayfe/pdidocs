function onCondition() {

      var docField = g_form.hasField('document_id');
      var sysField = g_form.hasField('sysapproval');   

      if (!docField && !sysField) {
          alert('There must be a reference field on the form to associate approval with and item. Use Personalize Form Layout and select the Approving field');
          return;  
      }

      // the legacy field is the sysapproval field, going forward using document_id
      // for legacy users, if the document_id field does not exist, still allow
      // the sysapproval field to prevail
      if (!docField && sysField) {
          g_form.setVisible('sysapproval', true);
          return;  
      }

      // if there is a docField with a value then assume that 
      // this is a current record and hide the sysapproval field
      if (docField &&  g_form.getValue('document_id').length > 0) {
          g_form.setVisible('sysapproval', false);
          return;  
      }

      // knowing from test above that there is no doc field with a value 
      // check to see if there is a sysapproval with a value. If so, assume this
      // is potentially a legacy record and allow sysapproval to prevail
      if (sysField && g_form.getValue('sysapproval').length > 0) {
          g_form.setVisible('sysapproval', true);
          g_form.setVisible('document_id', false);
          return;  
      }

      // if not a sysapproval with value and not a document_id with data, then assume that this
      // is a new record, with an empty doc field and empty sysapproval field, and force 
      // the docField
       g_form.setVisible('sysapproval', false);
       g_form.setVisible('document_id', true);

}
