let barScanner = null;

async function findBestCamera() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    let cams = [];

    for (var i = 0; i < devices.length; i++) {
        let device = devices[i];
        if (device.kind == "videoinput") {
            cams.push(device.deviceId);

            if (device.label.match(/back/) != null) {
                return device.deviceId;
            }
        }
    }

    return cams[cams.length - 1];
}

async function startScan() {
    $("#scan-loader").addClass("invisible");
    $("#scan-error").addClass("invisible");
    $("#scan-result").addClass("invisible");

    let modalObj = $("#modal-scanner");
    let modal = M.Modal.getInstance(modalObj[0]);
    modal.open();
    let w = Math.floor(Math.min(modalObj.width()));

    // TODO tune these settings ...
    let camera = await findBestCamera();
    let scanner = window.Quagga
        .decoder({ readers: ["ean_reader"] })
        .locator({ halfSample: false, patchSize: "large" })
        .fromSource({
            target: "#feed",
            constraints: {
                width: 600,
                height: 600,
                deviceId: camera
            }
        });
    scanner.addEventListener("detected", data => {
        fetchBook(data.codeResult.code);
        scanner.stop();
        barScanner = null;
        modal.close();
        $("#feed video").remove();
    });
    scanner.start();
    barScanner = scanner;
}

// TODO duplication with code from startScan
function onScannerModalClosed() {
    if (barScanner != null) {
        barScanner.stop();
        barScanner = null;
        $("#feed video").remove();
    }
}

function fetchBook(isbn) {
    $("#scan-loader").removeClass("invisible");

    axios.get("https://www.googleapis.com/books/v1/volumes?q=isbn:" + isbn)
        .then(({ data }) => {
            if (!data || data.totalItems == 0) {
                $("#scan-error .text").html("ISBN could not be scanned. Please try again!");
                $("#scan-error").removeClass("invisible");
                return;
            }

            renderBook(data.items[0].volumeInfo);
        })
        .catch(err => {
            console.error(err);
            $("#scan-error .text").html("An error occured, please try again!");
            $("#scan-error").removeClass("invisible");
        })
        .then(() => {
            $("#scan-loader").addClass("invisible");
        });
}

function renderBook(book) {
    $("#scan-result").removeClass("invisible");
    $("#scan-result").html(`
        <img src="${book.imageLinks.thumbnail}"><br>
        Title: ${book.title}<br>
        Sub-Title: ${book.subtitle}<br>
        Description: ${book.description}<br>
        Authors: ${book.authors ? book.authors.join(", ") : ""}<br>
        Categories: ${book.categories ? book.categories.join(", ") : ""}<br>
        Published Date: ${book.publishedDate}<br>
        Pages: ${book.pageCount}<br>
        Language: ${book.language}
    `);
}

$(document).ready(() => {
    M.Modal.init(document.querySelectorAll("#modal-scanner"), { onCloseEnd: onScannerModalClosed });
    $("#scan").on("click", startScan);
});