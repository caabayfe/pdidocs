var propValue = current.value;
var propName = current.name;

if(propName == "glide.ui.user_cookie.life_span_in_days")
	propValue = validateUserCookieLifeSpanInDays(propValue);
else if(propName == "glide.ui.user_cookie.max_life_span_in_days")
	propValue = validateUserCookieMaxLifeSpanInDays(propValue);

current.value = String(parseInt(propValue));

function validateUserCookieLifeSpanInDays(lifeSpan){
	if (lifeSpan == '' || isNaN(lifeSpan)) {
		gs.addInfoMessage(gs.getMessage("Invalid Cookie Life Span; replaced with default of 15 days"));
		return 15;
	} else if (lifeSpan < 1) {
		gs.addInfoMessage(gs.getMessage("Cookie Life Span cannot be less than a day; replaced with 1 day"));
		return 1;
	} else if (lifeSpan > 30) {
		gs.addInfoMessage(gs.getMessage("Cookie Life Span cannot be more than 30 days; replaced with 30 days"));
		return 30;
	}
	return lifeSpan;
}

function validateUserCookieMaxLifeSpanInDays(maxLifeSpan){
	if (maxLifeSpan == '' || isNaN(maxLifeSpan)) {
		gs.addInfoMessage(gs.getMessage("Invalid Cookie Max Life Span; replaced with default of 30 days"));
		return 30;
	} else if (maxLifeSpan < 1) {
		gs.addInfoMessage(gs.getMessage("Cookie Max Life Span cannot be less than a day; replaced with 1 day"));
		return 1;
	} else if (maxLifeSpan > 365) {
		gs.addInfoMessage(gs.getMessage("Cookie Max Life Span cannot be more than 365 days; replaced with 365 days"));
		return 365;
	}
	return maxLifeSpan;
}
