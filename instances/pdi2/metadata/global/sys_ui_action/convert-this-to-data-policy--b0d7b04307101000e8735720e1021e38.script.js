convertUiPolicyToDataPolicy();

function convertUiPolicyToDataPolicy() {
   var uiPolicyGR = new DataPolicyConversion().convertUiPolicyToDataPolicy(current);
   var fi = new FormInfoHeader();
   fi.addMessage("New Data Policy created from UI Policy");
   action.setRedirectURL(uiPolicyGR);
}
