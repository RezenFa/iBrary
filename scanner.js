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
    $("#scan").css("display", "none");
    $("#output").html("");

    let camera = await findBestCamera();
    let scanner = window.Quagga
        .decoder({ readers: ["ean_reader"] })
        .locator({ patchSize: "medium" })
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
        $("#scan").css("display", "block");
        $("#feed video").remove();
    });
    scanner.start();
}

function fetchBook(isbn) {
    axios.get("https://www.googleapis.com/books/v1/volumes?q=isbn:" + isbn)
        .then(({data}) => {
            if (!data || data.totalItems == 0) {
                $("#output").html("Invalid ISBN");
                return;
            }

            renderBook(data.items[0].volumeInfo);
        })
        .catch(err => alert(err));
}

function renderBook(book) {
    $("#output").html(`
        Title: ${book.title}<br>
        Sub-Title: ${book.subtitle}<br>
        Description: ${book.description}<br>
        Authors: ${book.authors ? book.authors.join(", ") : ""}<br>
        Categories: ${book.categories ? book.categories.join(", ") : ""}<br>
        Published Date: ${book.publishedDate}<br>
        Pages: ${book.pageCount}<br>
        Language: ${book.language}<br>
        <img src="${book.imageLinks.thumbnail}">
    `);
}

$(document).ready(() => {
    $("#scan").on("click", startScan);
});