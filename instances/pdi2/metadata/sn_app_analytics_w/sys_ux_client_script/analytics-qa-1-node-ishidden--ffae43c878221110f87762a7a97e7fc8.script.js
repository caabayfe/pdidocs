
			/**
  * @param {params} params
  * @param {api} params.api
  * @param {any} params.imports
  */
function evaluateProperty({api}) {
  // Hide Analytics Q and A if the user session is not in a language supported by the NLQ Parser.
  // NLQ Parser currently supports English, German, French, Spanish and Japanese.
	return ['en', 'de', 'fr', 'es', 'ja'].indexOf(api.context.session.user.language) < 0;
}
