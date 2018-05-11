var fs = require("fs");
var mysql = require('mysql');

fdescribe('Integration tests', function () {

    var connection = mysql.createConnection({
        //        host: 'biz_db',
        host: 'mysql',
        port: '3306',
        user: 'root',
        password: 'my-secret-pw',
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

    var indexes = ['catalogs',
		   'inventory',
		   'offerings',
		   'orders',
		   'products'];

    var indexPath = '/proxy-indexes/';

    var proxy_location = 'http://proxy.docker:8004/#/offering';

    beforeAll(function() {
        connection.connect(function(err) {
            if (err) {
                console.error('error connecting: ' + err.stack);
                return;
            }

            console.log('connected as id ' + connection.threadId);
        });
        cleanDB();
        cleanIndexes();
        // DDBB and indexes must be cleaned from data, the only thing it should have is the schema.
    });

    afterAll(function(done) {
        connection.destroy();
        browser.end(done);
        //  webdriverio.end();
    });
    
    function deleteFolder(path){
	console.log("Deleting " + path + "index...");
	if (fs.existsSync(path)) {
	    fs.readdirSync(path).forEach(function(file, index){
		var curPath = path + "/" + file;
		if (fs.lstatSync(curPath).isDirectory()) { // recurse
		    deleteFolder(curPath);
		} else { // delete file
		    fs.unlinkSync(curPath);
		}
	    });
	    fs.rmdirSync(path);
	}
    };


    function cleanIndexes() {
	indexes.map(x => deleteFolder(indexPath + x));
    };

    function cleanDB() {
        console.log("Cleaning database");
        connection.query("SET FOREIGN_KEY_CHECKS=0;", function(error, results, fields) {
            if (error){
                console.log("Error at setting foreign keys checks to 0. " + error);
            }
        });
        dbases.forEach(function(db) {
            connection.query("SELECT CONCAT('DELETE FROM ', ?, '.', TABLE_NAME,';') AS truncateCommand FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?;", [db, db], function(error, results, fields) {
                if (error){
                    console.log("Database error while building the querys. " + error);
                }
                else {
                    results.forEach(function(obj) {
                        // if (db === 'DSPRODUCTCATALOG2'){
                        //     console.log(obj)
                        // }
                        connection.query(obj.truncateCommand, function(err, res, flds) {
                            if (err){
                                // Sorry, whoever is reading this, for this "If this doesnt work... Repeat it". Sometimes it works, sometimes it doesnt.
                                // There may be some foreign key errors in case of deleting the parent first so. Whatever.
                                console.log("Error cleaning a table. Repeating the command.");
                                connection.query(obj.truncateCommand, function(errorMsg, resultInsert, fds){
                                    if (errorMsg){
                                        console.log("Unexpected database error." + errorMsg);
                                    }
                                });
                            }
                        });
                    });
                    if (db !== 'RSS'){
                        connection.query("INSERT INTO "+ db + ".SEQUENCE VALUES ('SEQ_GEN',0);", function(errorMsg, resultInsert, fields){
                            if (errorMsg){
                                console.log("Database error while initializing the tables. " + errorMsg);
                            }else{
                                console.log(db + ": Success");
                            }
                        });
                    }
                }
            });
        });
        connection.query("SET FOREIGN_KEY_CHECKS=1;", function(error, results, fields) {
            if (error){
                console.log("Error at setting foreign keys checks to 1. " + error);
            }
        });
        console.log("Database cleaned");
    };

    describe('User.', function () {

        beforeAll(function() {
            browser.url(proxy_location);
            // Populate DDBB
        });

        afterAll(function(done) {
            // Depopulate DDBB
        });

        userNormal = {id: 'test1@test1.com',
                      pass: 'test1'};

        userProvider = {id: 'idm',
                        pass: 'idm'};

        function waitUntilTitle(title, done) {
            browser.waitUntil(function() {
                return browser.getTitle()  === title;
            }, 6000, "Expected title to be different", 1000);
            browser.call(done);
        }

        function checkLogin(user, expectedName, done) {
            waitUntilTitle("Biz Ecosystem", done);
            browser.click(".btn.btn-warning.navbar-btn.navbar-right.z-depth-1"); // Sign in
            browser.waitForExist('#frontpage > div > div.login > div > div > form > div.modal-body.clearfix > div:nth-child(4) > label', 20000);
            browser.setValue('[name=username]', user.id);
            browser.setValue('[name=password]', user.pass);

            browser.click('#frontpage > div > div.login > div > div > form > div.modal-footer > button');
            browser.waitForExist('body > div.navbar.navbar-default.navbar-fixed-top.z-depth-2 > div > div.navbar-text.ng-binding', 60000);
            var name = browser.getText('.has-stack > span:nth-child(2)');
            expect(name).toBe(expectedName);
            //browser.call(done)
        };

        function secureSetValue(selector, value) {
            value ? browser.setValue(selector, value) : browser.setValue(selector, '');
        };

	function getElementByCSS(selector, attribute, compareValue) {
	    return $$(selector).filter(x => (x.getAttribute(attribute) === compareValue) && x.isVisible());
	};

	function setElementValueByCSS(selector, attribute, compareValue, inputValue) {
	    getElementByCSS(selector, attribute, compareValue).forEach(x => x.setValue(inputValue));
	};

	function clickElementByCSS(selector, attribute, compareValue) {
	    getElementByCSS(selector, attribute, compareValue).forEach(x => x.click());
	};

        function createProductSpec(browser, product, expectedProduct, done) {
            var nextButton = 'btn btn-default z-depth-1';
            // var stringSelector = '/html/body/div[4]/div/div[3]/ui-view/ui-view/ui-view/div/div[2]/div/div/div[2]/div[2]/div[4]/div/ng-include/div[2]/div/form[1]/div[1]/div[2]/div/select/option[1]';
            // var numberSelector = '/html/body/div[4]/div/div[3]/ui-view/ui-view/ui-view/div/div[2]/div/div/div[2]/div[2]/div[4]/div/ng-include/div[2]/div/form[1]/div[1]/div[2]/div/select/option[2]';
            // var numberRangeSelector = '/html/body/div[4]/div/div[3]/ui-view/ui-view/ui-view/div/div[2]/div/div/div[2]/div[2]/div[4]/div/ng-include/div[2]/div/form[1]/div[1]/div[2]/div/select/option[3]';
            browser.waitForExist('.bg-view3');
            browser.click('.bg-view3');
            browser.waitForExist('li.active:nth-child(2)');
            browser.click('li.active:nth-child(2)');

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
                });
                browser.findElement(By.className('btn btn-warning z-depth-1 ng-scope')).click();
            }
            browser.click('div.row:nth-child(4) > div:nth-child(1) > ng-include:nth-child(2) > div:nth-child(4) > a:nth-child(1)');

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
            browser.waitForEnabled('[name=emailAddress]');
            // browser.debug()
            if (!shipAdd || !properties.every(x => x in shipAdd)){
                expect(browser.isExisting('[class="btn btn-warning"][disabled="disabled"]')).toBe(true);
            } else {
		browser.debug();
		setElementValueByCSS('input', 'name', 'emailAddress', shipAdd.emailAddress);
                setElementValueByCSS('input', 'name', 'street', shipAdd.street);
                setElementValueByCSS('input', 'name', 'postcode', shipAdd.emailAddress);
                setElementValueByCSS('input', 'name', 'city', shipAdd.city);
		setElementValueByCSS('input', 'name', 'stateOrProvince', shipAdd.stateOrProvince);
		clickElementByCSS('option.ng-binding.ng-scope', 'value', shipAdd.country); // country selection dropdown
		setElementValueByCSS('input', 'name', 'type', shipAdd.type);
		setElementValueByCSS('input', 'name', 'number', shipAdd.number);
		expect(browser.isEnabled('.btn-warning')).toBe(true);
		browser.debug();
		clickElementByCSS('a.btn', 'ng-click', 'createVM.create(createVM.form)'); // create button
                // TODO. Make expect in case of correct creation
            }
        };

        function businessAddressCreation(busAdd) {
            browser.waitForExist('[name=emailAddress]');
            browser.waitForEnabled('[name=emailAddress]');
            if (busAdd.medium === 'Email address') {
                secureSetValue('[name=emailAddress]', busAdd.email);
            }else if (busAdd.medium === 'Telephone number') {
                browser.click('business-address-form.ng-scope > form:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > select:nth-child(2) > option:nth-child(2)');
                secureSetValue('[name=type]', busAdd.type);
                browser.click('form.ng-dirty > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > ul:nth-child(2) > li:nth-child(205) > span:nth-child(2)');
            }else if (busAdd.medium === 'Postal address') {
                browser.click('business-address-form.ng-scope > form:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > select:nth-child(2) > option:nth-child(3)');
                secureSetValue('[name=street]', busAdd.street);
                secureSetValue('[name=postcode]', busAdd.postcode);
                secureSetValue('[name=city]', busAdd.city);
                secureSetValue('[name=stateOrProvince]', busAdd.stateOrProvince);
                browser.click('form.ng-dirty > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(3) > div:nth-child(2) > div:nth-child(1) > select:nth-child(2) > option:nth-child(210)');
            }else{
                // browser.debug()
                expect(browser.isExisting('[class="btn btn-warning"][disabled="disabled"]')).toBe(true);
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

        fit('Should be able to log in with a correct username and password', function (done) {
            checkLogin(userProvider, 'idm', done);
        });

        fit('Should be able to update his/her info', function(done) {
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

        fit('Should be able to create a shipping address', function(done) {
            var shipAdd = {emailAddress: 'testEmail@email.com',
                           street: 'fighter',
                           postcode: '1200000',
                           city: 'Tokyo',
                           stateOrProvince: 'Tokyo',
                           type: 'warehouse',
                           number: '666666666',
			   country: 'ES'};

            browser.waitForExist('.btn.btn-success');

            browser.click('.dropdown-toggle.has-stack');
            browser.click('[ui-sref=settings]');
            browser.click('ul.nav:nth-child(2) > li:nth-child(2) > a:nth-child(1)');

            shippingAddressCreation(shipAdd);

        });

        it('Should be able to create a business address', function(done) {
            var busAdd = {medium: 'Email address',
                          emailAddress: 'testEmail@email.com'};

            browser.waitForExist('.dropdown-toggle.has-stack');

            browser.click('.dropdown-toggle.has-stack');
            browser.click('[ui-sref=settings]');
            browser.click('ul.nav:nth-child(2) > li:nth-child(2) > a:nth-child(1)');

            // Business Address tab
            browser.click('div.panel:nth-child(1) > ul:nth-child(1) > li:nth-child(2) > a:nth-child(1)');

            //browser.click('ul.nav:nth-child(2) > li:nth-child(2) > a:nth-child(1)');

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

            browser.waitForExist('.btn-warning');
            browser.click('.btn-warning');
            // List all categories

            browser.waitForExist('.breadcrumb-triangle > a:nth-child(1) > span:nth-child(2)');
            browser.click('.breadcrumb-triangle > a:nth-child(1) > span:nth-child(2)');

            browser.waitForExist('strong.ng-binding');
            var category = browser.getText('strong.ng-binding');
            expect(category).toBe('testCategory1');

            browser.debug();

            browser.click('.col-md-3 > ui-view:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > a:nth-child(1)');
        });

        it('Cannot create an offering without a catalog nor product Spec', function(done) {
            browser.url(proxy_location);

            // My stock
            browser.waitForExist('.bg-view3');
            browser.click('.bg-view3');

            // Offerings
            browser.click('.nav-responsive > li:nth-child(3) > a:nth-child(1)');

            //browser.debug();
            // click on New button
            browser.waitForEnabled('.btn.btn-success');
            browser.click('.btn.btn-success');
            // div.alert:nth-child(1) > span:nth-child(1)
            browser.waitForExist('div.alert:nth-child(1) > span:nth-child(1)');

            expect(browser.getText('div.alert:nth-child(1) > span:nth-child(1)')).toBe('Sorry! In order to create a product offering, you must first create at least one product catalogue.');

        });

        it('Should be able to create a new catalog.', function(done) {
            // My Stock
            // browser.debug()
            browser.waitForExist('.bg-view3');
            browser.click('.bg-view3');

            // New
            browser.waitForEnabled('.btn.btn-success');
            browser.click('.btn.btn-success');

            // 1. General
            //
            browser.waitForExist('div.col-md-9:nth-child(2) > div:nth-child(1) > div:nth-child(1) > ng-include:nth-child(2) > form:nth-child(1) > div:nth-child(1) > input:nth-child(2)');

            browser.setValue('div.col-md-9:nth-child(2) > div:nth-child(1) > div:nth-child(1) > ng-include:nth-child(2) > form:nth-child(1) > div:nth-child(1) > input:nth-child(2)', 'testCatalog1');
            browser.setValue('div.col-md-9:nth-child(2) > div:nth-child(1) > div:nth-child(1) > ng-include:nth-child(2) > form:nth-child(1) > div:nth-child(2) > textarea:nth-child(2)', 'A description');
            browser.click('.btn.btn-default.z-depth-1');
            // browser.debug()
            browser.waitForExist('.btn.btn-warning');
            browser.click('.btn.btn-warning');

            //2. Finish
            // browser.debug()
            browser.waitForExist('.btn.btn-success');
            browser.click('div.status-item:nth-child(2)');
            browser.waitForExist('.btn.btn-success');
            browser.click('.btn.btn-success');

            //Checks
            browser.waitForExist('.bg-view1 > strong:nth-child(2)');
            browser.click('.bg-view1 > strong:nth-child(2)');
            browser.waitForExist('ul.nav-stacked:nth-child(3) > li:nth-child(2) > a:nth-child(1)');


            var catalogName = browser.getText('ul.nav-stacked:nth-child(3) > li:nth-child(2) > a:nth-child(1)');
            expect(catalogName).toBe('testCatalog1');

            browser.debug();
            //     // Selenium has a bug where it wont load the second instruction of a goTo("URL"). I dont even know why this work around works. But it does.
            //     // If Jesus can walk on water. Can he swim on land?
            //     browser.navigate().to("chrome://version/")
            //     browser.navigate().to("http://localhost:8004/#/offering")
        });

        it('Cannot create an offering without a product Spec', function(done) {
            // This test should fail
            // My stock
            browser.waitForExist('.bg-view3');
            browser.click('.bg-view3');

            // Offerings
            browser.click('.nav-responsive > li:nth-child(3) > a:nth-child(1)');

            // click on New button
            browser.waitForEnabled('.btn.btn-success');
            browser.click('.btn.btn-success');

            browser.waitForExist('div.alert:nth-child(1) > span:nth-child(1)');

            expect(browser.getText('div.alert:nth-child(1) > span:nth-child(1)')).toBe('Sorry! In order to create a product offering, you must first create at least one product specification.');
        });


        it('Create a new product Specification', function(done) {
            var product = {name: 'testProduct',
                           version: '1.0',
                           brand: 'Bimbo',
                           productNumber: '3141592',
                           description: 'A deliciously mathematical description',
                           picture: 'http://www.testingUrl.com',
                           title: 'testTitle',
                           text: 'The title is testTitle not testTicle'};
            var expectedProduct = {};

            waitUntilTitle('Biz Ecosystem', done);

            // Call the function
            createProductSpec(browser, product, expectedProduct, done);
            waitUntilTitle('Biz Ecosystem', done);
            browser.debug();
            // TODO: expects
        });

        xit('Create an offering', function(done) {
            // TODO. check that an offering can be created only if a catalog and an specification exists beforehand

        });

    });
});
