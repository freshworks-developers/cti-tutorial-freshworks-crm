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
``
}

/**
 * Adds the phone call log entry for the given contact
 *
 * @param {Object} contact - Contact object
 * @param {Object} call - call details
 * @param {String} note - Note for the phone call entry
 */
function addPhoneCall(contact, call, note) {

}

/**
 * It creates a contact in Freshworks CRM with the phone number
 */
function createContact() {

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

}

/**
 * To close the CTI app
 */
function closeApp() {

}

/**
 * To listen to click event for phone numbers in the Freshworks CRM pages and use the clicked phone number
 */
function clickToCall() {

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
