$("#isbn").on("change", function () {
    var isbn = $(this).val().replace(/-/g, "").trim();
    $(this).val(isbn);
    axios.get("https://www.googleapis.com/books/v1/volumes?q=isbn:" + isbn)
        .then(({
            data
        }) => {
            if (!data || data.totalItems == 0) {
                return;
            }
            var book = data.items[0].volumeInfo;

            $("#title").val(book.title);
            $("#authors").val(book.authors ? book.authors.join(", ") : "");
            $("#publishedDate").val(book.publishedDate);
            $("#pages").val(book.pageCount);
            $("#language").val(book.language);
            $("#desctiption").val(book.description);
            $("#bookImg").attr("src", book.imageLinks.thumbnail);

        })
        .catch(err => {
            console.error(err);
        })
});

//ADD BOOK FUNCTION
function create() {
    var data = {
        "createdBy": userEmail,
        "createdAt": Date.now(),
        "status": "Available",
        "data": {
            "isbn": $("#isbn").val(),
            "title": $("#title").val(),
            "description": $("#description").val(),
            "authors": $("#authors").val(),
            "publishedDate": $("#publishedDate").val(),
            "pages": $("#pages").val(),
            "language": $("#language").val(),
            "image": $("#bookImg").attr("src")
        },
    };

    var category = $("#category").val();

    //Real-time database - ALL BOOKS LIST
    firebase.database().ref("books").once("value").then(function (snapshot) {
        var highestIndex = 0;
        snapshot.forEach(function (item) {
            if (item.key.indexOf(category) == 0) {
                var index = parseInt(item.key.split(category)[1]);
                if (index > highestIndex) {
                    highestIndex = index;
                }
            }
        });
        highestIndex++;
        firebase.database().ref("books").child(category + highestIndex).set(data).then(cancel);
        window.alert("Please write down on the book: Book id = " + category + highestIndex);
    });
}

//EDIT BOOK FUNCTION
//RENT FUNCTION
var currentEdt = null;

function edtBook(bookId) {
    firebase.database().ref("books").child(bookId).once("value").then(function (book) {
        currentEdt = bookId;
        book = book.val().data;
        $("#isbn").val(book.isbn);
        $("#title").val(book.title);
        $("#authors").val(book.authors)
        $("#publishedDate").val(book.publishedDate);
        $("#pages").val(book.pages);
        $("#language").val(book.language);
        $("#desctiption").val(book.description);
        $("#bookImg").attr("src", book.image);

        $("#addBtn, #category").css("display", "none");
        $("#saveBtn, #cancelBtn, #removeBtn").css("display", "inline-block");

        $("#bookId").html(bookId);
    });
}

//SAVE BUTTON
function save() {
    var data = {
        "data": {
            "isbn": $("#isbn").val(),
            "title": $("#title").val(),
            "description": $("#description").val(),
            "authors": $("#authors").val(),
            "publishedDate": $("#publishedDate").val(),
            "pages": $("#pages").val(),
            "language": $("#language").val(),
            "image": $("#bookImg").attr("src")
        },
    };

    firebase.database().ref("books").child(currentEdt).update(data).then(cancel);
}

//CANCEL BUTTON
function cancel() {
    $("#isbn").val("");
    $("#title").val("");
    $("#authors").val("")
    $("#publishedDate").val("")
    $("#pages").val("");
    $("#language").val("");
    $("#desctiption").val("");
    $("#bookImg").attr("src", "");
    $("#bookId").html("");

    $("#addBtn, #category").css("display", "inline-block");
    $("#saveBtn, #cancelBtn, #removeBtn").css("display", "none");

    currentEdt = null;
}

//REMOVE BUTTON
function remove() {
    firebase.database().ref("books").child(currentEdt).remove().then(cancel);
}