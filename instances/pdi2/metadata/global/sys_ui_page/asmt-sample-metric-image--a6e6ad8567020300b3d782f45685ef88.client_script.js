$j(function() {
	if ($j("div#sample_assessment").length <= 0)
		return;
	html2canvas($j("div#sample_assessment")[0], { scale : 0.8 })
		.then(function(canvas) {
			var metricId = $j("input#sample_assessment_metric_id").val();
			var blobBin = atob(canvas.toDataURL("image/png").split(',')[1]);
			var array = [];
			for(var i = 0; i < blobBin.length; i++)
				array.push(blobBin.charCodeAt(i));
			var file = new Blob([new Uint8Array(array)], {type: 'image/png'});
			var formdata = new FormData(document.getElementById("sample_assessment_attachment_form"));
			formdata.append("sample_metric_image", file, "sample_metric_image_" + metricId + ".png");
			$j.ajax({
				url: "sys_attachment.do",
				type: "POST",
				data: formdata,
				processData: false,
				contentType: false
			}).done(function(respond) {
				$j("div#sample_assessment_ok_button").show();
			});
		});
});
