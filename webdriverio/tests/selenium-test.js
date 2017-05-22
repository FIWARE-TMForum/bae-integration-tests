
fdescribe('Integration tests', function () {

    var mysql = require('mysql');
    var connection = mysql.createConnection({
        host: 'biz_db',
        port: '3306',
        user: 'root',
        password: 'toor',
        multipleStatements: true
    });

    var dbases = ['DSBILLINGMANAGEMENT',
                  'DSCUSTOMER',
                  'DSPARTYMANAGEMENT',
                  'DSPRODUCTCATALOG2',
                  'DSPRODUCTINVENTORY',
                  'DSPRODUCTORDERING',
                  'DSUSAGEMANAGEMENT',
                  'RSS'];
    
    beforeAll(function() {
        connection.connect(function(err) {
            if (err) {
                console.error('error connecting: ' + err.stack);
                return;
            }
            
            console.log('connected as id ' + connection.threadId);
        });
	cleanDB()
	// DDBB must be cleaned from data, the only thing it should have is the schema.
    });
    
    afterAll(function(done) {
        connection.destroy();
        browser.end(done);
//	webdriverio.end();
    });

    function cleanDB() {
        dbases.forEach(function(db) {
            connection.query("SELECT CONCAT('TRUNCATE TABLE ', ?, '.', TABLE_NAME,';') AS truncateCommand FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?;", [db, db], function(error, results, fields) {
                if (error){
                    console.log(error)
                }
                
                results.forEach(function(obj) {
                    connection.query("SET FOREIGN_KEY_CHECKS=0;", obj.truncateCommand, "SET FOREIGN_KEY_CHECKS=1;", function(err, res, flds) {
                        if (err){
                            console.log(err)
                        }
                        console.log(JSON.stringify(res))
                    });
                })
                
            })
        });
    };

    describe('User.', function () {

	beforeAll(function() {
            browser.url('http://logic_proxy:8000/#/offering');
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
            // browser.debug()
	    var name = browser.getText('.has-stack > span:nth-child(2)');
            expect(name).toBe(expectedName);
            //browser.call(done)
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

	it('Should be able to update his/her info', function(done) {
            browser.click('.dropdown-toggle.has-stack');
            browser.click('[ui-sref=settings]');
            
            // Change some of the values
            browser.waitForExist('[name=firstName]');
            browser.setValue('[name=firstName]', 'testName');
            browser.setValue('[name=lastName]', 'testSurName');
            browser.click('.btn.btn-success');
            browser.waitForExist('form.ng-pristine:nth-child(3) > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > input:nth-child(2)');
            var name = browser.getValue('[name=firstName]');
            expect(name).toBe('testName');
	});
        

	it('Should be able to create a new category hierarchy', function(done) {
	    // Go to Admin page
            browser.click('.dropdown-toggle.has-stack');
            browser.click('[ui-sref=admin]');
            browser.debug()

	    // Create a new parent category
            browser.waitForEnabled('.btn.btn-success')
            browser.click('.btn.btn-success');
            browser.waitForEnabled('div.col-md-9:nth-child(2) > div:nth-child(1) > div:nth-child(1) > ng-include:nth-child(2) > form:nth-child(1) > div:nth-child(1) > input:nth-child(2)');
            browser.setValue('div.col-md-9:nth-child(2) > div:nth-child(1) > div:nth-child(1) > ng-include:nth-child(2) > form:nth-child(1) > div:nth-child(1) > input:nth-child(2)', 'testCategory1');
            browser.setValue('div.col-md-9:nth-child(2) > div:nth-child(1) > div:nth-child(1) > ng-include:nth-child(2) > form:nth-child(1) > div:nth-child(2) > textarea:nth-child(2)', 'A testing description');
            // Next
            browser.click('form.ng-dirty > div:nth-child(4) > a:nth-child(1)');
	    browser.waitForExist('.btn-warning');
	    browser.click('.btn-warning');
	    // TODO: Change this expect. This checks nothing
	    var title = browser.getTitle()
	    expect(title).toBe('Biz Ecosystem');
	});

	// it('Will try to create a new catalog. If the catalog already exists, he should be able to update the status of that catalog', function(done) {
        //     browser.debug();
        //     // My Stock
        //     browser.click('[ui-sref=stock]')
            
            
	//     browser.waitUntil(titleIs('Biz Ecosystem'));
	//     browser.findElement(By.linkText('My stock')).click();
	//     // var foundCatalog = !!browser.waitUntil(elementLocated(By.linkText('testCata')));
	//     // if(foundCatalog){
	//     //     browser.findElement(By.linkText('testCata')).click();
	//     //     browser.findElement(By.className('btn btn-success')).click();
	//     //     browser.waitUntil(elementLocated(By.linkText('Home')));		
	//     //     // Selenium has a bug where it wont load the second instruction of a goTo("URL"). I dont even know why this work around works. But it does.
	//     //     // If Jesus can walk on water. Can he swim on land?
	//     //     browser.navigate().to("chrome://version/")
	//     //     browser.navigate().to("http://localhost:8000/#/offering")
		
	//     //     browser.waitUntil(elementLocated(By.linkText('testCata')));
	//     //     foundCatalog = browser.findElement(By.linkText('testCata'));
	//     //     foundCatalog.then(x => x.getText().then(function(text) {
	//     //     	expect(text).toBe('testCatalog23');
	//     //     	done();
	//     //     }));
	//     // }else{
        //     //     // TODO: Finish this branch
        //     //     browser.click('.btn.btn-success');
        //     //     browser.setValue('[name=name]', 'testCatalog1');
        //     //     browser.setValue('[name=description]', 'A testing description');
        //     //     browser.click('.btn.btn-default.z-depth-1');
        //     //     browser.waitForExist('.btn.btn-warning');
	//     //     browser.click('.btn.btn-warning');
	//     //     // var catalogName = browser.findElement(By.name("name"));
	//     //     // catalogName.getAttribute("value").then(function(name){
	//     //     //     // TODO
	//     //     // });
	//     // }
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




