var uid;
var userName;
var userEmail;
var userImg;

//taking user info after login
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // User is signed in.
        uid = user.uid;
        userImg = user.photoURL;
        userName = user.displayName;
        userEmail = user.email;
        
        document.getElementById("photo").src = user.photoURL;
        document.getElementById("name").innerHTML = user.displayName;
        document.getElementById("email").innerHTML = user.email;
    } else {
        //Redirect to login
        uid = null;
        window.location.replace("login.html");
    }
});


function logOut() {
    firebase.auth().signOut();
};

function addPage() {
    window.location = "add.html";
};


function returnMain() {
    window.location = "main.html";
};

firebase.database().ref("books").on("value", function (snapshot) {
    $("#rentedBooks").html("");
    snapshot.forEach(function (item) {
        if (item.val().status.user != userEmail) return;
        $("#rentedBooks").append(`
            <li>
                ${item.val().data.title}
                <button onclick="returnBook('${item.key}')">Return</button>
            </li>
        `);


    });
});

function returnBook(bookId) {
    firebase.database().ref("books").child(bookId).child("status").set("Available");
}