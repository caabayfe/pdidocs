importCSS();
function importCSS() {
         var getMethod = new Packages.org.apache.commons.httpclient.methods.GetMethod(current.url);
         var httpClient = new GlideHTTPClient();
         var result = httpClient.executeMethod(getMethod);
         if (result != 200) {
            gs.addErrorMessage(gs.getMessage('Import failed with error code %1', result));
            return;
         }
         
         var css = getMethod.getResponseBodyAsString();
         current.setValue('type','local');
         current.style = css;
         current.update();
         action.setRedirectURL(current);
         gs.addInfoMessage(gs.getMessage('Successfully imported style sheet from %1', current.url));
}
