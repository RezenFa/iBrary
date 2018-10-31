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
            if(item.key.indexOf(category) == 0) {
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

//Real-time database - ALL BOOKS LIST
firebase.database().ref("books").on("value", function (snapshot) {
    bookList.innerHTML = " ";
    snapshot.forEach(function (item) {
        var li = document.createElement("li");
        var btn = document.createElement("button");
        var edtBtn = document.createElement("button");

        btn.setAttribute("id", item.key);
        btn.setAttribute("type", "button");
        btn.onclick = function() {
            if (item.val().status == "Available"){
                rentBook(item.key);
            }
            else {
                window.alert("Sorry, this book is currently rented.");
            }
        };

        edtBtn.setAttribute("id", item.key);
        edtBtn.onclick = function(){
            edtBook(item.key);
        };

        var nde = document.createTextNode("Rent");
        var node = document.createTextNode(item.val().data.title);
        var edtNode = document.createTextNode("Edit")

        edtBtn.appendChild(edtNode);
        btn.appendChild(nde);
        li.appendChild(node);
        li.appendChild(btn);
        li.appendChild(edtBtn);
        bookList.appendChild(li);
    });
});

//Rent function
var rentBtn = $("#SE1");
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

function edtBook(bookId) {
    firebase.database().ref("books").child(bookId).once("value").then(function (book){
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

function remove() {
    firebase.database().ref("books").child(currentEdt).remove().then(cancel);
}
