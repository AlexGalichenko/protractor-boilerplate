const xlsx = require("xlsx-populate");

class XlsxReporter {

    createSheet(data, outputPathXlsx) {

        xlsx.fromBlankAsync().then(workbook => {

            const FEATURE = "A";
            const NAME = "B";
            const TAGS = "C";
            const STATUS = "D";
            const blueBackgroundColor = "44a3ef";
            const redBackgroundColor = "ff7d79";
            const greenBackgroundColor = "65c7a3";

            const sheet = workbook.addSheet("all_report");

            sheet.column(FEATURE).style({border: true});
            sheet.column(NAME).width(60).style({border: true});
            sheet.column(TAGS).width(30).style({border: true});
            sheet.column(STATUS).style({border: true});

            sheet.cell(FEATURE + 1).value("Feature").style({fill: blueBackgroundColor, bold: true});
            sheet.cell(NAME + 1).value("Name").style({fill: blueBackgroundColor, bold: true});
            sheet.cell(TAGS + 1).value("Tags").style({fill: blueBackgroundColor, bold: true});
            sheet.cell(STATUS + 1).value("Status").style({fill: blueBackgroundColor, bold: true});

            workbook.deleteSheet("Sheet1");

            data.forEach((element, i) => {
                const currI = i + 2;
                const statusColor = element.status === "failed" ? redBackgroundColor : greenBackgroundColor;

                sheet.cell(FEATURE + currI).value(element.feature);
                sheet.cell(NAME + currI).value(element.name);
                sheet.cell(TAGS + currI).value(element.tags);
                sheet.cell(STATUS + currI).style("fill", statusColor).value(element.status);
            });

            return workbook.toFileAsync(outputPathXlsx);
        })
    }
}

module.exports = XlsxReporter;