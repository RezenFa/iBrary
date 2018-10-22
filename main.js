
var uid;

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        // User is signed in.
        uid = user.uid;
        document.getElementById("photo").src = user.photoURL;
        document.getElementById("name").innerHTML = user.displayName;
        document.getElementById("email").innerHTML = user.email;
    }
    else {
        //Redirect to login
        uid = null;
        window.location.replace("login.html");
    }
});
    
function logOut() {
    firebase.auth().signOut();
};


function returnMain() {
    window.location = "main.html";
};

