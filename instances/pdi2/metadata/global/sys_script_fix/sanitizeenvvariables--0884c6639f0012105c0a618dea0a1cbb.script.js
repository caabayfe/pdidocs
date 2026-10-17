const TABLE_SYS_UX_LIB_ASSET = "sys_ux_lib_asset";
// Define the list of keys to ignore and replace
const IGNORE_LIST = [
  'SAUCE_USERNAME',
  'NPM_AUTH_PASS',
  'JENKINS_NODE_COOKIE',
  'glide_it_external_storage_access_key',
  'glide_it_external_storage_secret_key',
  'BT1_LOGIN_PASS',
  'SONARQUBE_USER_TOKEN',
  'JENKINS_SECRET',
  'JENKINS_SERVER_COOKIE',
  'SAUCE_ACCESS_KEY',
  'HUDSON_COOKIE',
  'GITHUB_BUILD_TOKEN',
];
const logGsInfo = (message) => gs.info('[ENV_VAR_SANITIZATION]'+message);
const updateAffectedRecords = () => {
  logGsInfo('# # # updateAffectedRecords | START # # #');
  /* 
   * # DESCRIPTION #
   * * As part of some Tectonic@24 release, the assets built contained the ENV variables.
   * The Issue was fixed with Tectonic@25 & all the components,assets were rebuilt to ensure no asset contains the ENV variables.
   * However, there are some dependencies that were updated by component/application/library teams between v24 & v25 of Tectonic
     - For eg: `sn-sample-component` was using `axios@0.9` when Tectonic@24 was released & `axios@1.0.0` was updated by the component when Tectonic@25 was released.
     - Tectonic@24, would have created a record in `sys_ux_lib_asset` for `axios/0.9`
     - Tectonic@25, would have created a record in `sys_ux_lib_asset` for `axios/1.0.0`
   * So even though all the components are rebuilt, there may be asset records which were built earlier containing environment variables  & are not being consumed(Orphan assets). 
     - Eg: `axios/0.9` in the above example.
   * The intent of the current Fix Script is to check all the `sys_ux_lib_assets` records for sensitive ENV variables., flag the usage & optionally set them to empty values.
   *
   * # SCRIPT DETAILS #
   * Script to list all the `SYS_UX_LIB_ASSET` tables js records, 
   * which contain the keys defined in IGNORE_LIST array.
   * 
   * By default, the script does the below
   * #1. Gets the total count of SYS_UX_LIB_ASSET
   * #2. Looks for keys defined in the IGNORE_LIST array in the `content` column of the table
   * #3. Lists all the occurences of the following pattern `IGNORE_LIST_KEY:"IGNORE_LIST_KEY_VALUE"`,(eg: if 'SAUCE_USERNAME' is an entry in IGNORE_LIST, the pattern will be `SAUCE_USERNAME:"SAUCE_USERNAME_VALUE"`)
   * #4. Logs, all the occurance along with the name of the asset.
   * #5. The above list can be used to validate before running the update
   * #6. Once, the logged list is validated `UPDATE_RECORDS` variable in the below script can be set to value `true` & the script can be run again
   * #7. If `UPDATE_RECORDS` is set to `true`, the script will replace the value of each pattern with empty string(eg: `SAUCE_USERNAME:"SAUCE_USERNAME_VALUE"` will be replaced with `SAUCE_USERNAME:""`) & updates the `content` column.
   * 
  */
  const UPDATE_RECORDS = true;
  const MAX_ROWS_LENGTH = 10000;

  // Define the table name and query filters
  var tableName = TABLE_SYS_UX_LIB_ASSET;
  var queryFilters = {
    'mime_type': 'application/javascript'
  };

  // Create a new GlideRecord object for the specified table
  var gr = new GlideRecord(tableName);

  // Add the query filters
  for (var field in queryFilters) {
    gr.addQuery(field, queryFilters[field]);
  }

  // Add the condition where category should not be equal to 'Source map'
  gr.addQuery('category', '!=', 'Source map');

  // Add the condition where content contains any of the unsafe ENV variables
  gr.addQuery('content', 'CONTAINS', 'NPM_AUTH_PASS');
  
  gr.setWorkflow(false);
  // gr.setLimit(MAX_ROWS_LENGTH); 

  // Query the table 
  gr.query();
  var totalRecords = gr.getRowCount(); // Total record count
  logGsInfo('* Total number of records in table "' + tableName + '" : ' + totalRecords);



  // Define the function to update the 'content' column
  function updateContentColumn(record, newContentValue) {
    record.setValue('content', newContentValue);
    record.update(); // Save the changes to the record
  }

  // Define the function to replace ignored keys
  function replaceIgnoredKeys(gr, nameValue, input, keys) {
    var output = input;
    var foundKeys = {}; // Using an object to keep track of found keys

    keys.forEach(function (key) {
      // Create a regular expression to match the key and its value
      var regex = new RegExp('(' + key + '):"[^"]+"', 'g');
      var match;
      while ((match = regex.exec(input)) !== null) {
        foundKeys[key] = true; // Mark the key as found
        // Log the original key-value pair
        logGsInfo('* ENV_EXPOSED_ENTRY * ' + nameValue + ' | Found key: ' + match[1] + ' with non-empty value ');
        // Replace the matched key-value pair with the key and an empty value
        output = output.replace(match[0], match[1] + ':""');
      }
    });

    // Log the found keys
    var foundKeysArray = Object.keys(foundKeys);
    if (foundKeysArray.length > 0) {
      if (UPDATE_RECORDS) {
        logGsInfo('+ ' + nameValue + ' | Updating the record with updated content');
        updateContentColumn(gr, output);
      }
    }
  }

  logGsInfo(`# Looking for JS Assets for environment variables in ${totalRecords} records of ${tableName}`);
  // Iterate through the records
  while (gr.next()) {
    // Get the 'name' column value
    var nameValue = gr.getValue('name');
    // Get the 'content' column value
    var contentValue = gr.getValue('content');
    // logGsInfo('Name: ' + nameValue);
    if (contentValue) {
      // Replace ignored keys in the 'content' value
      var updatedContentValue = replaceIgnoredKeys(gr, nameValue, contentValue, IGNORE_LIST);
      // logGsInfo('Content (with ignored keys replaced): ' + updatedContentValue);
    }
  }
  logGsInfo('# # # updateAffectedRecords | FINISHED # # #');
}


function doAssetsHaveSensitiveData() {
  logGsInfo('# # # doAssetsHaveSensitiveData | START # # #');
  var gr = new GlideRecord(TABLE_SYS_UX_LIB_ASSET);
  gr.addQuery("mime_type", "application/javascript");
  gr.addQuery('category', '!=', 'Source map');
  gr.addQuery('content', 'CONTAINS', 'NPM_AUTH_PASS');

  gr.setLimit(1);
  //prevents business rules from running
  gr.setWorkflow(false);
  gr.query();
  logGsInfo('# # # doAssetsHaveSensitiveData | FINISH # # # ' + gr.hasNext());
  return gr.hasNext();
}
const isInstanceAffected = doAssetsHaveSensitiveData();

if (isInstanceAffected) {
  logGsInfo('# # # UPDATE | ASSETS HAVE SENSITIVE DATA: # # # ');
  updateAffectedRecords();
} else {
  logGsInfo('# # # No Change needed # # # ');
}
