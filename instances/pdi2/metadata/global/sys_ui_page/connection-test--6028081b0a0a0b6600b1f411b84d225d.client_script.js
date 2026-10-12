function runConnectionTest() {
        var loadingImg = "<img src='images/loading_anim2.gifx' width='16 height='16' alt='Loading...' >";
        gel('avg_time').innerHTML = loadingImg;
        gel('line_speed').innerHTML = loadingImg;
        gel('avg_speed').innerHTML = "";

        var ct = new ConnectionTest();
        ct.setRuns(6);
        ct.setComplete(calcSpeed);
        ct.run();
}

    function calcSpeed() {
        var results = this.getResults();
        var runCount = results.length;
        var totalRunTime = 0;
        var totalSize = 0;

        for(var i = 0; i != runCount; i++) {
            totalRunTime += parseInt(results[i].time);
            totalSize += parseInt(results[i].size);
        }

        var avgSize = parseInt(totalSize / runCount);
        var avgTime = parseInt(totalRunTime / runCount);
        var lineSpeed = ( avgSize * 8 / 1024 / ( avgTime / 1000 ) );

        if (lineSpeed > 1000)
            lineSpeed = "T1/Cable";
        else if (lineSpeed > 512)
            lineSpeed = "Fast DSL";
        else if (lineSpeed > 384)
            lineSpeed = "Standard DSL";
        else
            lineSpeed = "Slow connection";

        var dAvgTime = avgTime + "ms";
        if (avgTime > 1000) {
            dAvgTime = (avgTime / 1000) + "s";
        }

        gel('avg_time').innerHTML = dAvgTime + " (per 170k)";
        gel('line_speed').innerHTML = lineSpeed;
        gel('avg_speed').innerHTML = "(average download was " + parseInt( avgSize / 1024 / ( avgTime / 1000 )) + "K/s)";
    }
