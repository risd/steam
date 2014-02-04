## Performance over poor connection

On OS X, packets can be managed with [ipfw][ipfw-man]

To enable:

    sudo ipfw add pipe 1 src-port http
    sudo ipfw pipe 1 config delay 200 bw 700kbit/s

To disable:
    
    sudo ipfw flush

[ipfw-man]:http://developer.apple.com/library/mac/documentation/Darwin/Reference/ManPages/man8/ipfw.8.html