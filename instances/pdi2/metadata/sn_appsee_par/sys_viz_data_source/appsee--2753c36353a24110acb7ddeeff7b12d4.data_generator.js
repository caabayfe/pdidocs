/**
 * Define logic to get the data
 * @param {string} requestBody - requested data
 * @returns {string} - The data
 */
(function getData(requestBody) { 
   return new sn_uxa_req_manager.UXADADataGenerator().generateDAData(requestBody);
})(requestBody);
