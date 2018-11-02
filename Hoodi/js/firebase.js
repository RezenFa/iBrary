var config = {
    apiKey: "AIzaSyB3488lHuvNcLJCNbcztWlOb4yMDazLphY",
    authDomain: "fir-books-caf87.firebaseapp.com",
    databaseURL: "https://fir-books-caf87.firebaseio.com",
    projectId: "fir-books-caf87",
    storageBucket: "fir-books-caf87.appspot.com",
    messagingSenderId: "198487303066"
};

firebase.initializeApp(config);

var ui = new firebaseui.auth.AuthUI(firebase.auth());

var uiConfig = {
    callbacks: {
        signInSuccessWithAuthResult: function (authResult, redirectUrl) {
            return true;
        },
        uiShown: function () {
            document.getElementById('loader').style.display = 'none';
        }
    },

    signInSuccessUrl: 'main.html',
    signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    ]
};

ui.start('#firebaseui-auth-container', uiConfig);