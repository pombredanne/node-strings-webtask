const assert = require('chai').assert;
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const stringsUtil = require('../');

// A helper that converts our arrays into strings of the format
// that the `strings` tool outputs

// The output file ends with a newline, whereas
// our arr.join'd string won't.
// Apart from that, they should be identical
const arrToString = (stringsArray) =>
	  (stringsArray.join('\n') + '\n');
const filesPath = './test/fixtures/';

describe('stringsUtil', function() {
    describe('.getArrFromBuffer', function() {
	describe('defaultOpts', function() {
	    it('should find the string \'hurray\'', function() {
		const stringBuffer = Buffer.from('hurray!', 'ascii');
		const stringsArray = stringsUtil.getArrFromBuffer(stringBuffer);
		// There should be only one string: 'hurray!'
		assert.equal(stringsArray.length, 1);
		assert.equal('hurray!', stringsArray[0]);
	    });
	});

	describe('minChars=10', function() {
	    it('should find no strings in buffer', function() {
		const stringBuffer = Buffer.from('hurray!', 'ascii');
		const stringsArray = stringsUtil.getArrFromBuffer(
		    stringBuffer,
		    { minChars: 10 }
		);
		assert.equal(stringsArray.length, 0);
	    });
	});

	describe('isPrintableFn', function() {
	    it('should print only a\'s', function() {
		const stringBuffer = Buffer.from('laaaaaaame', 'ascii');
		const stringsArray = stringsUtil.getArrFromBuffer(
		    stringBuffer,
		    {
			minChars: 4,
			isPrintableFn: (charCode) =>
			    (String.fromCharCode(charCode) === 'a')
		    }
		);
		
		assert.equal(stringsArray.length, 1);
		assert.equal('aaaaaaa', stringsArray[0]);
	    });
	});
	
    });
    
    describe('.loadFromFile', function() {
	
	const binaryFilePath = filesPath + 'helloWorld';

	describe('defaultOpt', function() {
	    it('should print all strings in a file', function() {
		const getTextFileContents = fs.readFileAsync(filesPath + 'defaultOutput.txt', 'ascii');
		
		const getDefaultStrings = stringsUtil.loadFromFile(binaryFilePath).then(arrToString);
		
		return Promise.all([getTextFileContents, getDefaultStrings]).then(
		    function([fileText, stringsFromFile]) {
			assert.equal(fileText, stringsFromFile);
		    }
		);
	    });
	});

	describe('tenChar', function() {
	    it('should print strings > 10 chars', function() {
		const getTextFileContents = fs.readFileAsync(filesPath + 'tenChars.txt', 'ascii');
		
		const getTenCharStrings = stringsUtil.loadFromFile(binaryFilePath, { minChars: 10 }).then(arrToString);
		
		return Promise.all([getTextFileContents, getTenCharStrings]).then(
		    function([fileText, stringsFromFile]) {
			assert.equal(fileText, stringsFromFile);
		    }
		);
	    });
	});

    });

    describe('.loadFromUrl', function() {
	it('should print all strings from a URL', function() {
	    // Downloading the zip may take some time,
	    // so we'll allow up to 30s before we fail the test

	    // NOTE: This may fail sometimes because Github is rate-limiting us
	    // Trying again in a few seconds usually works.
	    this.timeout(30000);
	    
	    // We're printing all the strings in a zip file, which is
	    // actually very interesting to see after compression!
	    const zipUrl = 'http://raw.githubusercontent.com/AmaanC/node-strings-webtask/master/test/fixtures/test.zip';

	    const getTextFileContents = fs.readFileAsync(filesPath + 'zipOutput.txt', 'ascii');

	    const getStringsFromUrl = stringsUtil.loadFromUrl(zipUrl).then(arrToString);
	    return Promise.all([getTextFileContents, getStringsFromUrl]).then(
		function([fileText, stringsFromUrl]) {
		    assert.equal(fileText, stringsFromUrl);
		}
	    );
	});
    });

});
