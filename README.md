# nja-gen

An application for creating NJA or NJ files from OBJ.

## How to run

npm is required to run this project, if npm is installed:

1. npm run watch
2. npm run electron

# Current issues

## Output bugs

1. There is currently a bug that causes strip names in NJA output to display as "undefined". It's unknown what is causing this issue right now.
2. A bug will occur if an OBJ that uses materials ("usemtl" in obj) is loaded, this will stop the program from being able to write NJ files in that session.

To revert either of the above bugs, njaGen must be restarted.

## Optimize Strips bug

The program will hang if the Optimize Strips option is used on a larger OBJ model, while it will eventually continue, the time it takes to resume is exponential depending on the size of the OBJ file. It's not recommended to use this option of OBJ models over 100 verts.


