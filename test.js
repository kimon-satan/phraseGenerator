var fs = require('fs');

var phraseBook = {};
var output = "";

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});



// Plurals
phraseBook["PL"]= ["the people", "the wealthy", "the poor", "the strivers", "the successful", "the wretched", "men", "women", "rights", "priviledges"];

// Mass Nouns - people
phraseBook["MN1"]= ["the state", "hierarchy", "oligarchy", "everyone", "anyone", "nobody", "the individual", "the underclass", "the population" ];

// Mass Nouns - concepts
phraseBook["MN2"]= ["government", "wealth", "justice", "freedom", "truth", "equality"];

//Modal Verbs (MV)
phraseBook["MV"]= ["can", "can’t", "will", "will not", "must", "must not"];

//Verb (VO) ... verb with object
phraseBook["VO"]= ["accommodate", "support", "trust", "recognise", "protect", "restrict", "resist"];

//Verb (VO) ... verb without object
phraseBook["V"]= ["prevail", "rule", "decide"];

//Adv phrases (Adv)
phraseBook["Adv"]= ["without cause", "with good cause", "without compromise", "with reason", "in good faith"];

//recursive function to create sentences
function unpack(idx, tree, phrase)
{
	//straight down
	if(idx[0]< tree.length)
	{
		for(var count = 0; count < tree[idx[0]].length; count++)
		{
				var nphrase = phrase; //check this
				nphrase = phrase + " " + tree[idx[0]][count];
				//record the text into the dictionary
				output += nphrase + "\n";
				unpack([idx[0] + 1, count], tree, nphrase);
		}
	}
}

function buildTree(sentence)
{
	var tree = [];
	for(var i = 0; i < sentence.length; i++)
	{
		var line;
		if(typeof(sentence[i]) == "object")
		{
				var rline = buildTree(sentence[i]);
				line = [];
				for(var j = 0; j < rline.length; j++)
				{
					line = line.concat(rline[j]);
				}
		}
		else
		{

			//check for +
			var r = /(\w*)\+(\w*)/g;
			var res = r.exec(sentence[i]);
			var add = undefined;

			if(res != null)
			{
				var s = res[1];
				add = res[2];
			}
			else
			{
				var s = sentence[i];
			}

			if(phraseBook[s] != undefined)
			{
				line = phraseBook[s].slice();
			}
			else
			{
				line = [s];
			}

			if(add != undefined)
			{
				for(var j = 0; j < line.length; j++)
				{
					line[j] += add;
				}
			}

		}

		tree.push(line);
	}

	return tree;
}

var sentenceTypes = [
	[["MN1","MN2","PL"], "MV", ["VO", "V"]],
	[["MN1","MN2","PL"], "MV", ["VO", "V"], "Adv"],
	[["MN1","MN2","PL"], "MV", "VO", ["MN1","MN2","PL"], "Adv"],
	[["MN1","MN2","PL"], "V"],
	[["MN1","MN2","PL"], "VO", "Adv"],
	[["MN1","MN2","PL"], "VO", ["MN1","MN2","PL"], "Adv"],
	["MN2", "MV", "be", "VO", "by", ["MN1","MN2","PL"]]
];

//generating a whole lot of sentences - around 22000

// for(var i =0; i < sentenceTypes.length; i++)
// {
// 	var mTree = buildTree(sentenceTypes[i]);
// 	unpack([0,0],mTree, "");
// }

// fs.writeFile("output.txt", output, function(err)
// {
// 	if(err)
// 	{
// 			return console.log(err);
// 	}
//
// 	console.log("The file was saved!");
//
// });

//We're not using this right now

// var phraseMap =
// {
// 	"MN1" : ["MV", "V+s"],
// 	"MN2" : ["MV", "V+s"],
// 	"PL" : ["MV", "VO"],
// 	"VO" : ["Adv", "MN1", "MN2", "PL"],
// 	"Adv" : [],
// 	"PV" : ["by"],
// 	"MV": ["VO", "be"],
// 	"be": ["PV"],
// 	"by": ["MN1", "MN1", "MN2", "PL"]
// }


function nextChoice(idx, sStruct)
{
	var choice = [];

	var key = sStruct[idx];

	if(typeof(key) == "object")
	{
		key = choose(key);
		sStruct[idx] = key; // replace with just the single option
	}

	//we probably don't need this
	// rex = /(\w*)\+(\w*)/;
	// res = rex.exec(key);
	// if(res)
	// {
	// 	key = res[1]
	// }

	if(phraseBook[key] == undefined)
	{
		return key;
	}
	else
	{
		var words = phraseBook[key].slice();
	}

	for(var i = 0; i < 2; i++)
	{
		var word = choose(words);
		var idx = words.indexOf(word);
		words.splice(idx,1);
		// if(res)
		// {
		// 	word += res[2]
		// }
		choice.push(word);
	}

	return choice;
}

function choose(list)
{
	return list[Math.floor(Math.random() * list.length)];
}

function applyRules(idx, sStruct, choice)
{
	if(idx > 0)
	{
		if(sStruct[idx] == "VO")
		{
			if(sStruct[idx - 1] == "MN1" || sStruct[idx - 1] == "MN2")
			{
				choice[0] += "s";
				choice[1] += "s";
			}

			if(sStruct[idx - 1] == "be")
			{
				for(var i = 0; i < 2; i ++)
				{
					if(choice[i][choice[i].length -1] == "e")
					{
						choice[i] += "d"
					}
					else
					{
						choice[i] += "ed"
					}
				}
			}
		}
	}
}

function askChoice(sentence, idx, sStruct)
{
	return new Promise(function(resolve)
	{
		var choice = nextChoice(idx, sStruct);

		if(typeof(choice) == "string")
		{
			sentence += " " + choice;
			resolve([sentence,idx+1]);
		}
		else
		{
			//grammatical additions here
			applyRules(idx, sStruct, choice)

			var question = "1. " + sentence + " " + choice[0] + " or 2. " + sentence + " " + choice[1] + "\n";

			rl.question( question , (answer) =>
			{
				sentence += " " + choice[answer-1];
				resolve([sentence,idx+1]);
			});

		}

	});
}

var mStruct = choose(sentenceTypes);
mStruct = sentenceTypes[6];
mStruct = mStruct.slice(); // a copy
var promise = askChoice("", 0, mStruct);

for(var i = 1; i < mStruct.length; i++)
{
	promise = promise.then(function(data)
	{
		return askChoice(data[0], data[1], mStruct);
	});
}

// promise.then(function(data){
// 	console.log(data[0])
// 	rl.close();
// })
