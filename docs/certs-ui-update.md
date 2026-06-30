I want us to tweak and refine the certs UI, specifically /resources/certs/(any-cert)

Take the current design of the plain /resources/ page. Notice how it is a color-coded file tree. Let's implement something similar in the left tree/div of /certs/any.

IN addition, let's remove the --- and small '|' that surround the right side (actual content). Let's replace it with the same color, but a solid line. Also ensure it fits the native resolution of the iframe, since currently it is slightly taller than necessary. I want it to perfectly align/outline the content, no matter the viewing size of the browser.
