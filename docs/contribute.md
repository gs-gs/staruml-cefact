# Guide developer how to contribute

-	**How to Contribute**
	-	Fork this repository
	
		- Fork this repository by clicking on the fork button on the top of [this](https://github.com/gs-gs/staruml-cefact) page. This will create a copy of this repository in your account.

	-	Clone the repository

		 - Now clone the forked repository to your machine. Go [GitHub account](https://github.com/gs-gs/staruml-cefact), open the forked repository, click on the clone button and then click the  _copy to clipboard_  icon.

		- Open a terminal and run the following git command:
			```
			git clone "url you just copied"
			```

			where "url you just copied" (without the quote marks) is the url to [this repository](https://github.com/gs-gs/staruml-cefact) 
			
			For example:
			```
			git clone https://github.com/gs-gs/staruml-cefact.git
			```

			
	-	Create a branch
		
		 - Change to the repository directory on your system (if you are not already there):
			```
			cd staruml-cefact
			```

			Now create a branch using the  `git checkout`  command:

			```
			git checkout -b <add-your-new-branch-name>
			```

			For example:

			```
			git checkout -b staruml-cefact-new
			```

	-	Make necessary changes and commit those changes

		 - Now open  any  file in a text editor, make change to improve our repository and save it.

		- Then go to  the project directory and execute the command  `git status`, you'll see there are changes.

		-	Add those changes to the branch you just created using the  `git add`  command:
			```
			git add <changed-filename>
			```

		- Now commit those changes using the  `git commit`  command:

			```
			git commit -m "Add <your-name> to Contributors list"
			```


	-	Push changes to Github

		 - Push your changes using the command  `git push`:

			```
			git push origin <add-your-branch-name>
			```	
	-	Submit your changes for review & submit pull request

		 - If you go to your repository on GitHub, you'll see a `Compare & pull request` button. Click on that button.
		 - Now submit the pull request.
