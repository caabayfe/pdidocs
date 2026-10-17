(function executeDelete(v_record) {
     // Parameters:
     //      v_record - a map of field names and values containing (among others) the
     //              sys_id of the record that needs to be deleted on the remote system
     //          v_record.<field_name>                  - fields in the remote table GlideRecord
     //          v_record.setLastErrorMessage(message)   - signal an error
 
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
  })(v_record);
