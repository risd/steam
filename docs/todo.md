### left off

- clicking multiple clusters
    - should only be a queue of one thing being searched for on the server
        - click to show network, change number to "..." or another icon that says fetching/processing/waiting
        - have network module manage this. if an .init function is called, stash that id as the "active" network. 
            - clear on network.remove().
            - if there is an "active" network when a request comes through, cancel the other ajax request, and 
                - xhr.abort()
        - close the network graph, and restore the icon count to the span

-modalflow
    - go through a clean sign up.

- push state? how does the back button work through all of this?
    - http://programming.oreilly.com/2014/01/pushstate-to-the-future-progressive-enhancement-using-html5-pushstate-at-twitter.html

    - consider for:
        - current network being shown? go back between them?

        - most of the application is a single state. you are logged in, you can log out. you are looking at a network, you can close it. you aren't flipping through a bunch of lists.

@babette, ask about what kind of links you want to send out?
    - WA state? WA 8th district? both?

@micah, work-in profile selections
    - white inside, color outside?
    - color inside, color outside?
    - color inside, white outside?
    - white inside, white outside?