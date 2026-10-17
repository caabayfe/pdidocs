function transform() {
  function abbreviateNumber(num) {
    const units = [
      { value: 1e12, symbol: "T" },
      { value: 1e9, symbol: "B" },
      { value: 1e6, symbol: "M" },
      { value: 1e3, symbol: "K" },
    ];

    if (Math.abs(num) < 1000) {
      // For small numbers, round and remove unnecessary decimal places
      let rounded = Math.round(num * 100) / 100;
      return Number(rounded.toFixed(2)).toString();
    }

    for (let i = 0; i < units.length; i++) {
      if (Math.abs(num) >= units[i].value) {
        let divided = num / units[i].value;
        let rounded = Math.round(divided * 100) / 100; // Half-up rounding
        // Remove trailing zeros after decimal
        let formatted = Number(rounded.toFixed(2)).toString();
        return formatted + " " + units[i].symbol;
      }
    }
  }

  var result = {
    scanDefinitionCounts: [],
  };

  var definitionCounts = {};

  // Now get counts grouped by scan_definition
  var gaByDefinition = new GlideAggregate("kb_assist_scan_result");
  gaByDefinition.addQuery("state", "open");
  gaByDefinition.groupBy("scan_definition");
  gaByDefinition.addAggregate('COUNT(DISTINCT', 'target_record');
  gaByDefinition.query();

  while (gaByDefinition.next()) {
    var scanDefSysId = gaByDefinition.getValue("scan_definition");
    var scanDefDisplay = gaByDefinition.scan_definition.getDisplayValue();
    if (!definitionCounts[scanDefSysId]) {
      definitionCounts[scanDefSysId] = {
        display: scanDefDisplay,
        count: gaByDefinition.getAggregate('COUNT(DISTINCT', 'target_record')
      };
    }
  }

  result.scanDefinitionCounts = Object.keys(definitionCounts)
    .map(function (key) {
      var item = definitionCounts[key];
      return {
        count: item.count,
        display: item.display,
        label: item.display + " (" + abbreviateNumber(item.count) + ")",
        sysId: key,
      };
    })
    .sort(function (a, b) {
      return b.count - a.count;
    })
    .slice(0, 5);

  return result;
}
