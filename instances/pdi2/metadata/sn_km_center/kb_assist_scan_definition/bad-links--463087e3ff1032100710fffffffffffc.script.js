//The script below is passed in two variables, target and result
//When the script is finished, it will use the objects found in the result variable to create the results from the scan
//target - GlideRecord containing the record to the run the scan on
//results - an empty array, add an object for each recommendation found, if no recommendations found, add a closed result
//utils - includes functions that can be used to help create results

//This function will find any img tags that are missing alt text located in the html fields of a knowledge record
//and its templates
var searchBadLinks = () => {

  var badScanUtil = new sn_km_center.ArticleAssistBadLinkScan(target, results, utils, err);
  badScanUtil.searchForBadLinks();
};

//Run the scan
searchBadLinks();
