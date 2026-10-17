/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	const firstName = api.context.session.user.firstName;
  const lastName = api.context.session.user.lastName;
  const language = api.context.session.user.language.toLowerCase();
  var honorificLanguageCodeArr = ["zh", "zh-ch", "zh-hk", "ja", "ja-jp"];
  if (honorificLanguageCodeArr.indexOf(language) > -1) {
    return `${lastName} ${firstName}`;
  } else {
    return firstName;
  }
}
