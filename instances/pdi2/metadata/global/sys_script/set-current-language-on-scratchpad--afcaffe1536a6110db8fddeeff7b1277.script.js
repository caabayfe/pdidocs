function onDisplay() {
		// determine the user language
		// 		- first, try the user's language
		//		- second, the system's language
		//		- third, just use english

		// list of translations supported in /scripts/tiny_mce/langs
		var langsDefault = 'cs,de,en,es,fi,fr,fq,he,hu,it,ja,ko,nb,nl,pb,pl,pt,ru,sv,th,tr,zh,zt';
		var langs = gs.getProperty('glide.ui.html.editor.v5.languages', langsDefault);

		// Language strings that need to be converted for TinyMCE to load
		// This is so we can download new translations from TinyMCE without having to
		// modify those files to match our language strings
		var languageMap = {
			pb: 'pt_BR',
			zh: 'zh_CN',
			fr: 'fr_FR',
			fq: 'fr_FR',
			he: 'he_IL',
			hu: 'hu_HU',
			ko: 'ko_KR',
			nb: 'nb_NO',
			pt: 'pt_PT',
			sv: 'sv_SE',
			th: 'th_TH',
			zt: 'zh_TW'
		};

		var userLanguage = gs.getUser().getLanguage();
		if (!userLanguage || langs.indexOf(userLanguage) == -1)
			userLanguage = gs.getProperty('glide.sys.language');

		if (!userLanguage || langs.indexOf(userLanguage) == -1)
			userLanguage = 'en'; // if we don't have the language, fall back to english
		
		g_scratchpad.user_lang = (languageMap[userLanguage] || userLanguage);
}
onDisplay();
