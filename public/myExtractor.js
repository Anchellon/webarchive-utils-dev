const input = document.getElementById("file");
const txtlink = document.getElementById("txtlink");
const status = document.getElementById("status");
const output = document.getElementById("output");
const wbmurl = document.getElementById("wbmurl");
const linkRe = new RegExp("https?://[^\\s'\"><]+\\.[^\\s'\"><]+", "ig");

// Plan is to replace all line feeds with `
// write a regex that handles the appearnce of the above tag in a http string
// https://github.com/metachris/pdfx/blob/master/pdfx/extractor.py Using this file as a base ref

// right now the edge cases still to be solved are
// 1. the link is broken into multiple lines
// (easy fix -> // Find first ` and last `  then  remove any other ` in between these two array indexes)

const convertToParsableIR = async (data) => {
    let links = new Set();
    const pdf = await pdfjsLib.getDocument(data).promise;
    // for (let i = 1; i <= pdf.numPages; i++) {
    // let page = await pdf.getPage(i);
    // Currently works on a signle page
    // add a for loop if you want to scan entire pdf
    let page = await pdf.getPage(2);
    const tokenizedText = await page.getTextContent();

    const pageText = tokenizedText.items
        .map((token) => {
            if (token.hasEOL) {
                // https://stackoverflow.com/questions/1547899/which-characters-make-a-url-invalid
                return "`"; // ` back ticks are not valid character in url strings
            } else {
                return token.str;
            }
        })
        .join("");
    return pageText;
};
const getLinksFromParseableIR = (textIR) => {
    let links = textIR
        .split(" ")
        .filter((l) => l && (l.match(new RegExp(".*`.*")) || l.match(linkRe)))
        .filter((l) => l && l.match(linkRe))
        .map((l) => {
            // Find first `
            let firstIx = l.indexOf("`");
            // Find Last `
            let lastIx = l.lastIndexOf("`");
            // Take substring
            l = l.substring(firstIx + 1, lastIx);
            // Remove any `
            l = l.replaceAll("`", "");
            return l;
        });
    return links;
};
const fileSelectHandler = async (e) => {
    const f = e.target.files[0];
    if (f.type != "application/pdf") {
        output.innerText = "Please select a PDF file!";

        return;
    }
    output.innerText = "Processing PDF...";
    /* 
    Steps to read through the contents of the file that has been uploaded 
    1. Create a new file reader instance
    2. Use the reader to read the file
    2. Execute code on read.load ie this code is executed once the reader.result is available
    3. Access the resulting bytes from reader.result and then  process further
    */
    const reader = new FileReader();
    reader.readAsArrayBuffer(f);
    reader.onload = async () => {
        // const file = new Uint8Array(reader.result);

        let parseableText = await convertToParsableIR(
            new Uint8Array(reader.result)
        );
        let links = getLinksFromParseableIR(parseableText);
        console.log(links);
    };
};
input.addEventListener("change", fileSelectHandler, false);
