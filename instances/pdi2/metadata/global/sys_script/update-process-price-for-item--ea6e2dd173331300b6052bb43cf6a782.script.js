(function executeRule(current, previous) {
	
	var operation = current.operation();
	var gr = new GlideRecord('item_option_new');
	var curQues = current.getValue('question');
	var curPrice = current.getElement('misc').getCurrencyValue();
	var curRecPrice = current.getElement('rec_misc').getCurrencyValue();
	var curPricesZero = curPrice == '0' && curRecPrice == '0';
	if (operation == 'insert' || operation == 'delete') {
		if (curQues && !curPricesZero) {
			gr.get(curQues);
			GlideappProcessPriceUpdater.updateProcessPrice(gr);
		}
		
	} else {
		var preQues = previous.getValue('question');
		var prePrice = previous.getElement('misc').getCurrencyValue();
		var preRecPrice = previous.getElement('rec_misc').getCurrencyValue();
		var prePricesZero = prePrice == '0' && preRecPrice == '0';
		if (preQues && !curQues && !prePricesZero) {
			gr.get(preQues);
			GlideappProcessPriceUpdater.updateProcessPrice(gr);
		} else if (preQues && curQues) {
			if ((preQues == curQues) && (prePricesZero != curPricesZero)) {
				gr.get(curQues);
				GlideappProcessPriceUpdater.updateProcessPrice(gr);
			}
			if (preQues != curQues) {
				if (!prePricesZero) {
					gr.get(preQues);
					GlideappProcessPriceUpdater.updateProcessPrice(gr);
					gr = new GlideRecord('item_option_new');
				}
				if (!curPricesZero) {
					gr.get(curQues);
					GlideappProcessPriceUpdater.updateProcessPrice(gr);
				}
			}
			
		} else if (!preQues && curQues && !curPricesZero) {
			gr.get(curQues);
			GlideappProcessPriceUpdater.updateProcessPrice(gr);
		}
		
	}

})(current, previous);
