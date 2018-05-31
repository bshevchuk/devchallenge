const { dummyGenerator } = require('../test/_test_helper');

// CLI
if (process.argv.length >= 2) { // TODO add robust validation

  const countJudges = process.argv[2] ? parseInt(process.argv[2], 10) : 5;
  const countRanges = process.argv[3] ? parseInt(process.argv[3], 10) : null;
  console.log(`Generate ${countJudges} fake judges`);

  const genArgs = [countJudges];
  if (countRanges) {
    genArgs.push(countRanges)
  }

  dummyGenerator.apply(this, genArgs).then(() => {
    process.exit(0)
  }).catch(e => {
    console.error(e.stack);
    process.exit(-1)
  });
}
