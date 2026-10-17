
      function onCondition() {
      var columnsValue = g_form.getValue("columns");
      var viewValue = g_form.getValue("view");

      if (!columnsValue) {
          g_form.setMandatory("view", true);
          g_form.setDisabled("view", false);
      }

      if (!viewValue) {
          g_form.setMandatory("columns", true);
          g_form.setDisabled("columns", false);
      }
      }
