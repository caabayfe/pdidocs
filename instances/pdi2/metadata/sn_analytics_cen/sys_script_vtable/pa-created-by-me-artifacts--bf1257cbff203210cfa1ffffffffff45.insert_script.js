(function executeInsert(v_record) {
     // Parameters:
     //      v_record is a map of field names and values containing the sys_id of the
     //              record and the fields that need to be inserted in the record on the
     //              remote system (source of data)
     
     //          v_record.<field_name>                   - fields in the remote table GlideRecord
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
