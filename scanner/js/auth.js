var ui = new firebaseui.auth.AuthUI(firebase.auth());
var uid;

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // User is signed in.
        uid = user.uid;
        showContent(user);
    } else {
        // Redirect to login
        uid = null;
        showLogin();
    }
});

function showLogin() {
    var uiConfig = {
        callbacks: {
            signInSuccessWithAuthResult: function (authResult, redirectUrl) {
                // User successfully signed in.
                // Return type determines whether we continue the redirect automatically
                // or whether we leave that to developer to handle.
                return true;
            },
            uiShown: function () {
                // The widget is rendered.
                // Hide the loader.
                // TODO: document.getElementById('loader').style.display = 'none';
                $("#loader").addClass("invisible");
            }
        },
        signInSuccessUrl: 'index.html',
        signInOptions: [
            // Leave the lines as is for the providers you want to offer your users.
            firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        ]
    };

    ui.start('#firebaseui-auth-container', uiConfig);
    $("#login").removeClass("invisible");
}

function showContent(user) {
    $("#nav").addClass("logged-in");
    $("#content").removeClass("invisible");
    $("#loader").addClass("invisible");
    // TODO: document.getElementById("photo").src = user.photoURL;
    document.getElementById("name").innerHTML = user.displayName;
    document.getElementById("email").innerHTML = user.email;
}

function logOut() {
    firebase.auth().signOut();
}