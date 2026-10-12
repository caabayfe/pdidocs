  function transform(input) {
      var result = {
          "success": false,
          "errors": []
      };
      if (input.processId) {
          activeResponse = sn_pad.PDAutomationProvider.activateProcess(input.processId);
          if (activeResponse.state == "SUCCESS") {
              result.success = true;
          } else {
              result.errors.push(activeResponse.errors);
          }
      }
      return result;
  }
