$(document).ready(() => {
    $("#button-logout").on("click", () => firebase.auth().signOut().then(() => changePage("login")));
});

function changePage(name) {
    $(".page.active").removeClass("active");

    const page = $("#page-" + name);
    const title = page.data("title");

    page.addClass("active");
    $("#title").html(title);

    $("#status-bar, #navigation-bar").toggleClass("invisible", title.length == 0);
}

function initContent() {
    $(".fb-username").html(userData.displayName);
}