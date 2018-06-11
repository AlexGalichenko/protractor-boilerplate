const xlsx = require("xlsx-populate");

class XlsxReporter {

    createSheets(data, outputPathXlsx) {

        xlsx.fromBlankAsync().then(workbook => {

            const FEATURE = "A";
            const NAME = "B";
            const TAGS = "C";
            const STATUS = "D";
            const PASSED = "J";
            const FAILED = "K";

            const blueBackgroundColor = "44a3ef";
            const redBackgroundColor = "ff7d79";
            const greenBackgroundColor = "65c7a3";

            const sheetNames = ["all_report", "failed_tests", "passed_tests"];

            sheetNames.forEach(name => {

                const sheet = workbook.addSheet(name);

                sheet.column(FEATURE).style({border: true});
                sheet.column(NAME).width(60).style({border: true});
                sheet.column(TAGS).width(30).style({border: true});
                sheet.column(STATUS).style({border: true});

                sheet.cell(FEATURE + 1).value("Feature").style({fill: blueBackgroundColor, bold: true});
                sheet.cell(NAME + 1).value("Name").style({fill: blueBackgroundColor, bold: true});
                sheet.cell(TAGS + 1).value("Tags").style({fill: blueBackgroundColor, bold: true});
                sheet.cell(STATUS + 1).value("Status").style({fill: blueBackgroundColor, bold: true});

                if (name === "all_report") {
                    sheet.cell(PASSED + 10).value("Passed").style({fill: greenBackgroundColor, bold: true, border: true});
                    sheet.cell(FAILED + 10).value("Failed").style({fill: redBackgroundColor, bold: true, border: true});

                    sheet.cell(PASSED + 11).value(data.filter(d => d.status === "passed").length.toString())
                        .style({bold: true, border: true});
                    sheet.cell(FAILED + 11).value(data.filter(d => d.status === "failed").length.toString())
                        .style({bold: true, border: true});

                }
            });

            const allSheet = workbook.sheet("all_report");
            const failedSheet = workbook.sheet("failed_tests");
            const passedSheet = workbook.sheet("passed_tests");

            data.forEach((element, i) => {
                const currI = i + 2;
                const statusColor = element.status === "failed" ? redBackgroundColor : greenBackgroundColor;

                allSheet.cell(FEATURE + currI).value(element.feature);
                allSheet.cell(NAME + currI).value(element.name);
                allSheet.cell(TAGS + currI).value(element.tags);
                allSheet.cell(STATUS + currI).style("fill", statusColor).value(element.status);
            });

            data.filter(e => e.status === "failed").forEach((element, i) => {
                const currI = i + 2;

                failedSheet.cell(FEATURE + currI).value(element.feature);
                failedSheet.cell(NAME + currI).value(element.name);
                failedSheet.cell(TAGS + currI).value(element.tags);
                failedSheet.cell(STATUS + currI).style("fill", redBackgroundColor).value(element.status);
            });

            data.filter(e => e.status !== "failed").forEach((element, i) => {
                const currI = i + 2;

                passedSheet.cell(FEATURE + currI).value(element.feature);
                passedSheet.cell(NAME + currI).value(element.name);
                passedSheet.cell(TAGS + currI).value(element.tags);
                passedSheet.cell(STATUS + currI).style("fill", greenBackgroundColor).value(element.status);
            });

            workbook.deleteSheet("Sheet1");

            return workbook.toFileAsync(outputPathXlsx);
        })
    }
}

module.exports = XlsxReporter;