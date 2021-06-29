/**
 * Show a notification toast with the given type and message
 *
 * @param {String} type - type of the notification
 * @param {String} message - content to be shown in the notification
 **/
function showNotify(type, message) {
  return client.interface.trigger("showNotify", {
    type: type,
    message: message
  });
}

/**
 * It opens the contact details page for the give contact id
 *
 * @param {number} contactId - Contact to open
 */
function goToContact(contactId) {
  client.interface.trigger("show", { id: "contact", value: contactId })
    .then(function (data) {
      console.info('successfully navigated to contact');
      console.info(data);
      showNotify('info', 'Successfully navigated to a contact');
    }).catch(function (error) {
      console.error('Error: Failed to navigate to contact');
      console.error(error);
    });
}

/**
 * Fetches all the sales activity types in the account
 **/
function getSalesActivityTypes() {
  const url = 'https://<%= iparam.fcrm_domain %>/crm/sales/api/selector/sales_activity_types';
  const options = {
    headers: {
      Authorization: 'Token token=<%= iparam.fcrm_api_key %>'
    }
  }
  return client.request.get(url, options);
}

/**
 * Fetches all the sales activity outcomes for the given sales activity type
 *
 * @param {Number} salesActivityTypeId - Identifier of the sales activity type
 **/
function getSalesActivityOutcomes(salesActivityTypeId) {
  const url = `https://<%= iparam.fcrm_domain %>/crm/sales/api/selector/sales_activity_types/${salesActivityTypeId}/sales_activity_outcomes`;
  const options = {
    headers: {
      Authorization: 'Token token=<%= iparam.fcrm_api_key %>'
    }
  }
  return client.request.get(url, options);
}

/**
 * Adds sales activity entry for the given contact
 *
 * @param {Number} contactId - Identifier of the contact
 * @param {String} note - Note for the sales activity
 */
function addSalesActivity(contactId, note) {
  client.data.get("loggedInUser").then(
    function (data) {
      const userId = data.loggedInUser.id;
      getSalesActivityTypes().then(function (data) {
        const salesActivityTypes = JSON.parse(data.response).sales_activity_types;
        const salesActivityType = salesActivityTypes.find(activityType => activityType.internal_name === 'cphone');
        getSalesActivityOutcomes(salesActivityType.id).then(function (data) {
          const salesActivityOutcomes = JSON.parse(data.response).sales_activity_outcomes;
          const salesActivityOutcome = salesActivityOutcomes.find(salesActivityOutcome => salesActivityOutcome.name === "Interested");
          const url = `https://<%= iparam.fcrm_domain %>/crm/sales/api/sales_activities`;
          const options = {
            headers: {
              Authorization: 'Token token=<%= iparam.fcrm_api_key %>'
            },
            json: {
              sales_activity: {
                title: 'call',
                notes: note,
                targetable_type: 'Contact',
                targetable_id: contactId,
                start_date: '2017-12-04T17:00:00+05:30',
                end_date: '2017-12-04T17:00:00+05:30',
                owner_id: userId,
                sales_activity_type_id: salesActivityType.id,
                sales_activity_outcome_id: salesActivityOutcome.id
              }
            }
          }
          client.request.post(url, options).then(function (data) {
            console.info('Success: Created a sales activity');
            console.info(data);
            showNotify('info', 'Successfully add a sales activity');
          }, function (error) {
            console.error('Error: Failed to create a sales activity');
            console.error(error);
          });
        }, function (error) {
          console.error('Error: Failed to get all sales activity outcomes in account');
          console.error(error);
          showNotify('danger', 'Failed to add a sales activity');
        });
      }, function (error) {
        console.error('Error: Failed to get all sales activity types in account');
        console.error(error);
      });
    },
    function (error) {
      console.error('Error: Failed to get the loggedInUser information');
      console.error(error);
    });
}

/**
 * Adds the phone call log entry for the given contact
 *
 * @param {Object} contact - Contact object
 * @param {Object} call - call details
 * @param {String} note - Note for the phone call entry
 */
function addPhoneCall(contact, call, note) {
  client.data.get("loggedInUser").then(
    function (data) {
      const userId = data.loggedInUser.id;
      const url = `https://<%= iparam.fcrm_domain %>/crm/sales/api/cti_phone_calls`;
      const options = {
        headers: {
          Authorization: 'Token token=<%= iparam.fcrm_api_key %>',
          'Content-Type': 'multipart/form-data'
        },
        formData: {
          phone_call: {
            call_direction: call.type.toLowerCase().includes("incoming") || call.type.toLowerCase().includes("inbound"),
            targetable_type: 'Contact',
            targetable: {
              id: contact.id,
              first_name: contact.first_name,
              last_name: contact.last_name
            },
            note: {
              description: note
            },
            number: call.phone_number,
            user_id: userId,
            source: 'CTICOMPANYNAME'
          }
        }
      };
      client.request.post(url, options).then(function () {
        console.info('Success: Created a call log entry');
        showNotify('info', 'Successfully add a call log entry');
      }, function (error) {
        console.error('Error: Failed to add a call log');
        console.error(error);
        showNotify('danger', 'Failed to add a call log');
      });
    },
    function (error) {
      console.error('Error: Failed to get the loggedInUser information');
      console.error(error);
    });
}

/**
 * It creates a contact in Freshworks CRM with the phone number
 */
function createContact() {
  const url = `https://<%= iparam.fcrm_domain %>/crm/sales/api/contacts`;
  const options = {
    headers: {
      Authorization: 'Token token=<%= iparam.fcrm_api_key %>'
    },
    json: { "contact": { "first_name": "sample", "last_name": "person", "mobile_number": "1-111-111-2222" } }
  }
  client.request.post(url, options).then(function (data) {
    console.info('Success: Created a contact');
    console.info(data);
    const contact = data.response.contact || JSON.parse(data.response).contact;
    console.table(contact);
    goToContact(contact.id);
  }, function (error) {
    console.error('Error: Failed to create a contact');
    console.error(error);
  });
}

/**
 * It fetches the contact filters available
 */
function getContactFilters() {
  const url = 'https://<%= iparam.fcrm_domain %>/crm/sales/api/contacts/filters';
  const options = {
    headers: {
      Authorization: 'Token token=<%= iparam.fcrm_api_key %>'
    }
  }
  return client.request.get(url, options);
}

/**
 * It creates a contact in Freshdesk with the phone number
 */
function getContacts() {
  getContactFilters().then(function (data) {
    const filter = JSON.parse(data.response).filters.find(filter => filter.name === 'All Contacts');
    const url = `https://<%= iparam.fcrm_domain %>/crm/sales/api/contacts/view/${filter.id}`;
    const options = {
      headers: {
        Authorization: 'Token token=<%= iparam.fcrm_api_key %>'
      }
    }
    client.request.get(url, options).then(function (data) {
      console.info('Success: Got contacts');
      console.table(JSON.parse(data.response).contacts);
      showNotify('info', 'Successfully got the contacts list');
    }, function (error) {
      console.error('Error: Failed to get contacts');
      console.error(error);
    });
  }, function (error) {
    console.error('Error: Failed to get contact filters');
    console.error(error);
  });
}

/**
 * To get the logged in user in Freshdesk
 */
function getLoggedInUser() {
  client.data.get("loggedInUser").then(
    function (data) {
      console.info('Successfully got loggedInUser data');
      showNotify('info', `User's name: ${data.loggedInUser.display_name}`);
    },
    function (error) {
      console.error('Error: Failed to get the loggedInUser information');
      console.error(error);
    });
}

/**
 * To open the CTI app
 */
function openApp() {
  client.interface.trigger("show", { id: "phoneApp" })
    .then(function () {
      console.info('Success: Opened the app');
    }).catch(function (error) {
      console.error('Error: Failed to open the app');
      console.error(error);
    });
}

/**
 * To close the CTI app
 */
function closeApp() {
  client.interface.trigger("hide", { id: "phoneApp" }).then(function () {
    console.info('successfully closed the CTI app');
    showNotify('success', 'Successfully closed the CTI app.');
  }).catch(function (error) {
    console.error('Error: Failed to close the CTI app');
    console.error(error);
  });
}

/**
 * To listen to click event for phone numbers in the Freshworks CRM pages and use the clicked phone number
 */
function clickToCall() {
  const textElement = document.getElementById('appText');

  client.events.on("calling", function (event) {
    openApp();
    const phoneNumber = event.data.phoneNumber;
    textElement.innerText = `Clicked phone number: ${phoneNumber}`;
    // showNotify('info', `Successfully captured phone number: ${phoneNumber} through click-to-call method`);
  });
}

/**
 * To resize the height of the CTI app
 */
function resizeApp() {
  client.instance.resize({ height: '450px' });
}

/**
 * To get the context of the current product
 */
function getProductDetails() {
  client.data.get("domainName").then(function (data) {
    console.info('Success: Got the product details');
    console.info(data)
    showNotify('info', `Domain: ${data.domainName}, Product: ${data.productContext.name}`)
  }).catch(function (error) {
    console.error('Error: Failed to get the product details');
    console.error(error);
  });
}

/**
 * Lifecycle event callback for app activation
 */
function onAppActivate() {
  /* Sample values to test the app functionality */
  const CONTACT = {
    id: 16002341859,
    phone_number: '9876543210',
    first_name: 'John',
    last_name: 'Doe'
  };

  resizeApp();

  /* Adding event handlers for all the buttons in the UI of the app */
  document.getElementById('btnGetUser').addEventListener('fwClick', getLoggedInUser);
  document.getElementById('btnGetProductDetails').addEventListener('fwClick', getProductDetails);
  document.getElementById('btnClose').addEventListener('fwClick', closeApp);
  document.getElementById('btnGetContacts').addEventListener('fwClick', getContacts);
  document.getElementById('btnCreateContact').addEventListener('fwClick', createContact);
  document.getElementById('btnAddPhoneCall').addEventListener('fwClick', function () {
    addPhoneCall({
      id: CONTACT.id,
      first_name: CONTACT.first_name,
      last_name: CONTACT.last_name
    }, { type: 'outgoing', phone_number: CONTACT.phone_number }, "Sample note for Tutorial")
  });
  document.getElementById('btnAddSalesActivity').addEventListener('fwClick', function () {
    addSalesActivity(CONTACT.id, "sample notes")
  });
  /* Click-to-call event should be called inside the app.activated life-cycle event to always listen to the event */
  clickToCall();
}

document.onreadystatechange = function () {
  if (document.readyState === 'interactive') renderApp();

  function renderApp() {
    var onInit = app.initialized();

    onInit.then(getClient).catch(console.error);

    function getClient(_client) {
      window.client = _client;
      client.events.on('app.activated', onAppActivate);
    }
  }
};
