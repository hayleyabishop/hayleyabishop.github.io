//Event listeners

function calculateResultingChords(inputChords) {
  const chords = ["A","A# / Bb", "B", "C", "C# / Db", "D", "D# / Eb", "E", "F", "F# / Gb", "G", "G# / Ab"];
  const autoharpChords = ["A", "A# / Bb", "B", "C", "D", "D# / Eb", "E", "F", "G", "G# / Ab"];
  const autoharpChords21 = ["A","A7","Ab","Am","B7","Bb","Bb7","C","C7","Cm","D","D7","Dm","E7","Eb","Em","F","F7","G","G7","Gm"];
  
let autoharpIntervals = [];

let intervals = [];
//Find the input chords' relationship to one another. 
//Transpose that relationship by finding other chords in the autoharpChords list 
//that have the same relationship. 
console.log("Input Chords: \n" + inputChords);

  for (let i in autoharpChords){
    autoharpIntervals.push(chords.indexOf(autoharpChords[i]));
  }
console.log("\n Available Autoharp Chords Index: \n" + autoharpIntervals)

//Available Autoharp Chords Index: 0,1,2,3,5,6,7,8,10,11

  for (let i in inputChords){
    intervals.push(chords.indexOf(inputChords[i]));
    console.log(intervals)
  }

//Subtract smallest chord number from all elements, to find lowest common denominator of intervals.
  intervals = intervals.map(element => element - intervals[0]); 
  let matches = [];

console.log("\nInput Chord Intervals: \n" + intervals);

for(i=0;Math.max(...intervals)<12;i++){ //Try looking for all 3 items in the autoharp set; try again, going up by a half note, until the largest interval is 12.

    //Use .filter() to find and save a match if the interval exists in autoharpintervals.
    foundIntervals = intervals.filter((e) => autoharpIntervals.includes(e));

    //If all intervals are present, save this set as a match.
    if (foundIntervals.length == intervals.length){
      matches.push(foundIntervals);
    }
    intervals=intervals.map(element => element+1);
  }

  // Convert the index numbers in matches to the actual chord names.
  let chordMatches = matches.map(match => match.map(index=>chords[index]))

//Print each chord grouping, no matter how many matches there are.
for (const match of matches) {
    console.log(match);
}
return chordMatches;
}
// foundIntervals = intervals.filter((interval) => autoharpIntervals.includes(interval));
// console.log(intervals.filter((interval) => autoharpIntervals.includes(interval)))
const resultingChords = calculateResultingChords(inputChords);

console.log("\n\nI found the following matches: \n")
for (const match of resultingChords) {
    console.log(match);
}

console.log("Complete.")
// for(i in chords)
//     console.log(`<option value="${chords[i]}">${chords[i]}</option>`)
