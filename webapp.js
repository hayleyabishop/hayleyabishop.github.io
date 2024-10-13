

inputChords = ["C", "F#", "G"];
console.log("Input Chords: \n" + inputChords);



const chords = ["A","A# / Bb", "B", "C", "C# / Db", "D", "D# / Eb", "E", "F", "F# / Gb", "G", "G# / Ab"];
const autoharpChords = ["A", "A# / Bb", "B", "C", "D", "D# / Eb", "E", "F", "G", "G# / Ab"];
autoharpIntervals = [];

intervals = [];
//Find the input chords' relationship to one another. 
//Transpose that relationship by finding other chords in the autoharpChords list 
//that have the same relationship. 
//TODO: find the relationships between the autoharp chords. 

for (let i in autoharpChords){
 
    autoharpIntervals.push(chords.indexOf(autoharpChords[i]));

}
console.log("\nAutoharp Chord Intervals: \n" + autoharpIntervals)

for (let i in inputChords){
    //
    intervals.push(chords.indexOf(inputChords[i]));
    // console.log(intervals)
}

intervals = intervals.map(element => element - intervals[0]);

matches = [];

console.log("\nInput Chord Intervals: \n" + intervals);

console.log()

for(i=0;Math.max(...intervals)<12;i++){
    // console.log(intervals)
    foundIntervals = intervals.filter((interval) => autoharpIntervals.includes(interval));
    // console.log(foundIntervals)
    if (foundIntervals.length==intervals.length){
        matches.push(foundIntervals);
    }
    intervals=intervals.map(element => element+1);
}
console.log("\nFound the following chord intervals: \n")
    console.log(matches)

// foundIntervals = intervals.filter((interval) => autoharpIntervals.includes(interval));

// console.log(intervals.filter((interval) => autoharpIntervals.includes(interval)))


console.log("\n\nI found the following matches: \n")

console.log(matches.map(match => match.map(index=>chords[index])))

// for(i in chords)
//     console.log(`<option value="${chords[i]}">${chords[i]}</option>`)
