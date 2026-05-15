// lighthouserc.cjs
// Lighthouse CI configuration for motion effects performance audit.
//
// Prerequisites: the dev/preview server must be running at http://localhost:4321/deep-dive-vm/
// Run with: npm run test:perf  (which invokes: lhci autorun)
//
// Assertions:
//   - Cumulative Layout Shift (CLS) <= 0.1
//   - Total Blocking Time (TBT) < 50ms

module.exports = {
  ci: {
    collect: {
      url: ["http://localhost:4321/deep-dive-vm/"],
      numberOfRuns: 1,
    },
    assert: {
      assertions: {
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
        "total-blocking-time": ["error", { maxNumericValue: 50 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
