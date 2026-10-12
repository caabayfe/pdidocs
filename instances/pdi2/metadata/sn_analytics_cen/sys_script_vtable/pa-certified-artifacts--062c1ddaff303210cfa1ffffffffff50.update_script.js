(function executeUpdate(v_record, v_changed_fields) {
     // Parameters:
     //    v_record - a map of field names and values containing the sys_id of the record
     //          v_record.<field_name>                   - fields in the remote table GlideRecord
     //          v_record.setLastErrorMessage(message)   - signal an error
     //    v_changed_fields - a map of field names and values containing the sys_id of the
     //          v_changed_fields.<field_name>           - changed fields in the remote table GlideRecord
 
     // Sample code:
     //  try {
     //      update-external-system;
     //      if (there-was-an-error) {
     //          var message = ...;
     //          v_record.setLastErrorMessage(message);
     //      }
     //  } catch (ex) {
     //      var message = ex.getMessage();
     //      v_record.setLastErrorMessage(message);
     //  }
  })(v_record, v_changed_fields);
