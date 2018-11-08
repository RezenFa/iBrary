//CREATING ARRAY BOOKS FOR SEARCHBAR
var library = [];

firebase.database().ref("books").once("value").then(function (snapshot) {
    snapshot.forEach(function (item) {
        var book = item.val();
        book.id = item.key;
        library.push(book);
    });
    
    for(var x=0; x<library.length; x++) {
        createList(library[x]);
    }
});

//FUNCTION CREATING LIST
function createList(book) {

    btn.setAttribute("id", book.id);
    btn.onclick = function () {
        if (book.status == "Available") {
            rentBook(book.id);
        } else {
            window.alert("Sorry, this book is currently rented.");
        }
    };

    $("#page-library").html("");
    library.forEach(function (book, index) {
        $("#page-library").append(`
            <li>
                ${book.data.title}
                <button onclick="rentBook(library[${index}])">Return</button>
            </li>
        `);


    });
}

//FUNCTION SEARCHBAR
$("#searchBar").val("");
var searchBar = $("#searchBar");

searchBar.on("change", function () {
    bookList.innerHTML = " ";
    var searchVal = searchBar.val();
    var searchLength = searchVal.length;

    if(searchBar.val() == "") {
        for (var x=0; x<library.length; x++) {
            createList(library[x]);
        }
    }
    else {
        for (var x=0; x<library.length; x++) {
            var bookTitle = library[x].data.title.substring(0, searchLength);
            if (bookTitle == searchVal) {
                createList(library[x]);
            }
        }
    }
});




