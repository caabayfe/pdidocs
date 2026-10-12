var grCard = new GlideRecord('vtb_card');
grCard.addQueryString('removed=false^label_1=true^ORlabel_2=true^ORlabel_3=true^ORlabel_4=true^ORlabel_5=true^ORlabel_6=true^ORlabel_7=true', true);
grCard.query();
var labelsCount = new Array(7);
while(grCard.next()) {
	var count = 0;
	for (var i=1; i<=7; i++) {
		if (grCard.getValue('label_' + i) == '1')
			count++;
	}

	if (count > 0) {
		if (!labelsCount[count-1]) labelsCount[count-1] = [];
		labelsCount[count-1].push(grCard.getUniqueValue());
	}
}

var chunkSize = 1000;

for (var l=0; l<7; l++) {
	if (!labelsCount[l]) continue;
	for (j=0; j<labelsCount[l].length; j+=chunkSize) {
		grCard = new GlideRecord('vtb_card');
		var endIndex = Math.min(labelsCount[l].length, j+chunkSize);
		grCard.addQuery('sys_id', 'IN', labelsCount[l].slice(j, endIndex));
		grCard.setValue('labels_count', l+1);
		grCard.updateMultiple();
	}
}
