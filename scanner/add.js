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
        uid = user.uid;
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
        firebase.database().ref("books").child(category + highestIndex).set(data);
    });
}

//Real-time database - ALL BOOKS LIST
firebase.database().ref("books").on("value", function (snapshot) {
    bookList.innerHTML = " ";
    snapshot.forEach(function (item) {
        var li = document.createElement("li");
        var btn = document.createElement("button");
        btn.setAttribute("id", item.val().data.title);
        var nde = document.createTextNode("Rent");
        var node = document.createTextNode(item.val().data.title);
        btn.appendChild(nde);
        li.appendChild(node);
        li.appendChild(btn);
        bookList.appendChild(li);
    });
});

