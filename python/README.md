To use `parse_house_pdf.py`, you must have `pdfplumber` installed in your python environment.
Instructions for installing it are below.

# Installation
In your virtual environment (or your root environment if you're a cowboy) run:
```
pip install -r requirements.txt
```
to install all the modules required for this program to work.

## Python Virtual environment
It's best practice to create a python virtual environment for installing a project's python modules.
You can create a python virtual environment like so:
```
python -m venv my-environment
```
The author recommends that the python virtual environment be created in your home directory under a
folder named `venv`. So, on windows:
```
C:\Users\you>md venv
C:\Users\you>python -m venv .\venv\my-env
```
Unix like:
```
$ mkdir ~/venv
$ python3 -m venv ~/venv/my-env
```
You may activate them like so:
Windows:
```
C:\Users\you>.\venv\my-env\Scripts\activate
```
Unix like:
```
$ . ./venv/bin/activate
```

After your virtual environment is activated, you may install python modules without
worrying about conflicts with other projects.
