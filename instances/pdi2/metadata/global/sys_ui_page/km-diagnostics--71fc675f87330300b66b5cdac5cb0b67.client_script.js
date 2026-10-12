gel('user').setAttribute('onchange',gel('user').getAttribute('onchange')+' disableButton();');
gel('article').setAttribute('onchange',gel('article').getAttribute('onchange')+' disableButton();');
gel('kb').setAttribute('onchange',gel('kb').getAttribute('onchange')+' disableButton();');
$j('title').html("${gs.getMessage('User Criteria Diagnostics')}");
window.focus();

$j(document).ready(function() {

	$j(".collapsible").on("click",function(){
		var content = $j(this).next(".content");
		if(content.css("max-height") != "0px"){
			content.css("max-height","0px");
			$j(this).children("h2").children(".expand").addClass("icon-add");
			$j(this).children("h2").children(".expand").removeClass("icon-remove");
		}else{
			content.css("max-height",content.prop("scrollHeight")+"px");
			$j(this).children("h2").children(".expand").removeClass("icon-add");
			$j(this).children("h2").children(".expand").addClass("icon-remove");
		}
	});
	$j(".collapsible").click();
});




function disableButton(){
	var userEntered = $j('#user').val()!='';
	var recordEntered;
	var isArticle = document.getElementById('articleChkbox').checked;
	if(isArticle)
		recordEntered = $j('#article').val()!='';
	else
		recordEntered = $j('#kb').val()!='';
	
	if(userEntered && recordEntered)
		document.getElementById('diagnose').disabled=false;
	else
		document.getElementById('diagnose').disabled=true;
	$j('#results').remove();
}

function toggleInputs(){
	var isArticle = document.getElementById('articleChkbox').checked;
	var div = document.getElementById('articleChkbox').parentElement.parentElement.parentElement.parentElement;
	if(div.className.indexOf('is-prefilled')==-1)
		div.className+=" is-prefilled";
	if(isArticle){
		if(document.getElementById('kb_field').style.display!="none")
			disableButton();
		document.getElementById('article_field').style.display="block";
		document.getElementById('kb_field').style.display="none";
	}
	else{
		if(document.getElementById('article_field').style.display!="none")
			disableButton();
		document.getElementById('article_field').style.display="none";
		document.getElementById('kb_field').style.display="block";
	}
}

function showResults(){
	var userId = gel('user').value;
	var isarticle = gel('articleChkbox').checked;
	var recordId;
	if(isarticle)
		recordId = gel('article').value;
	else
		recordId = gel('kb').value;
	
	window.location.href='/km_diagnostics.do?sysparam_user='+userId+'&sysparam_isarticle='+isarticle+'&sysparam_record='+recordId;
}
