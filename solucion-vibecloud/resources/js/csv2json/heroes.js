const fs = require("fs")
process.chdir(__dirname)



if (process.argv[2] === undefined) {
    console.error("Usage: node heroes.js <input.csv>")
    process.exit(1)
}

const filename = process.argv[2]
console.log(filename)

const filetext = fs.readFileSync(filename).toString()
const allLines = filetext.split("\r\n")

const header = allLines[0]
const dataLines = allLines.slice(1)

const fieldNames = header.split(",")

let objList = []
for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i]
    const values = line.split(",")

    let obj = {}
    for (let i = 0; i < fieldNames.length; i++) {
        let obj = {}
        const data = dataLines[i].split(",")
        for (let j = 0; j < fieldNames.length; j++) {

            const fieldName = fieldNames[j].toLowerCase()
            obj[fieldName[j]] = data[j]

        }
        objList.push(obj)
    }

    const jsonText = JSON.stringify(objList, null, 2)
    const outputFilename = filename.replace(".csv", ".json")
    fs.writeFileSync(outputFilename, jsonText)

}
