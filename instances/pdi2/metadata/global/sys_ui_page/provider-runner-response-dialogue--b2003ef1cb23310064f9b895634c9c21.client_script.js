function changeresponse(type,tab){

	$j(tab).addClass('active').siblings('.active').removeClass('active');
	
	var msg = $j('#originalresponsemsg').val();
	$j('#responsemsgpre').text(jsonformat(msg,type));
}

function jsonformat(msg,sect){
	
	var jsondata = JSON.parse(msg);
	
	if(sect != ''){
		var formattedresponsemsg = JSON.stringify(jsondata[sect], null, 4);
	}else{
		var formattedresponsemsg = JSON.stringify(jsondata, null, 4);
	}
	
	return formattedresponsemsg;
}

//pretty format JSON
$j('#responsemsgpre').text( jsonformat($j('#originalresponsemsg').val(),'') );
