/**
 * Define logic to get the data
 * @param {string} requestBody - requested data
 * @returns {string} - The data
 */
(function getData(requestBody) { 
   return new sn_telemetry_data.TelemetryDataGenerator().generateDAData(requestBody);
})(requestBody);
