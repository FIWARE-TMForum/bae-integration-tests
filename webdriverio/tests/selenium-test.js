
describe('Integration tests', function () {

    // var mysql = require('mysql');
    // var connection = mysql.createConnection({
    //     host: 'biz_db',
    //     port: '3306'
    //     user: 'root',
    //     password: 'toor'
    // });
    
    // connection.connect(function(err) {
    //     if (err) {
    //         console.error('error connecting: ' + err.stack);
    //         return;
    //     }
 
    //     console.log('connected as id ' + connection.threadId);
    // });
    
    beforeAll(function(done) {
	browser.url('http://logic_proxy:8000/#/offering');
	// DDBB must be cleaned from data, the only thing it should have is the schema.
    });
    
    afterAll(function(done) {
        browser.end(done)
//	webdriverio.end();
    });

    fdescribe('User.', function () {

	beforeAll(function(done) {
            
	    // Populate DDBB
	});

	afterAll(function(done) {
	    // Depopulate DDBB
	});
	
	userNormal = {id: 'patata@mailinator.com',
		      pass: 'test'};

	userProvider = {id: '58d5266e056d1@mailbox92.biz',
			pass: 'test'};

        function waitUntilTitle(title, done) {
            browser.waitUntil(function() {
                return browser.getTitle()  === title
            }, 6000, "Expected title to be different", 1000);
            browser.call(done)
        }
	
	function checkLogin(user, expectedName, done) {
	    waitUntilTitle("Biz Ecosystem", done);
	    browser.click(".btn.btn-warning.navbar-btn.navbar-right.z-depth-1"); // Sign in
            browser.waitForExist('#frontpage > div > div.login > div > div > form > div.modal-body.clearfix > div:nth-child(4) > label', 20000);
            browser.setValue('[name=username]', user.id);
            browser.setValue('[name=password]', user.pass);
            browser.click('#frontpage > div > div.login > div > div > form > div.modal-footer > button');
            browser.waitForExist('body > div.navbar.navbar-default.navbar-fixed-top.z-depth-2 > div > div.navbar-text.ng-binding', 60000)
            //browser.debug()
	    var name = browser.getText('.has-stack > span:nth-child(2)');
            expect(name).toBe(expectedName);
	};

	// function createProductSpec(browser, product, expectedProduct, done) {
	//     var stringSelector = '/html/body/div[4]/div/div[3]/ui-view/ui-view/ui-view/div/div[2]/div/div/div[2]/div[2]/div[4]/div/ng-include/div[2]/div/form[1]/div[1]/div[2]/div/select/option[1]';
	//     var numberSelector = '/html/body/div[4]/div/div[3]/ui-view/ui-view/ui-view/div/div[2]/div/div/div[2]/div[2]/div[4]/div/ng-include/div[2]/div/form[1]/div[1]/div[2]/div/select/option[2]';
	//     var numberRangeSelector = '/html/body/div[4]/div/div[3]/ui-view/ui-view/ui-view/div/div[2]/div/div/div[2]/div[2]/div[4]/div/ng-include/div[2]/div/form[1]/div[1]/div[2]/div/select/option[3]';
	//     browser.findElement(By.linkText('My stock')).click();
	//     browser.findElement(By.className('item-icon fa fa-file')).click();
	//     // 1
	//     browser.findElement(By.className('btn btn-success')).click();
	//     browser.waitUntil(elementLocated(By.name('name')));
	//     browser.findElement(By.name('ProductSpecTest')).sendKeys(product.name);
	//     browser.findElement(By.name('version')).sendKeys(product.version);
	//     browser.findElement(By.name('brand')).sendKeys(product.brand);
	//     browser.findElement(By.name('productNumber')).sendKeys(product.productNumber);
	//     browser.findElement(By.name('description')).sendKeys(product.description);
	//     browser.findElement(By.className('btn btn-default z-depth-1')).click();
	//     // 2
	//     browser.waitUntil(elementLocated(By.className('track')));
	//     browser.findElement(By.className('btn btn-default z-depth-1')).click();
	//     // 3
	//     browser.waitUntil(elementLocated(By.className('track')));
	//     browser.findElement(By.className('btn btn-default z-depth-1')).click();
	//     // 4
	//     browser.waitUntil(elementLocated(By.className('item-icon fa fa-plus')));
	//     if(product.characteristics){
	// 	product.characteristics.forEach(characteristic =>
	// 					browser.findElement(By.className('btn btn-default z-depth-1 ng-scope')).click();
	// 					browser.waitUntil(elementLocated(By.name('name'))).sendKeys(characteristic.name);
	// 					browser.findElement(By.name('description')).sendKeys(characteristic.description);
	// 					// Now i should send the value to the proper field, but first i need to select the correct selector
	// 					if (characteristic.value.type === 'number'){
	// 					    browser.findElement(By.css(numberSelector)).click();
	// 					    browser.findElement(By.name('unitOfMeasure')).sendKeys(characteristic.value.unit);
	// 					    browser.findElement(By.name('value')).sendKeys(characteristic.value.val);
	// 					}else if(characteristic.value.type === 'numberRange'){
	// 					    browser.findElement(By.css(numberRangeSelector)).click();
	// 					    browser.findElement(By.name('valueFrom')).sendKeys(characteristic.value.valFrom);
	// 					    browser.findElement(By.name('valueTo')).sendKeys(characteristic.value.valTo);
	// 					    browser.findElement(By.name('unitOfMeasure')).sendKeys(characteristic.value.unit);
	// 					}else{
	// 					    browser.findElement(By.name('value')).sendKeys(characteristic.value.val);
	// 					}
	// 					browser.findElement(By.className('item-icon fa fa-plus')).click();
	// 				       )
	// 	browser.findElement(By.className('btn btn-warning z-depth-1 ng-scope')).click();
	//     }
	//     browser.findElement(By.className('btn btn-default z-depth-1')).click();
	//     // 5
	//     browser.waitUntil(elementLocated(By.className('thumbnail thumbnail-lg')));
	//     if (product.picture){
	// 	// Its only a test so we only accept picture URLs
	// 	browser.findElement(By.name('picture')).sendKeys(product.picture)
	//     }
	//     browser.findElement(By.className('btn btn-default z-depth-1')).click();
	//     // 6
	//     browser.waitUntil(elementLocated(By.name('type')));
	//     browser.findElement(By.className('btn btn-default z-depth-1')).click();
	//     // 7
	//     browser.waitUntil(elementLocated(By.className('text-muted')));
	//     browser.findElement(By.name('title')).sendKeys(product.title);
	//     browser.findElement(By.name('text')).sendKeys(product.text);
	//     browser.findElement(By.className('btn btn-default z-depth-1')).click();
	//     browser.waitUntil(elementLocated(By.name('name')));
	//     // TODO: Check that all parameters are the correct ones before creating the product.


	    
	//     browser.findElement(By.className('btn btn-warning')).click();
	// };
	/*
	  As far as i know, these test must be passed in this order as they emulate user possible actions.
	 */

	// Use this as a placeholder for new tests. Doing all the tests is horrible enough without worrying about what
	// html thing should be checked.
	// // TODO: Change this expect. This checks nothing
	// browser.getTitle().then(function (title) {
	//     expect(title).toBe('Biz Ecosystem');
	// });

	
	
	
	
	it('Should be able to log in with a correct username and password', function (done) {
	    checkLogin(userProvider, 'testfiware', done);
	});

	// it('Should be able to update his/her info', function(done) {
	//     browser.findElement(By.className('dropdown-toggle has-stack')).click();
	//     browser.findElement(By.id('Settings')).click();
	    
	//     // Change some of the values
	//     var fieldName = browser.waitUntil(elementLocated(By.name('firstName')));
	//     fieldName.clear();
	//     fieldName.sendKeys('testName');
	//     browser.findElement(By.name('lastName')).clear();
	//     browser.findElement(By.name('lastName')).sendKeys('testSurName');
	//     browser.findElement(By.className('btn btn-success')).click();
	//     browser.waitUntil(elementLocated(By.className('h4 text-dark-secondary')))
	//     var nameInput = browser.waitUntil(elementLocated(By.name('firstName')));
	//     nameInput.getAttribute("value").then(function(firstName) {
	// 	expect(firstName).toBe('testName');
	// 	done();
	//     })
	// });

	// it('Should be able to create a new category hierarchy', function(done) {
	//     // Go to Admin page
	//     browser.findElement(By.className('dropdown-toggle has-stack')).click();
	//     browser.findElement(By.id('Admin')).click();
	//     // Create a new parent category
	//     browser.waitUntil(elementLocated(By.className('btn btn-success')));
	//     foundCats = !!browser.findElements(By.linkText('testCategory1'));
	//     if (!foundCats) {
	//     	browser.findElement(By.className('btn btn-success')).click();
	//     	var catName = browser.waitUntil(elementLocated(By.name('name')));
	//     	catName.sendKeys('testCategory1');
	//     	browser.findElement(By.name('description')).sendKeys('A testing description');
	//     	browser.findElement(By.linkText('Next')).click();
	//     	browser.waitUntil(elementLocated(By.className('h4 text-dark-secondary')));
	//     	browser.findElement(By.className('btn btn-warning')).click();
	//     	// TODO: Change this expect. This checks nothing
	//     	browser.getTitle().then(function (title) {
	//     	    expect(title).toBe('Biz Ecosystem');
	// 	    done();
	//     	});
	//     }else{
	// 	done();
	//     }
	// });

	// it('Will try to create a new catalog. If the catalog already exists, he should be able to update the status of that catalog', function(done) {
	//     browser.findElement(By.className('btn btn-default z-depth-1')).click();
	//     browser.waitUntil(titleIs('Biz Ecosystem'));
	//     browser.findElement(By.linkText('My stock')).click();
	//     var foundCatalog = !!browser.waitUntil(elementLocated(By.linkText('testCata')));
	//     if(foundCatalog){
	// 	browser.findElement(By.linkText('testCata')).click();
	// 	browser.findElement(By.className('btn btn-success')).click();
	// 	browser.waitUntil(elementLocated(By.linkText('Home')));		
	// 	// Selenium has a bug where it wont load the second instruction of a goTo("URL"). I dont even know why this work around works. But it does.
	// 	// If Jesus can walk on water. Can he swim on land?
	// 	browser.navigate().to("chrome://version/")
	// 	browser.navigate().to("http://localhost:8000/#/offering")
		
	// 	browser.waitUntil(elementLocated(By.linkText('testCata')));
	// 	foundCatalog = browser.findElement(By.linkText('testCata'));
	// 	foundCatalog.then(x => x.getText().then(function(text) {
	// 		expect(text).toBe('testCatalog23');
	// 		done();
	// 	}));
	// 	// TODO
	//     }else{
	// 	browser.findElement(By.className('btn btn-success')).click();
	// 	browser.waitUntil(elementLocated(By.name('name')));
	// 	browser.findElement(By.name('name')).sendKeys('testCatalog21');
	// 	browser.findElement(By.name('description')).sendKeys('A testing description');
	// 	browser.findElement(By.linkText('Next')).click();
	// 	browser.waitUntil(elementLocated(By.className('h4 text-dark-secondary')));
	// 	browser.findElement(By.className('btn btn-warning')).click();	    
	// 	browser.waitUntil(elementLocated(By.className('h4 text-dark-secondary')));
	// 	var catalogName = browser.findElement(By.name("name"));
	// 	catalogName.getAttribute("value").then(function(name){
	// 	    // TODO
	// 	});
	// 	// browser.waitUntil(elementLocated(By.className('status-item status-launched')));
	// 	// expect(name).toBe('testCatalog20');
	// 	// var icon = browser.findElement(By.css("div.status-item.status-launched"));
	// 	// browser
	// 	//     .actions()
	// 	//     .click(icon)
	// 	//     .perform();
	// 	browser.waitUntil(elementLocated(By.className('status-item status-launched active')));
	//     }
	// });

	// xit('Create a new product Specification', function(done) {
	//     var product = {};
	//     var expectedProduct = {};
	    
	//     browser.waitUntil(titleIs('Biz Ecosystem'));
	//     // Call the function
	//     createProductSpec(browser, product, expectedProduct, done);
	    
        // });
    });
});




