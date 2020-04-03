import shutil
import os

def main():

    # remove the extension
    try:
      shutil.rmtree('C:/Users/Mayur/AppData/Roaming/StarUML/extensions/user/gs-gs.staruml-cefact')

    except:
      print("extension not installed")

    # copy files to extension path
    source = 'D:/Faizan-Vahevaria/StarUML/new-cloned/staruml-cefact/'
    destination = 'C:/Users/Mayur/AppData/Roaming/StarUML/extensions/user/gs-gs.staruml-cefact/'

    shutil.copytree(source, destination)
    
 
 
if __name__ == '__main__':
    main()
