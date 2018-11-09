let userData = null;

firebase.initializeApp({
    apiKey: "AIzaSyB3488lHuvNcLJCNbcztWlOb4yMDazLphY",
    authDomain: "fir-books-caf87.firebaseapp.com",
    databaseURL: "https://fir-books-caf87.firebaseio.com",
    projectId: "fir-books-caf87",
    storageBucket: "fir-books-caf87.appspot.com",
    messagingSenderId: "198487303066"
});

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        userData = user;
        initContent();
        changePage("library");
    } else {
        userData = null;
        changePage("login");
    }
});

var ui = new firebaseui.auth.AuthUI(firebase.auth());
ui.start("#button-login", {
    signInSuccessUrl: "index.html",
    signInOptions: [firebase.auth.GoogleAuthProvider.PROVIDER_ID]
});