convertDataPolicyToUiPolicy();

function convertDataPolicyToUiPolicy() {
   var dataPolicyGR = new DataPolicyConversion().convertDataPolicyToUiPolicy(current);
   var fi = new FormInfoHeader();
   fi.addMessage("New UI Policy created from Data Policy");
   action.setRedirectURL(dataPolicyGR);
}
