
fdescribe('Integration tests', function () {

    var mysql = require('mysql');
    var connection = mysql.createConnection({
        host: 'biz_db',
        port: '3306',
        user: 'root',
        password: 'toor',
        multipleStatements: true//,
        //debug: true
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
        console.log("Cleaning database")
        dbases.forEach(function(db) {
            connection.query("SELECT CONCAT('DELETE FROM ', ?, '.', TABLE_NAME,';') AS truncateCommand FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?;", [db, db], function(error, results, fields) {
                if (error){
                    console.log("Database error while building the querys. Error: " + error)
                }
                
                else if (results){
                    results.forEach(function(obj) {
                        connection.query(obj.truncateCommand, function(err, res, flds) {
                            if (err){
                                console.log("Database error while cleaning the tables. Error: " + err)
                            }
                        });
                    });
                }
            });
        });
        console.log("Database cleaned")
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

        function secureSetValue(selector, value) {
                value ? browser.setValue(value) : browser.setValue('');
        };

	function createProductSpec(browser, product, expectedProduct, done) {
            var nextButton = 'btn btn-default z-depth-1';
	    // var stringSelector = '/html/body/div[4]/div/div[3]/ui-view/ui-view/ui-view/div/div[2]/div/div/div[2]/div[2]/div[4]/div/ng-include/div[2]/div/form[1]/div[1]/div[2]/div/select/option[1]';
	    // var numberSelector = '/html/body/div[4]/div/div[3]/ui-view/ui-view/ui-view/div/div[2]/div/div/div[2]/div[2]/div[4]/div/ng-include/div[2]/div/form[1]/div[1]/div[2]/div/select/option[2]';
	    // var numberRangeSelector = '/html/body/div[4]/div/div[3]/ui-view/ui-view/ui-view/div/div[2]/div/div/div[2]/div[2]/div[4]/div/ng-include/div[2]/div/form[1]/div[1]/div[2]/div/select/option[3]';
            browser.waitForExist('[ui-sref=stock]');
            browser.click('[ui-sref=stock]');
            browser.waitForExist('li.active:nth-child(2)')
            browser.click('li.active:nth-child(2)')
            
	    // 1
            browser.waitForExist('.btn.btn-success');
            browser.click('.btn.btn-success');
            browser.waitForEnabled('[name=name]');
            secureSetValue('[name=name]', product.name);
            secureSetValue('[name=version]', product.version);
            secureSetValue('[name=brand]', product.brand);
            secureSetValue('[name=productNumber]', product.productNumber);
            secureSetValue('[name=description]', product.description);
            browser.click('form.ng-valid-pattern > div:nth-child(4) > a:nth-child(1)');

	    // 2
            browser.waitForEnabled(nextButton);
            browser.click(nextButton);

	    // 3
            browser.waitForEnabled(nextButton);
            browser.click(nextButton);

	    // 4
            browser.waitForExist('.text-left > a:nth-child(1)');
	    if(product.characteristics){
                browser.click('.text-left > a:nth-child(1)');
		product.characteristics.forEach(characteristic => {
                    browser.waitForEnabled('[name=name]');
                    secureSetValue('[name=name]', characteristic.name);
                    secureSetValue('[name=description]', characteristic.description);
		    // Now i should send the value to the proper field, but first i need to select the correct selector
		    if (characteristic.value.type === 'number'){
                        
                        browser.click('div.row:nth-child(4) > div:nth-child(1) > ng-include:nth-child(2) > div:nth-child(2) > div:nth-child(1) > form:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > select:nth-child(2) > option:nth-child(2)');
                        secureSetValue('[name=unitOfMeasure]', characteristic.value.unit);
                        secureSetValue('[name=value]', characteristic.value.val);
		    }else if(characteristic.value.type === 'numberRange'){
                        browser.click('div.row:nth-child(4) > div:nth-child(1) > ng-include:nth-child(2) > div:nth-child(2) > div:nth-child(1) > form:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > select:nth-child(2) > option:nth-child(3)');
			browser.findElement(By.css(numberRangeSelector)).click();
                        secureSetValue('[name=unitOfMeasure]', characteristic.value.unit);
                        secureSetValue('[name=valueTo]', characteristic.value.valTo);
                        secureSetValue('[name=valueFrom]', characteristic.value.valFrom);
		    }else{
                        secureSetValue('[name=value]', characteristic.value.val);
		    }
                    browser.click('.col-sm-2 > a:nth-child(1)');
		})
		browser.findElement(By.className('btn btn-warning z-depth-1 ng-scope')).click();
	    }
            browser.click('div.row:nth-child(4) > div:nth-child(1) > ng-include:nth-child(2) > div:nth-child(4) > a:nth-child(1)')

	    // 5
            browser.waitForExist('[name=picture]');
            secureSetValue('[name=picture]', product.picture);
            browser.click(nextButton);

	    // 6
            browser.waitForEnabled(nextButton);
            browser.click(nextButton);
            
	    // 7
            browser.waitForEnabled(nextButton);
            secureSetValue('[name=title]', product.title);
            secureSetValue('[name=text]', product.text);
            browser.click(nextButton);

            // 8
            browser.waitForEnabled('btn btn-warning');
            browser.click('btn btn-warning');
	};

        function shippingAddressCreation(shipAdd){
            var properties = ['emailAddress', 'street', 'postcode', 'city',
                              'stateOrProvince', 'type', 'number'];
            browser.waitForExist('[name=emailAddress]');
            secureSetValue('[name=emailAddress]', shipAdd.emailAddress);
            secureSetValue('[name=street]', shipAdd.street);
            secureSetValue('[name=postcode]', shipAdd.postcode);
            secureSetValue('[name=city]', shipAdd.city);
            secureSetValue('[name=stateOrProvince]', shipAdd.stateOrProvince);
            secureSetValue('[name=type]', shipAdd.type);
            secureSetValue('[name=number]', shipAdd.number);
            browser.click('shipping-address-form.ng-isolate-scope:nth-child(3) > form:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(3) > div:nth-child(1) > div:nth-child(3) > div:nth-child(2) > div:nth-child(1) > select:nth-child(2) > option:nth-child(210)');
            browser.click('.dropup > li:nth-child(205)');
            if (!shipAdd || !properties.every(x => return x in shipAdd)){
                expect(browser.isEnabled('.btn-warning')).toBe(false);
            } else {
                expect(browser.isEnabled('.btn-warning')).toBe(true);
                browser.click('.btn-warning');
                // TODO. Make expect in case of correct creation
            }
        };

        function businessAddressCreation(busAdd) {
            if (busAdd.medium === 'Email address') {
                secureSetValue('[name=emailAddress]', busAdd.email);
            }else if (busAdd.medium === 'Telephone number') {
                browser.click('business-address-form.ng-scope > form:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > select:nth-child(2) > option:nth-child(2)');
                secureSetValue('[name=type]', busAdd.type);
                browser.click('form.ng-dirty > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > ul:nth-child(2) > li:nth-child(205) > span:nth-child(2)')
            }else if (busAdd.medium === 'Postal address') {
                browser.click('business-address-form.ng-scope > form:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > select:nth-child(2) > option:nth-child(3)');
                secureSetValue('[name=street]', busAdd.street);
                secureSetValue('[name=postcode]', busAdd.postcode);
                secureSetValue('[name=city]', busAdd.city);
                secureSetValue('[name=stateOrProvince]', busAdd.stateOrProvince);
                browser.click('form.ng-dirty > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(3) > div:nth-child(2) > div:nth-child(1) > select:nth-child(2) > option:nth-child(210)');
            }else{
                expect(browser.isEnabled('.btn-warning')).toBe(false);
                return;
            }
            browser.waitForEnabled('btn btn-warning');
            browser.click('btn btn-warning');
            browser.waitForExist('div.table-responsive:nth-child(3) > table:nth-child(1) > tbody:nth-child(2)');
            expect(browser.value('tr.ng-scope:nth-child(1) > th:nth-child(1)')).toBe(busAdd.medium);
        };
	/*
	  As far as i know, these test must be passed in this order as they emulate user possible actions.
	 */

	// Use this as a placeholder for new tests. Doing all the tests is horrible enough without worrying 
	// about what html thing should be checked.
	// // TODO: Change this expect. This checks nothing
        // var title = browser.getTitle();
	// expect(title).toBe('Biz Ecosystem');

	
	
	
	
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

        it('Should be able to create a shipping address', function(done) {
            var shipAdd = {};
            browser.click('ul.nav:nth-child(2) > li:nth-child(2) > a:nth-child(1)');
            shippingAddressCreation(shipAdd);
        });

        it('Should be able to create a contact medium', function(done) {
            var busAdd = {};
            browser.click('.dropdown-toggle.has-stack');
            browser.click('[ui-sref=settings]');
            browser.click('ul.nav:nth-child(2) > li:nth-child(2) > a:nth-child(1)');
            browser.click('div.panel:nth-child(1) > ul:nth-child(1) > li:nth-child(2) > a:nth-child(1)');
            businessAddressCreation(busAdd);
        });

	it('Should be able to create a new category hierarchy', function(done) {
	    // Go to Admin page
            browser.click('.dropdown-toggle.has-stack');
            browser.click('[ui-sref=admin]');

	    // Create a new parent category
            browser.waitForEnabled('.btn.btn-success');
            browser.click('.btn.btn-success');
            browser.waitForEnabled('div.col-md-9:nth-child(2) > div:nth-child(1) > div:nth-child(1) > ng-include:nth-child(2) > form:nth-child(1) > div:nth-child(1) > input:nth-child(2)');
            browser.setValue('div.col-md-9:nth-child(2) > div:nth-child(1) > div:nth-child(1) > ng-include:nth-child(2) > form:nth-child(1) > div:nth-child(1) > input:nth-child(2)', 'testCategory1');
            browser.setValue('div.col-md-9:nth-child(2) > div:nth-child(1) > div:nth-child(1) > ng-include:nth-child(2) > form:nth-child(1) > div:nth-child(2) > textarea:nth-child(2)', 'A testing description');
            // Next
            browser.click('form.ng-dirty > div:nth-child(4) > a:nth-child(1)');
            // TODO: Check why category creation returns a 500 error code.
            browser.debug()
	    browser.waitForExist('.btn-warning');
	    browser.click('.btn-warning');
            // List all categories
            browser.waitForExist('.breadcrumb-triangle > a:nth-child(1) > span:nth-child(2)');
            browser.click('.breadcrumb-triangle > a:nth-child(1) > span:nth-child(2)');
            browser.waitForExist('strong.ng-binding');
	    var category = browser.getText('strong.ng-binding');
	    expect(category).toBe('testCategory1');
            browser.click('.col-md-3 > ui-view:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > a:nth-child(1)');
	});
        
	it('Will try to create a new catalog.', function(done) {
            // My Stock
            browser.url('http://logic_proxy:8000/#/offering');
            browser.waitForExist('[ui-sref=stock]');
            browser.click('[ui-sref=stock]');

            // New
            browser.waitForEnabled('.btn.btn-success');
            browser.click('.btn.btn-success');
            
            // 1. General
            // 
            browser.waitForExist('div.col-md-9:nth-child(2) > div:nth-child(1) > div:nth-child(1) > ng-include:nth-child(2) > form:nth-child(1) > div:nth-child(1) > input:nth-child(2)');
            
            browser.setValue('div.col-md-9:nth-child(2) > div:nth-child(1) > div:nth-child(1) > ng-include:nth-child(2) > form:nth-child(1) > div:nth-child(1) > input:nth-child(2)', 'testCatalog1');
            browser.setValue('div.col-md-9:nth-child(2) > div:nth-child(1) > div:nth-child(1) > ng-include:nth-child(2) > form:nth-child(1) > div:nth-child(2) > textarea:nth-child(2)', 'A testing description');
            browser.click('.btn.btn-default.z-depth-1');
            browser.waitForExist('.btn.btn-warning');
	    browser.click('.btn.btn-warning');
            
            //2. Finish
            browser.waitForExist('.btn.btn-success');
            browser.click('div.status-item:nth-child(2)');
            browser.waitForExist('.btn.btn-success');
            browser.click('.btn.btn-success');

            //Checks
            browser.waitForExist('.bg-view1 > strong:nth-child(2)');
            browser.click('.bg-view1 > strong:nth-child(2)');
            browser.waitForExist('ul.nav-stacked:nth-child(3) > li:nth-child(2) > a:nth-child(1)');
            browser.debug()
            var catalogName = browser.getText('ul.nav-stacked:nth-child(3) > li:nth-child(2) > a:nth-child(1)');
            expect(catalogName).toBe('testCatalog1');
	    
	    //     browser.findElement(By.linkText('testCata')).click();
	    //     browser.findElement(By.className('btn btn-success')).click();
	    //     browser.waitUntil(elementLocated(By.linkText('Home')));		
	    //     // Selenium has a bug where it wont load the second instruction of a goTo("URL"). I dont even know why this work around works. But it does.
	    //     // If Jesus can walk on water. Can he swim on land?
	    //     browser.navigate().to("chrome://version/")
	    //     browser.navigate().to("http://localhost:8000/#/offering")
		
	    //     browser.waitUntil(elementLocated(By.linkText('testCata')));
	    //     foundCatalog = browser.findElement(By.linkText('testCata'));
	    //     foundCatalog.then(x => x.getText().then(function(text) {
	    //     	expect(text).toBe('testCatalog23');
	    //     	done();
	    //     }));
	});

        
	// xit('Create a new product Specification', function(done) {
	//     var product = {};
	//     var expectedProduct = {};

        //     waitUntilTitle('Biz Ecosystem', done);

	//     // Call the function
	//     createProductSpec(browser, product, expectedProduct, done);
	//     // TODO: expects
        // });
        
    });
});




