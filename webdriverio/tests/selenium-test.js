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
            browser.waitForExist('[id="id_email"]', 20000);
            browser.setValue('[name=email]', user.email);
            browser.setValue('[name=password]', user.pass);

            browser.click('[type="submit"]');
            browser.waitForExist('body > div.navbar.navbar-default.navbar-fixed-top.z-depth-2 > div > div.navbar-text.ng-binding', 60000);
            var name = browser.getText('.has-stack > span:nth-child(2)');
            expect(name).toBe(expectedName);
        };

        function processForm(form) {
            Object.keys(form).forEach( x => {
                if (form[x].kbd) {
                    $$('[name=' + x + ']').filter(x => x.isVisible())[0].setValue(form[x].val);
                } else {
                    $$('[value=' + form[x].val + ']').filter(x => x.isVisible())[0].click();
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

        function clickInTh(clickable) {
            $('tbody').elements('th').value.filter( x => x.getText() === clickable)[0].click();
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

        function waitForPopUp() {
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
            browser.waitForExist('[name=firstName]');
            processForm(profileInfo);
            browser.click('[ng-click="updateVM.update()"]'); // update
	    waitForPopUp();
            // Check update
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

        function productSpecCreation(prodSpec) {
            // browser.debug();
            // step 1: general
            processForm(prodSpec.general);
            $$('[ng-disabled="!step.form.$valid"]').filter( x => x.isVisible())[0].click(); // click next
            // step 2: bundle [PENDING]
            // browser.debug();
            if(Object.keys(prodSpec.bundle).length !== 0) {
                // do things with bundle
            }
            $('[ng-disabled="createVM.data.isBundle && !createVM.bundleControl.valid"]').click(); // click next

            // step 3: digitalAssets [PENDING]
            // browser.debug();
            if(Object.keys(prodSpec.digitalAssets).length !== 0) {
                // do things with digitalAssets
            }
            $('[ng-disabled="createVM.isDigital && !createVM.assetCtl.isValidAsset()"]').click(); // click next

            // browser.debug();
            // step 4: characteristics
            if(Object.keys(prodSpec.characteristics).length !== 0) {
                prodSpec.characteristics.forEach(char => {
                    browser.click('[ng-click="createVM.characteristicEnabled = true"]'); // click new characteristic
                    // browser.debug();
                    browser.pause(500);
                    processForm(char.generalForm);
                    char.values.forEach( value => {
                        browser.waitForEnabled('[name=value]');
                        processForm(value);
                        browser.click('[ng-disabled="!step.characteristicValueForm.$valid"]'); // click "+"
                    });
                    // this ugly click is for characteristic creation
                    browser.click('[ng-click="createVM.createCharacteristic() && createForm.resetForm(step.characteristicForm)"]');
                });
            }
            // browser.debug();
            $$('[ng-disabled="!step.form.$valid"]').filter( x => x.isVisible())[0].click(); // click next
            // step 5: attachments
            // browser.debug();
            if(Object.keys(prodSpec.attachments).length !== 0) {
                processForm(prodSpec.attachments);
            }
            $$('[ng-disabled="!step.form.$valid"]').filter( x => x.isVisible())[0].click(); // click next
            // step 6: relationships [PENDING]
            // browser.debug();
            if(Object.keys(prodSpec.relationships).length !== 0) {
                // do things with relationships
            }
            $$('[ng-click="createForm.nextStep($index + 1, createVM.stepList[$index + 1])"]').filter(x => x.isVisible())[0].click(); // next
            // step 7: terms and conditions
            // browser.debug();
            if(Object.keys(prodSpec.terms).length !== 0) {
                processForm(prodSpec.terms);
            }
            $$('[ng-disabled="!step.form.$valid"]').filter( x => x.isVisible())[0].click(); // next
            // step 8: finish
            // [PENDING] check form
            // browser.debug();
            browser.click('[ng-click="createVM.create()"]'); // finish creation
        }

        function productOfferingCreation(prodOff) {
            //browser.debug();
            // step 1: general
            browser.pause(500);
            processForm(prodOff.general);
            prodOff.places.forEach( x => {
                $('[name=place]').setValue(x);
                $('[ng-click="createVM.createPlace()"]').click();
            });
            $$('[ng-disabled="!step.form.$valid"]').filter( x => x.isVisible())[0].click(); // click next
            // step 2: bundle
            //browser.debug();
            if(Object.keys(prodOff.bundle).length !== 0) {
                // do things with bundle
            }
            $('[ng-disabled="createVM.data.isBundle && !createVM.bundleControl.valid"]').click(); // click next
            // step 3: product Spec selection
            //browser.debug();
            $$('[placeholder="Search..."]').filter(x => x.isVisible)[0].setValue(prodOff.productSpec);
            browser.click('[id=formSearch]'); // search spec
            clickInTh(prodOff.productSpec);
            //browser.debug();
            $$('[ng-disabled="!step.form.$valid"]').filter( x => x.isVisible())[0].click(); // click next
            // step 4: catalogue
            //browser.debug();
            $$('[placeholder="Search..."]').filter(x => x.isVisible)[0].setValue(prodOff.catalogue);
            browser.click('[id=formSearch]'); // search spec
            clickInTr(prodOff.catalogue); // click spec
            browser.pause(500);
            //browser.debug();
            $$('[class="ng-binding"]').filter(x => x.getText() === prodOff.catalogue)[0].click();
            $$('[ng-disabled="!step.form.$valid"]').filter( x => x.isVisible())[0].click(); // click next
            // step 5: categories
            //browser.debug();
            prodOff.categories.forEach(x => clickInTr(x)); // click categories
            browser.pause(500);
            $$('[ng-disabled="!step.form.$valid"]').filter( x => x.isVisible())[0].click(); // click next
            // step 6: price plans
            // browser.debug();
            if(Object.keys(prodOff.pricePlans) !== 0) {
                prodOff.pricePlans.forEach( pp => {
                    browser.click('[ng-click="createVM.pricePlanEnabled = true"]'); // new price plan
                    browser.pause(500);
                    // browser.debug();
                    $$('.dropdown-toggle.z-depth-0').filter(x => x.isVisible())[0].click(); // click paymentType dropdown
                    $$('[class="item-text ng-binding"]').filter(x => x.getText() === pp.paymentType.val)[0].click(); // click paymentType
                    delete pp.paymentType;
                    $$('.dropdown-toggle.z-depth-0').filter(x => x.isVisible())[1].click(); // click price currency
                    $$('[class="item-text ng-binding"]').filter(x => x.getText() === pp.currency.val)[0].click(); // click currency
                    delete pp.currency;
                    $$('.dropdown-toggle.z-depth-0').filter(x => x.isVisible())[2].click(); // click priceAlteration
                    $$('[class="item-text ng-binding"]').filter(x => x.getText() === pp.priceAlteration.val)[0].click();
                    delete pp.priceAlteration;
                    processForm(pp);
                    browser.click('[ng-click="createVM.createPricePlan()"]');
                });
            }
            $$('[ng-click="createForm.nextStep($index + 1, createVM.stepList[$index + 1])"]').filter(x => x.isVisible())[0].click();
            // step 7: RS Model
            // browser.debug();
            $$('td').filter(x => x.getText() === prodOff.RSModel)[0].click();
            $$('[ng-disabled="!step.form.$valid"]').filter( x => x.isVisible())[0].click(); // click next
            // step 8: finish
            // [PENDING] check form
            // browser.debug();
            browser.click('[ng-click="createVM.create()"]');
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
            var userProvider = {email: 'admin@test.com',
                                pass: '1234'};
            // browser.debug();
            checkLogin(userProvider, 'admin', done);

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
            waitForPopUp();

            // ----------- BUSINESS ADDRESSES ------------

            $('[ui-sref="settings.contact.business"]').click(); // click "business addresses"

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
            });

            // ------------------- CATEGORY CREATION -----------------
            browser.click('.dropdown-toggle.has-stack'); // click user button
            // browser.click('a.btn.btn-default'); // go to main screen
            browser.waitForEnabled('[ui-sref=admin]');
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

            browser.click('a.btn.btn-default'); // go to homepage
            browser.waitForEnabled('.bg-view3'); // wait for "My Stock" and click
            browser.click('.bg-view3');
            browser.waitForEnabled('[ui-sref="stock.catalogue.create"]'); // wait for "New" and click
            browser.click('[ui-sref="stock.catalogue.create"]');

            // ---------------------- CATALOG CREATION --------------------------
            var catalog1 = { name: { val: "Product Catalog 1" , kbd: true},
                             description: { val: "There's not much to say about catalogs anyway", kbd: true}
                           };

            var catalog2 = { name: { val: "Product Catalog 2" , kbd: true},
                             description: { val: "This is about to be OBSOLETE", kbd: true}
                           };

            catalogCreation(catalog1);
            updateStatus("launched");

            browser.waitForEnabled('.bg-view3'); // wait for "My Stock" and click
            browser.click('.bg-view3');
	    browser.waitForEnabled('[ui-sref="stock.catalogue.create"]'); // wait for "New" and click
            browser.click('[ui-sref="stock.catalogue.create"]');
	    
            catalogCreation(catalog2);
            updateStatus("launched");
            updateStatus("retired");
            updateStatus("obsolete");

            // browser.debug();

            browser.click('[ui-sref="stock.product"]'); // click "product spec"
            browser.waitForEnabled('[ui-sref="stock.product.create"]'); // wait for "New" and click
            browser.click('[ui-sref="stock.product.create"]');

            // ---------------------- PRODUCT SPEC CREATION --------------------

            var productSpec1 = {
                general: { name: { val: "prodSpec1", kbd: true },
                           version: { val: "0.01", kbd: true },
                           brand: { val: "FIWARE Lab", kbd: true },
                           productNumber: { val: "1", kbd: true },
                           description: { val: "Test Case 1 only product spec", kbd: true }},
                bundle: {}, // bundle
                digitalAssets: {}, // digital asset
                characteristics: [{ generalForm: { name: { val: "characteristic", kbd: true },
                                                   valueType: { val: "number", kbd: false },
                                                   description: {val: "does something, dunno what", kbd: true }},
                                    values: [{ value: { val: "9", kbd: true },
                                               unitOfMeasure: { val: "somethings", kbd: true }}]
                                  }], // characteristics
                attachments: { pictureProvide: { val: "url", kbd: false },
                               picture: { val: "https://www.fiware.org//wp-content/uploads/2017/12/logo1.gif", kbd: true }}, // check upload
                relationships: {},
                terms: { title: { val: "EULA", kbd: true },
                         text: { val: "do you agree?", kbd: true }
                       }
            };

            productSpecCreation(productSpec1);
            waitForPopUp();
            //browser.debug();
            updateStatus("launched");
            //browser.debug();

            browser.click('[ui-sref="stock.offering"]'); // click offering
	    browser.waitForEnabled('[ui-sref="stock.offering.create"]'); // wait for "New" and click
            browser.click('[ui-sref="stock.offering.create"]');

            // ---------------------- PRODUCT OFFERING CREATION ----------------
            var productOffering1 = {
                general: { name: { val: "prodOff1", kbd: true },
                           version: { val: "0.5", kbd: true },
                           description: { val: "Test Case 1 only product offering", kbd: true },
                         },
                places: ["parts unknown"], // this is inside general but outside processForm
                bundle: {}, // bundle
                productSpec: "prodSpec1",
                catalogue: "Product Catalog 1",
                categories: ["parentCat"],
                pricePlans: [{ name: { val: "Standard payment", kbd: true },
                               paymentType: { val: "ONE TIME", kbd: false },
                               taxIncludedAmount: { val: "3", kbd: true },
                               description: { val: "Standard product payment", kbd: true },
                               priceAlteration: { val: "None", kbd: false},
                               currency: { val: "(BRL) Brazil Real", kbd: false}
                             }],
                RSModel: "defaultRevenue"
            };

            productOfferingCreation(productOffering1);
            waitForPopUp();
            updateStatus("launched");
            browser.debug();

            browser.reload(); // close session
            browser.url(proxy_location);

            // -------------- CUSTOMER CONNECTION  ---------------------

            var userNormal = {email: 'test1@test1.com',
                              pass: 'test1'};

            checkLogin(userNormal, 'test1', done);

            browser.debug();
            browser.waitForExist(".dropdown-toggle.has-stack");
            browser.click('[ng-click="user.order(offering)"]');
            browser.waitForVisible('[class="modal-content"]');
            $$('[ng-repeat="tab in createVM.tabs"]')[1].click(); // click terms and conditions
            browser.click('[type="checkbox"]'); // click agree
            browser.click('[ng-click="createVM.order()"]'); // add to cart
            waitForPopUp();

            // -------------- CUSTOMER SHIPPING ADDRESS --------------------

            browser.click('.dropdown-toggle.has-stack'); // click user button
            browser.click('[ui-sref=settings]'); // click settings

            var shipAdd2 = {
                emailAddress: { val: 'shipadd2@email.com', kbd: true },
                street: { val: 'fighter alpha II', kbd: true },
                postcode: {val: '1200000', kbd: true },
                city: { val: 'Tokyo', kbd: true },
                stateOrProvince: {val: 'Tokyo', kbd: true },
                type: { val: 'warehouse', kbd: true },
                number: { val: '666666666', kbd: true },
                country: { val: 'ES', kbd: false }
            };

            browser.click('[ui-sref="settings.contact"]'); // click "contact mediums"
            shippingAddressCreation(shipAdd2);

            // ---------------------- CHECKOUT ------------------------------

            browser.click('[ng-controller="UserShoppingCartCtrl as listVM"]'); // click shopping cart
            browser.click('[ui-sref="shopping-cart"]'); // checkout

            var checkoutInfo = {
                form: {
                    'ext-id': { val: "My first checkout!", kbd: true },
                    priority: { val: '3', kbd: false },
                    description: { val: "I need this product because reasons", kbd: true },
                    note: { val: "I hope this product that cost me 3 BRAZIL REALS will be worthy", kbd: true },
                },
		shippingAddressEmail: shipAdd2.emailAddress.val,
		productOffering: productOffering1.general.name.val
            };

	    browser.debug();
	    
        });
    });
});
