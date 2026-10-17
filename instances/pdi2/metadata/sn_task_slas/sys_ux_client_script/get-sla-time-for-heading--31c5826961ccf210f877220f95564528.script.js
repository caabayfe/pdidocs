/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  function formatBusinessTime(str) {
    return (!str || str.trim() === "")
      ? "0m"
      : str
          .replace(/(\d+)\s*Days?/, "$1d")
          .replace(/(\d+)\s*Hours?/, "$1h")
          .replace(/(\d+)\s*Minutes?/, "$1m")
          .replace(/(\d+)\s*Seconds?/, "$1s")
          .trim();
  }

  if (api.item.value.has_breached.value === true) {
    return {
      "label":  formatBusinessTime(api.item.value.business_duration.displayValue) + " elapsed"
    };
  } else {
    return {
      "label":  formatBusinessTime(api.item.value.business_time_left.displayValue) + " remaining"
    };
  }
}
