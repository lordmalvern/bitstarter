#!/usr/bin/node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development and basic DOM parsing.

References:

*/
var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var sys = require('util');
var rest = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";


var assertFileExists = function(infile) {
    var instr = infile.toString();
    if (!fs.existsSync(instr)){
	console.log("%s does not exist. Exiting.", instr);
	process.exit(1);
	}
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for (var ii in checks){
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
	}
    return out;
};

var clone = function(fn) {
    return fn.bind({});
};

if(require.main == module){
    program
    .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
    .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
    .option('-u, --url <url>', 'URL of HTML file')  
    .parse(process.argv);
    if(program.url){
	rest.get(program.url).on('complete', function(result){
	    if (result instanceof Error) {
		console.log("Error " + result.message);
		this.retry(5000);
		}
	    else
	    {
		var outfile = "tester.html";
		fs.writeFile(outfile, result, function(err){
		    if(err)
			throw err;
		    var check = checkHtmlFile(outfile, program.checks);
                    var out = JSON.stringify(check, null, 4);
                    console.log(out);
		});
	    }
	})
    }
    else{
    var checkJson = checkHtmlFile(program.file, program.checks);
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
    }
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
