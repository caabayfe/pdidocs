function include({imports}) { 
    let benchmarksUtilsSNC = imports['sn_benchmarks.BenchmarksUtilsSNC']();
    class BenchmarksUtils extends benchmarksUtilsSNC {
    }
    return BenchmarksUtils;
}
