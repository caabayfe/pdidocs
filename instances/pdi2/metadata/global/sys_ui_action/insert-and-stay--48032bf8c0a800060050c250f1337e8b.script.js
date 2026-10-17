doInsertAndStay();
    function doInsertAndStay() {
      var saveMe = current;
      insertRecord(saveMe);
      action.setRedirectURL(saveMe);
    }
