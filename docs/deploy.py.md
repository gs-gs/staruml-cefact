# deploy.py

deploy.py file is used to deploy our extension project working directory changes to StarUML extensions folder.

- StarUML extension folder path
	-   MacOS: `~/Library/Application Support/StarUML/extensions/user`    
    -   Windows: `C:\Users\<user>\AppData\Roaming\StarUML\extensions\user`    
    -   Linux: `~/.config/StarUML/extensions/user`
    
- Requirement & Setup before we use deploy.py file
	
	- This file is based on [python](https://www.python.org/) 
	- If pythone is not install in System, Setup python from [here](https://www.python.org/downloads/)
	- Once setup is done. Open deploy.py and change path as described below.
	- Add path of your extension directory based on OS (MacOS, Windows, Linux) in function **shutil.rmtree('ADD_YOUR_PATH_HERE')**
	- For example, Based on Linux system,
	       shutil.rmtree('/home/\<user\>/.config/StarUML/extensions/user/gs-gs.staruml-cefact')
	       
	- Replace **source** & **destination** path 
	
		**source** : source path is where your project working directory. (e.g. /home/\<user\>/Faizan-Vahevaria/StarUML/staruml-cefact/
	
		**destination** : destination path is where your code changes will copy to your extension directory. (e.g. /home/\<user\>/.config/StarUML/extensions/user/gs-gs.staruml-cefact/
			    
	- Now execute deploy.py file from the project root directory (e.g. python deploy.py
	
	- Now refresh StarUML or (CTRL+R) to reflact changes in StarUML