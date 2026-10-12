doInsertAndStay();
    function doInsertAndStay() {
      var saveMe = current;
      saveMe.setValue("version_state", "draft");
      insertRecord(saveMe);
      action.setRedirectURL(saveMe);
    }
