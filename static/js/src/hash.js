module.exports = function hash () {
    // Facebook API redirects to the application with the
    // hash '#_=_'. Since the application does not scroll,
    // we don't need to store any state to place the user
    // back into. Just get rid of the silly hash.
    // http://stackoverflow.com/questions/7131909
    //       /facebook-callback-appends-to-return-url
    if (window.location.hash && window.location.hash == '#_=_') {
        if (window.history && history.pushState) {
            window.history.pushState("",
                                     document.title,
                                     window.location.pathname);
        }
    }
};