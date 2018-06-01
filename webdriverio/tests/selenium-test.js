var fs = require("fs");
var mysql = require('mysql');
var exec = require('child_process').exec;

describe('Integration tests', function () {

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

    const fadeTime = 160;

    beforeAll(function(done) {
        connection.connect(function(err) {
            if (err) {
                console.error('error connecting: ' + err.stack);
                return;
            }

            console.log('connected as id ' + connection.threadId);
        });
        cleanIndexes();
        // cleanDB().then(function(){
        //     console.log("out of promise");
        //     done();
        //});
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

    function restartApis() {
	var cmd = 'asadmin --host apis.docker --port 4848 --user admin --passwordfile=/asadminpw/asadmin-pw.txt --interactive=false restart-domain';
	return new Promise(function(resolve, reject) {
	    exec(cmd, function(error, stdout, stderr) {
		if(error)
		    reject("cannot exec command: " + error);
		else
		    resolve("Command executed!: " + stdout);
	    });
	});
    }

    function cleanIndexes() {
        indexes.map(x => deleteFolder(indexPath + x));
    };

    function cleanDB() {
        console.log("Loading SQL dump and creation...");
        return new Promise(function(resolve, reject){
            connection.query(fs.readFileSync('/app/tests/initialstate_dbs.sql').toString(), function(error, results, fields) {
                if (error) {
                    reject("error during dump: " + error);
                }
                else {
                    resolve("Database restored!");
                }
            });
        });
    };

    describe('User.', function () {

        beforeAll(function() {
            cleanDB().then((msg) => {
		restartApis().then((msg) => {
                    console.log(msg);
                    browser.url(proxy_location);
		});
            });
        });

        afterAll(function(done) {
            // Depopulate DDBB
        });

        userNormal = {id: 'test1@test1.com',
                      pass: 'test1'};

        function waitUntilTitle(title, done) {
            browser.waitUntil(function() {
                return browser.getTitle()  === title;
            }, 6000, "Expected title to be different", 1000);
            browser.call(done);
        }
	
        function checkLogin(user, expectedName) {
	    browser.waitForVisible(".alert.alert-danger", 12000, true);
            browser.waitForExist(".btn.btn-warning.navbar-btn.navbar-right.z-depth-1");
            browser.click(".btn.btn-warning.navbar-btn.navbar-right.z-depth-1"); // Sign in
            browser.waitForExist('#frontpage > div > div.login > div > div > form > div.modal-body.clearfix > div:nth-child(4) > label', 20000);
            browser.setValue('[name=username]', user.id);
            browser.setValue('[name=password]', user.pass);

            browser.click('#frontpage > div > div.login > div > div > form > div.modal-footer > button');
            browser.waitForExist('body > div.navbar.navbar-default.navbar-fixed-top.z-depth-2 > div > div.navbar-text.ng-binding', 60000);
            var name = browser.getText('.has-stack > span:nth-child(2)');
            expect(name).toBe(expectedName);
        };

        function processForm(form) {
            Object.keys(form).forEach( x => {
                if (form[x].kbd) {
                    $('[name=' + x + ']').setValue(form[x].val);
                } else {
                    $('[value=' + form[x].val + ']').click();
                }
            });
        }

        function checkForm(form) {
            Object.keys(form).forEach( fieldName => {
		if (form[fieldName].kbd) {
                    expect($('[name=' + fieldName + ']').getValue()).toBe(form[fieldName].val);
		} else {
                    expect($('[value=' + form[fieldName].val + ']').isSelected()).toBe(true);
                }
	    });
        }

	function clickInTr(clickable) {
	    // browser.debug();
	    // browser.waitForEnabled($('tbody').elements('tr').value)
	    var candidates = $('tbody').elements('tr').value; // every tr in the page
	    candidates.forEach((trs, index) => {
		if(trs.elements('td').value[0].getText() === clickable) // we are clicking by name so index 0
		    candidates[index].elements('td').value[0].click();
	    });
	}
	
	function checkFormModalContent(form) {
	    // browser.debug();
	    Object.keys(form).every( fieldName => {
		if (form[fieldName].kbd && fieldName !== 'number'){ // remove this when #22 issue is fixed
		    expect($$('.modal-content input').some(
			elem => elem.getAttribute('name') === fieldName && elem.isVisible()
		    )).toBe(true);
		} else {
		    expect($$('.modal-content select').some(
			elem => elem.getValue() === form[fieldName].val // && elem.isVisible()
		    )).toBe(true);
		}
	    });
	}

	function updateStatus(status) {
	    browser.click('.status-' + status);
	    browser.click('[ng-click="updateVM.update()"]'); // click "update"
	    browser.waitForVisible('.alert-group'); // wait for creation alert to pop up
	    browser.waitForVisible('.alert-group', 9000, true); // wait for creation alert not visible
	}
	
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

        function shippingAddressCreation(shipAdd) {

	    // browser.debug();
	    // browser.pause(5000); // whatever
	    browser.waitForExist('.fa.fa-spinner', 9000, true);
	    // browser.debug();
            browser.waitForExist('[name=emailAddress]', 9000);
            browser.waitForEnabled('[name=emailAddress]', 9000);
	    // browser.debug();
	    processForm(shipAdd);
	    browser.waitForEnabled('.btn-warning'); // wait for "created"
            browser.click('.btn-warning'); // create
	    browser.waitForEnabled('.btn-sm');
	    browser.click('.btn-sm'); // click edit
	    // browser.debug();
	    checkFormModalContent(shipAdd);
	    browser.click('/html/body/div[10]/div/div/div[3]/a[2]'); // click "cancel" (maybe a refactor could be handy)
	    browser.waitUntil(function() {
		return $('[ng-controller="CustomerUpdateCtrl as updateVM"]').isVisible() === false;
	    }, 5000, "obscured...", 500);
	    browser.pause(fadeTime); // this is like very rubbish but IDGAF (fade time: 0.15s)
        };

        function businessAddressCreation(busAdd, count) {
            browser.waitForExist('[name=mediumType]');
            browser.waitForEnabled('[name=mediumType]');
            // browser.debug();

	    processForm(busAdd);
	    
	    // browser.debug();
	    browser.waitForEnabled('a.btn.btn-warning');
            browser.click('a.btn.btn-warning');
	    browser.waitForExist('.btn-sm.btn-icon.btn-info');
	    browser.waitForVisible('.alert-group'); // wait for creation alert to pop up
	    browser.waitForVisible('.alert-group', 9000, true); // wait for creation alert not visible
	    $$('.btn-sm.btn-icon.btn-info')[count].click(); // select edit button by index
	    checkFormModalContent(busAdd);
	    browser.click('/html/body/div[9]/div/div/div[3]/a[2]'); // click "cancel"
	    browser.pause(fadeTime);
            // browser.waitForExist('div.table-responsive:nth-child(3) > table:nth-child(1) > tbody:nth-child(2)');
            // expect(browser.value('tr.ng-scope:nth-child(1) > th:nth-child(1)')).toBe(busAdd.medium);
        };

        function profileUpdate(profileInfo) {
            // Change some of the values
	    // browser.debug();
            browser.waitForExist('[name=firstName]');
            processForm(profileInfo);
            browser.click('.btn.btn-success'); // update
            browser.waitForExist('form.ng-pristine:nth-child(3) > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > input:nth-child(2)'); // I don't know what is this
            // Check update
	    // browser.debug();
            browser.click('.dropdown-toggle.has-stack'); // click user button
            browser.click('[ui-sref=settings]'); // click settings
	    checkForm(profileInfo);
        }

	function categoryCreation(category, child) {
	    // browser.debug();
	    browser.waitForExist('[name=name]');
	    processForm(category);
	    if (child.child.val){
		browser.click('.fa.fa-2x'); // click "choose a parent category"
		browser.pause(160);
		clickInTr(child.child.parent);
	    }
	    $('.form-group.text-right').$('.btn').click(); // click "next"
	    browser.waitForExist('[name=name]');
	    checkForm(category);
	    // browser.debug();
	    browser.click('[ng-click="createVM.create()"]'); // click "create"
	    browser.waitForVisible('.alert-group'); // wait for creation alert to pop up
	    browser.waitForVisible('.alert-group', 9000, true); // wait for creation alert not visible

	    // browser.debug();
	}

	function catalogCreation(catalog) {
	    browser.waitForExist('[name=name]');
	    processForm(catalog);
	    $('.form-group.text-right').$('.btn').click(); // click "next"
	    checkForm(catalog);
	    browser.click('[ng-click="createVM.create()"]'); // click "create"
	    browser.waitForVisible('.alert-group'); // wait for creation alert to pop up
	    browser.waitForVisible('.alert-group', 9000, true); // wait for creation alert not visible
	}

        /*
          As far as i know, these test must be passed in this order as they emulate user possible actions.
        */

        // Use this as a placeholder for new tests. Doing all the tests is horrible enough without worrying
        // about what html thing should be checked.
        // // TODO: Change this expect. This checks nothing
        // var title = browser.getTitle();
        // expect(title).toBe('Biz Ecosystem');

        // Check test-cases.org file to see a detailed explanation
        it('Test Case 1: Product creation and launch', function (done) {
	    // ----------------- LOGIN ---------------------
	    var userProvider = {id: 'idm',
				pass: 'idm'};
	    // browser.debug();
	    checkLogin(userProvider, 'idm', done);

	    // ------------- UPDATE PROFILE ------------
	    // TODO: fix JSON format, two categories: kbd y clickable
            var profileInfo = {
                firstName: { val: 'testName', kbd: true },
                lastName: { val: 'testSurName', kbd: true },
                title: { val: 'Mr', kbd: false },
                maritalStatus: { val: 'Single', kbd: false },
                gender: { val: 'Male', kbd: false },
                nationality: { val: 'Spain', kbd: true },
                birthDate: { val: '1980-12-12', kbd: true },
                countryOfBirth: { val: 'ES', kbd: false },
                placeOfBirth: { val: 'Albacete', kbd: true }
            };

	    // browser.debug();
	    browser.waitForExist(".dropdown-toggle.has-stack"); // wait for page to load
            browser.click('.dropdown-toggle.has-stack'); // click user button
            browser.click('[ui-sref=settings]'); // click settings
            profileUpdate(profileInfo);


	    // ------------ SHIPPING ADDRESS -----------

	    var shipAdd = {emailAddress: { val: 'shipadd@email.com', kbd: true },
                           street: { val: 'fighter', kbd: true },
                           postcode: {val: '1200000', kbd: true },
                           city: { val: 'Tokyo', kbd: true },
                           stateOrProvince: {val: 'Tokyo', kbd: true },
                           type: { val: 'warehouse', kbd: true },
                           number: { val: '666666666', kbd: true },
                           country: { val: 'ES', kbd: false }
			  };
	    
	    browser.click('[ui-sref="settings.contact"]'); // click "contact mediums"
	    shippingAddressCreation(shipAdd);
	    
	    // ----------- BUSINESS ADDRESSES ------------

	    // browser.debug();
	    // $('[ui-sref="settings.contact.business"]').waitForVisible(); // CHECK THIS
	    // $('[ui-sref="settings.contact.business"]').waitForEnabled(); // CHECK THIS
	    $('[ui-sref="settings.contact.business"]').click(); // click "business addresses" 

	    // browser.debug();	     
	    
	    var busAddresses = [{ mediumType: {val: 'Email', kbd: false},
				  emailAddress: {val:'testEmail@email.com', kbd: true}},
				{ mediumType: {val: 'TelephoneNumber', kbd: false},
				  type: {val: 'Mobile phone', kbd: true},
				  number: {val: '636363636', kbd: true}},
				{ mediumType: {val: 'PostalAddress', kbd: false},
				  street: {val: 'Fake St. 123', kbd: true},
				  postcode: {val: '1337', kbd: true },
				  city: {val: 'Atlantis', kbd: true},
				  stateOrProvince: {val: 'One of them', kbd: true},
				  country: {val: 'BS', kbd: false}
                         }];

	    busAddresses.forEach((busAdd, index) => {
	    	businessAddressCreation(busAdd, index);
	    	// browser.debug();
	    });
	    // browser.debug();

	    // ------------------- CATEGORY CREATION -----------------
	    browser.click('.dropdown-toggle.has-stack'); // click user button
	    // browser.click('a.btn.btn-default'); // go to main screen
	    browser.click('[ui-sref=admin]'); // go to category creation
	    browser.click('[ui-sref="admin.productCategory.create"]'); // click "create"

	    var parentCat = { name: { val: "parentCat", kbd: true},
			      description: { val: "This category is the son of grampaCat", kbd: true}
			    };
	    var childCat = { name: { val: "childCat", kbd: true},
			     description: { val: "This category is the little son of parentCat", kbd: true}
			   };

	    categoryCreation(parentCat, {child: { val: false }});
	    browser.click('[ui-sref="admin.productCategory"]'); // go to list
	    browser.click('[ui-sref="admin.productCategory.create"]'); // click "create"

	    categoryCreation(childCat, {child: { val: true, parent: "parentCat" }});
	    // browser.click('[ui-sref="admin.productCategory"]'); // go to list
	    // browser.click('[ui-sref="admin.productCategory.create"]'); // click "create"

	    // browser.debug();

	    browser.click('a.btn.btn-default'); // go to homepage
	    browser.waitForEnabled('.bg-view3'); // wait for "My Stock" and click
	    browser.click('.bg-view3');
	    browser.waitForEnabled('.btn.btn-success'); // wait for "New" and click
            browser.click('.btn.btn-success');

	    // ---------------------- CATALOG CREATION --------------------------
	    var catalog1 = { name: { val: "Product Catalog 1" , kbd: true},
			     description: { val: "There's not much to say about catalogs anyway", kbd: true}
			   };

	    var catalog2 = { name: { val: "Product Catalog 2" , kbd: true},
			     description: { val: "This is about to be OBSOLETE", kbd: true}
			   };
	    // browser.debug();
	    catalogCreation(catalog1);
	    updateStatus("launched");

	    browser.waitForEnabled('.bg-view3'); // wait for "My Stock" and click
	    browser.click('.bg-view3');
	    browser.waitForEnabled('.btn.btn-success'); // wait for "New" and click
            browser.click('.btn.btn-success');

	    // browser.debug();
	    catalogCreation(catalog2);
	    updateStatus("launched");
	    updateStatus("retired");
	    updateStatus("obsolete");
	    
        });

        xit('Should be able to update his/her info', function(done) {
            waitUntilTitle('Biz Ecosystem');

        });

        xit('Should be able to create a shipping address', function(done) {
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

        xit('Should be able to create a business address with email', function(done) {
            var busAdd = {medium: 'Email',
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

        xit('Should be able to create a business address with phone number', function(done) {
            var busAdd = {medium: 'TelephoneNumber',
                          type: 'USA Mobile phone',
                          phoneCode: '1',
                          number: "201-555-5555"
                         };

            // browser.waitForExist('.dropdown-toggle.has-stack');

            // browser.click('.dropdown-toggle.has-stack');
            // browser.click('[ui-sref=settings]');
            // browser.click('ul.nav:nth-child(2) > li:nth-child(2) > a:nth-child(1)');

            // // Business Address tab
            // browser.click('div.panel:nth-child(1) > ul:nth-child(1) > li:nth-child(2) > a:nth-child(1)');

            //browser.click('ul.nav:nth-child(2) > li:nth-child(2) > a:nth-child(1)');

            businessAddressCreation(busAdd);
        });

        xit('Should be able to create a business address with postal address', function(done) {
            var busAdd = {medium: 'PostalAddress',
                          street: 'Fake St. 123',
                          postCode: '1337',
                          city: 'Atlantis',
                          stateOrProvince: 'One of them',
                          country: 'BS'
                         };

            // browser.waitForExist('.dropdown-toggle.has-stack');

            // browser.click('.dropdown-toggle.has-stack');
            // browser.click('[ui-sref=settings]');
            // browser.click('ul.nav:nth-child(2) > li:nth-child(2) > a:nth-child(1)');

            // // Business Address tab
            // browser.click('div.panel:nth-child(1) > ul:nth-child(1) > li:nth-child(2) > a:nth-child(1)');

            //browser.click('ul.nav:nth-child(2) > li:nth-child(2) > a:nth-child(1)');

            businessAddressCreation(busAdd);
        });

        xit('Should be able to create a new category hierarchy', function(done) {
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

            // browser.debug();

            browser.click('.col-md-3 > ui-view:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > a:nth-child(1)');
        });

       xit('Cannot create an offering without a catalog nor product Spec', function(done) {
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

        xit('Should be able to create a new catalog.', function(done) {
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

        xit('Cannot create an offering without a product Spec', function(done) {
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


        xit('Create a new product Specification', function(done) {
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
