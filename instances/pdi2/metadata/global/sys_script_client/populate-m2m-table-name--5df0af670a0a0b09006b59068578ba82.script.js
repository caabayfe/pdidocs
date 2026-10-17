      function onLoad() { 

      }

      function calcM2MName() {
         // Get values from form
         var fromField = g_form.getValue("m2m_from_field");
         var toField = g_form.getValue("m2m_to_field");

         // Calculate the sum of both fields, and trim fields to 12 characters if necessary
         if (fromField.length + toField.length >= 25) {
            if (fromField.length > 12)
               fromField = trimField(fromField);
            if (toField.length > 12)
               toField = trimField(toField);
         }
         //Populate the form
         g_form.setValue("m2m_table", getPrefix() + fromField + "_" + toField);
      }

      function trimField(field) {
         if (field.charAt(12) == '_')
            return field.substr(0, 11);
         else
            return field.substr(0, 12);
      }

      function getPrefix() {
        var prefix = g_scratchpad.scope;
        prefix = (prefix == 'global') ? 'u_' : prefix + '_';
        return prefix + 'm2m_';
      }
    
