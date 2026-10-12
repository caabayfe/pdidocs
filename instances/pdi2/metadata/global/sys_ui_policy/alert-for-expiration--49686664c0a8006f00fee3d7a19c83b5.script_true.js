function onCondition() {
  var days_to_exp = gel('sys_certificate.expires_in_days').value * 1; 
  var warn_in_days_str=	gel('sys_certificate.warn_in_days_to_expire').value;
  if (isNaN(warn_in_days_str)){
	  warn_in_days_str= warn_in_days_str.replace(/[,.]/g,'');
  }  		
  var warn_in_days = warn_in_days_str * 1;
  
  if (days_to_exp <= 0) {
    alert("Certificate has expired");
  } else if (days_to_exp <= warn_in_days) {
    alert("Certificate is about to expire");
  }
}
