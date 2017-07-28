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

//Verb (V)
phraseBook["V"]= ["accommodate", "support", "trust", "recognise", "protect", "restrict", "resist"];

//PastVerb (PV)
phraseBook["PV"]= ["accommodated", "supported", "trusted", "recognised", "punished", "protected", "restricted", "resisted"];

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
	[["MN1","MN2","PL"], "MV", "V"],
	[["MN1","MN2","PL"], "MV", "V", "Adv"],
	[["MN1","MN2","PL"], "MV", "V", ["MN1","MN2","PL"], "Adv"],
	[["MN1","MN2"], "V+s"], //this looks wrong
	[["MN1","MN2"], "V+s", "Adv"],
	[["MN1","MN2"], "V+s", ["MN1","MN2","PL"], "Adv"],
	["MN2", "MV", "be", "PV", "by", ["MN1","MN2","PL"]]
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

//sentences on the fly

var phraseMap =
{
	"MN1" : ["MV", "V+s"],
	"MN2" : ["MV", "V+s"],
	"PL" : ["MV", "V"],
	"V" : ["Adv", "MN1", "MN2", "PL"],
	"Adv" : [],
	"PV" : ["by"],
	"MV": ["V", "be"],
	"be": ["PV"],
	"by": ["MN1", "MN1", "MN2", "PL"]
}

function nextChoice(prevkey){

	var choice = [];
	var keys = phraseMap[prevkey];
	if(keys.length < 1)
	{
		return false;
	}

	for(var i = 0; i < 2; i++)
	{
		var o = {};
		o.key = choose(keys);
		if(phraseBook[o.key] == undefined)
		{
			o.word = o.key;
		}
		else
		{
			o.word = choose(phraseBook[o.key]);
		}

		choice.push(o);
	}

	//TODO deal with duplicates
	return choice;
}

function choose(list)
{
	return list[Math.floor(Math.random() * list.length)];
}

//NB. this leads to incoherent choices.

function askChoice(choice)
{
	var question = sentence + " ... 1. " + choice[0].word + " or 2. " + choice[1].word + "\n";

	rl.question( question , (answer) => {

		sentence += " " + choice[answer-1].word;
		var c = nextChoice(choice[answer-1].key);
		if(!c)
		{
			rl.pause();
			return;
		}
		else
		{
			askChoice(c);
		}

	});
}


var ckey = choose(["MN1","MN2","PL"]);
var sentence = choose(phraseBook[ckey]);
var mChoice = nextChoice(ckey);
askChoice(mChoice);