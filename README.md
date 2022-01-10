# nja-gen

An application for creating NJA or NJ files from OBJ.

## How to run

npm is required to run this project, if npm is installed:

1. npm run watch
2. npm run electron

# Current issues

There is currently a bug that causes strip names in NJA output to display as "undefined". It's unknown what is causing this issue right now.

Another bug will occur if an OBJ that uses materials ("usemtl" in obj) is loaded, this will stop the program from being able to write NJ files in that session.

To revert either bug, njaGen must be restarted.
