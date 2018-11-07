var bookList = document.getElementById("bookList");
var userName;
var userEmail;
var userImg;


function returnMain() {
    window.location = "main.html";
};

//Taking user info (auth)
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // User is signed in.
        userImg = user.photoURL;
        userName = user.displayName;
        userEmail = user.email;

        document.getElementById("photo").src = userImg;
        document.getElementById("name").innerHTML = userName;
        document.getElementById("email").innerHTML = userEmail;
    } else {
        //Redirect to login
        uid = null;
        window.location.replace("login.html");
    }
});


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

//RENT FUNCTION
var currentEdt = null;

function rentBook(bookId) {
    var rentData = {
        "user": userEmail,
        "date": Date.now()
    }

    firebase.database().ref("books").child(bookId).child("status").set(rentData);

    firebase.database().ref("books").child(bookId).child("history").once("value").then(function (snapshot) {
        var highestIndex = 0;
        snapshot.forEach(function (item) {
            var index = parseInt(item.key);
            if (index > highestIndex) {
                highestIndex = index;
            }
        });
        highestIndex++;
        firebase.database().ref("books").child(bookId).child("history").child(highestIndex).set(rentData);
    });
}

//EDIT BOOK FUNCTION
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


//CREATING ARRAY BOOKS FOR SEARCHBAR
var library = [];
var ids = [];
var x;
var y;

firebase.database().ref("books").once("value").then(function (snapshot) {
    snapshot.forEach(function (item) {
        library.push(item.val());
        ids.push(item.key);
    });
    y = library.length;
    console.log(y);
    
    for(x=0; x<y; x++) {
        createList(library[x], ids[x]);
    }
});

//FUNCTION SEARCHBAR
$("#searchBar").val("");
var searchBar = $("#searchBar");

searchBar.on("change", function () {
    bookList.innerHTML = " ";
    var searchVal = searchBar.val();
    var searchLength = searchVal.length;

    if(searchBar.val() == "") {
        for (x=0; x<y; x++) {
            createList(library[x], ids[x]);
        }
    }
    else {
        for (x=0; x<y; x++) {
            var bookTitle = library[x].data.title.substring(0, searchLength);
            if (bookTitle == searchVal) {
                createList(library[x], ids[x]);
            }
        }
    }
});

//FUNCTION CREATING LIST
function createList(book, id) {
    var li = document.createElement("li");
    var btn = document.createElement("button");
    var edtBtn = document.createElement("button");

    btn.setAttribute("id", id);
    btn.onclick = function () {
        if (book.status == "Available") {
            rentBook(id);
        } else {
            window.alert("Sorry, this book is currently rented.");
        }
    };

    edtBtn.setAttribute("id", id);
    edtBtn.onclick = function () {
        edtBook(id);
    };

    var nde = document.createTextNode("Rent");
    var node = document.createTextNode(book.data.title);
    var edtNode = document.createTextNode("Edit")

    edtBtn.appendChild(edtNode);
    btn.appendChild(nde);
    li.appendChild(node);
    li.appendChild(btn);
    li.appendChild(edtBtn);
    bookList.appendChild(li);
}


