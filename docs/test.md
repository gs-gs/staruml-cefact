# How test works

OpenAPI3.0 Specification provides two testing features for the developer and enduser.

1. Manual Testing
2. Automation Testing


**1. Manual Testing**
- Manual Testing feature is provided for enduser. User can test that diagram is designed is valid or not.
- To use this feature user must install the plugin into StarUML. (e.g. [Install Extension](https://docs.staruml.io/user-guide/managing-extensions#install-extension))
- Once, Plugin installed. Check **Tools -> OpenAPI**
- Here, We provide two way to use manual testing
	
	1. Test Package

		- This feature test selected package from elementPickerDialog and validate that package using [swagger-parser](https://www.npmjs.com/package/swagger-parser)
		- Now, Goto **Tools -> OpenAPI -> Test Package**
		- Select Package from **elementPickerDialog**
		- Then, It will test your selected package is valid or not using [swagger-parser](https://www.npmjs.com/package/swagger-parser) and display info or error dialog as test goes success and failure.
			
	2. Test Entire package
	
		- This feature test entire project. Test all packages one by one using [swagger-parser](https://www.npmjs.com/package/swagger-parser) and display the summery of all tested packages in info or error dialog as test goes success and failure.
		- Now, Goto **Tools -> OpenAPI -> Test Entire Project**
		- Then, It will test all packages of your project one by one is valid or not using [swagger-parser](https://www.npmjs.com/package/swagger-parser) and display info or error dialog as test goes success and failer.

