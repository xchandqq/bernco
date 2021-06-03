Project Name: Bernalillo County Mobile Application

Project Description: Behavioral Services Mobile App

Platform Used: Ionic w/ Angular

Developer/s:
Christian Abellanosa

Changelog:
-

Main Features:
- Integration with backend database to fetch content
- Filters out not adjacent Resources

Plugins Active:
- cordova-sqlite-storage (and its dependencies)
- cordova-plugin-nativegeocoder (and its dependencies)
	- ionic cordova plugin add cordova-plugin-nativegeocoder
	- npm install @ionic-native/native-geocoder
- cordova-plugin-geolocation (and its dependencies)
	- ionic cordova plugin add cordova-plugin-geolocation
	- npm install @ionic-native/geolocation

Important Module/File List:
- api.services.ts
	Directory:	/src/app/serv
	Fields:
		applicationSettingURL - backend server url for application settings
		databaseURL - backend server url for content
	Functions:
		getApplicationSetting		- retrieves acf option fields
		getArticles			- retrieves all articles
		getSingleArticle		- retrieves one article
		getRelatedArticles		- retrieves articles of the same category
		getSavedArticles		- retrieves articles bookmarked
		getSearchedArticlesByKeyword	- searches for articles by keyword
		getSearchedArticlesByIds	- retrieves articles by id
		getSearchedArticlesByCategoryId	- retrieves articles of certain category
		getCategories			- retrieves all article categories
		getEvents			- retrieves all events
		getResourceCategories		- retrieves all resource categories
		getResourceCategoriesByKeyword	- searches for resource categories by keyword
		getResourcesByCategory		- retrieves resources by resource category
		getSingleResource		- retrieves one resource

- article-service.service.ts
	Directory:	/src/app/serv
	Functions:
		parseArticle			- interprets data from backend into an Article object
- events.service.ts
	Directory:	/src/app/serv
	Functions:
		parseEvent			- interprets data from backend into an Event object
- local-database.service.ts
	Directory:	/src/app/serv
	Fields:
		db - object returned after opening database
		locationData - object as a result of selecting a location
		ids - array of bookmarked article ids
	Functions:
		canInitialize			- returns if sqlite can initialize
		initialize			- opens database
		createArticlesTable		-
		createLocationTable		-
		retrieveArticlesData		- retrieves ids
		retrieveLocationData		- retrieves location
		finalizeArticlesInitialization	-
		finalizeLocationInitialization	-
		isArticlesInitialized		-
		isLocationInitialized		-
		enableErrorMode			- toggles an error event
		isErrorMode			-
		canBookmark			-
		canStoreLocation		-
		bookmarkArticle			-
		storeLocation			-
		getBookmarkedArticleIds		-
		hasStoredLocationData		-
		getStoredLocationData		-
		isArticleBookmarked		-
		insertArticleIdToDatabase	-
		deleteArticleIdFromDatabase	-
- resource-category.service.ts
	Directory:	/src/app/serv
	Functions:
		setSelectedCategory		-
		getSelectedCategory		-
		parseCategory			- interprets data from backend into a Resource Category object
- resource.service.ts
	Directory:	/src/app/serv
	Functions:
		parseResource			- interprest data from backend into a Resource object
		isResourceNearby		- checks the distance between two locations if within threshold
		calculateDistance		- calculates the distance between two locations

Notes:
Backup files:
1.) src folder contains the pages' html, typescript, css, and assets
2.) angular.json file have modifications on asset location
3.) config.xml file have modifications on splash screen
4.) resource/android/icon folder contains the icons for android OS
5.) resource/android/xml/network_security_config.xml have modifications for backend integration

To continue project:
1.) Create blank project
2.) Add the necesary plugins and their dependencies
3.) Merge folders and rewrite files

When changing backend address, modify:
1.) /src/app/serv/api.service.ts applicationSettingURL
2.) /src/app/serv/api.service.ts databaseURL
3.) /resource/android/xml/network_security_config.xml domain-config > domain