function include({ imports }, api, helpers) {
  function callUtilAPI(body, loaderNeeded) {
    if (loaderNeeded) loaderComponent(true);
    return helpers
      .snHttp("/api/sn_instance_clone/clone/util", {
        method: "POST",
        body: {
          ...body,
        },
      })
      .then((response) => {
        callbackHandler(body, response.response);
      })
      .catch((response) => {
        try {
          errorCallbackHandler(body, response.error);
          console.log(
            body.operation + " failed: " + JSON.stringify(response.error),
          );
        } catch (e) {
          console.log(body.operation + " failed: " + JSON.stringify(response));
        }
      });
  }

  function loaderComponent(show) {
    api.emit("NOW_UXF_PAGE#SET_LOADING_STATE", {
      loading: show,
      label: "Loading...",
      action: null,
      nonBlocking: false,
    });
  }

  // function errorCallbackHandler(body, response) {
  //   var errorMessage =
  //   response.data.result?.error || response.data?.error?.message;
  //   if(body.operation === "TOGGLE_MIF_ENABLE") {
  //       errorMessage = "Failed to update MIF settings. Please try again.";
  //       api.setState("errorMessage", errorMessage);
  //   }
  //   loaderComponent(false);
  //   openErrorModal(errorMessage);
  // }

  // function openErrorModal(errorMessage) {
  //   api.setState(
  //     "errorMessage",
  //     errorMessage || "An unexpected error occurred. Please try again."
  //   );
  //   helpers.modal.open("error_modal");
  // }

  function callbackHandler(body, response) {
    switch (body.operation) {
      case "FETCH_MIF_INSTANCES":
        if (response.result.isError) {
          api.setState("errorMessage", response.result.message);
          openErrorModal(response.result.message);
        } else {
          // var multiInstanceView = JSON.parse(
          //   JSON.stringify(api.state.multiInstanceView)
          // );
          // multiInstanceView.mif_instances = response.result.records;
          // multiInstanceView.originalInstances = response.result.records.map(item => ({ ...item }));
          // multiInstanceView.totalRecords = response.result.totalItems;
          api.setState("instances", response.result.records);
          api.setState("totalRecords", response.result.totalItems);
        }
        break;
      // case "SETUP_MIF_INSTANCES":
      //   api.setState("setupMifInstancesResponse", response.result);
      //   break;
      case "IS_MIF_ENABLED":
        debugger;
        var isMifEnabled = response.result.isMifEnabled || false;
        api.setState("isMifEnabled", isMifEnabled);
        //helpers.modal.open("mif_settings_modal");
        break;
      case "TOGGLE_MIF_ENABLE":
        api.setState("isMifEnabled", response.result.toggleProperty);
        if (response.result.updated) {
          if (!response.result.toggleProperty) {
debugger;
            if(api.state.trustorInstances.length > 0) {
              callUtilAPI({ operation: "REMOVE_ALL_TRUST" }, false);
            }
          } else {
            callUtilAPI({ operation: "TRIGGER_VTABLE" }, false);
            //callUtilAPI({ operation: "FETCH_MIF_INSTANCES" }, false);
            //helpers.modal.open("multi_instance_setup_modal");
          }
        }
        break;

      default:
        break;
    }
    loaderComponent(false);
  }
  return {
    callUtilAPI,
  };
}
