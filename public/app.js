$('document').ready(function() {

  // Event listener for "Import" button
  $('#src_submit').click(function() {
    var src_key = $('#src_key').val();
    var src_secret = $('#src_secret').val();

    $.ajax({
      method: 'GET',
      url: '/lifecycle?apiKey=' + src_key + '&secret=' + src_secret,
      dataType: 'json',
      success: function(res) {
        createFlowList(res);
      },
      error: function(err) {
        console.log(parseResponseText(err.responseText));
        showErrorModal(parseResponseText(err.responseText));
      }
    })
  })

  // Close Error Modal
  $('#close-modal').click(hideModal);

  // Event listener for "Submit" button
  $('#dest_submit').click(function() {
    submitTemplateList();
  })
})

// Creates template list. Invoked as callback after successful GET call to source acct.
function createFlowList(flowObj) {
  console.log(flowObj);
  var templateList = $('<div></div>')
                      .attr({
                        class: "pa3 overflow-y-scroll",
                        id: "template-list"
                      })
                      .css({
                        "height": "calc(100% - 50px)"
                      })

  $(Object.keys(flowObj)).each(function(index, key) {
    var checkbox =  $('<input></input>')
                    .attr({
                      type: 'checkbox',
                      name: flowObj[key],
                      class: 'template-checkbox mr2'
                    });

    var label = $('<label></label>')
               .text(key)
               .prepend(checkbox);

    var div = $('<div></div>')
              .attr({
                class: "w-100 pa2 pv3"
              })
              .css({
                "background": index % 2 == 0 ? "#EFF0F1": "#FFFFFF"
              })
              .append(label);

    $(templateList).append(div);
  })

  var selectAllDiv = $('<div></div>')
                      .attr({
                        class: 'w-100 flex justify-around'
                      })
                      .css({
                        "height": "50px",
                      })

  var selectAllButton = $('<button></button>')
                       .attr({
                        id: 'select-all-btn',
                        class: 'bg-sailthru mv1 button-reset pa2'
                       })
                       .text('SELECT ALL')
                       .click(selectAll);

  var deselectAllButton = $('<button></button>')
                       .attr({
                        id: 'deselect-all-btn',
                        class: 'bg-sailthru mv1 button-reset pa2'
                       })
                       .text('DESELECT ALL')
                       .click(deselectAll);

  selectAllDiv = $(selectAllDiv).append(selectAllButton)
                                .append(deselectAllButton)

  $("#template-list-container").html(templateList)
                               .append(selectAllDiv);
}

// Submits template list to POST to target acct.
function submitTemplateList() {
  var allCheckboxes = [].slice.call(document.querySelectorAll('.template-checkbox'));
  var templatesToSubmit = allCheckboxes.filter(function(template) {
        return template.checked == true;
      })
      .map(function(x) { return x.name });

  if (templatesToSubmit.length == 0) {
    showErrorModal("Please select templates to transfer!");
    return;
  }

  showLoadingModal();

  $.ajax({
      method: 'POST',
      url: '/lifecycle',
      data: {
        list: templatesToSubmit,
        src: {
          apiKey: document.getElementById('src_key').value,
          secret: document.getElementById('src_secret').value
        },
        dest: {
          apiKey: document.getElementById('dest_key').value,
          secret: document.getElementById('dest_secret').value
        }
      },
      dataType: 'json',
      success: function(res) {
        console.log("RESPONSE: ", res);
        $(res).each(function(ind, str) {
          console.log(str);
          var li = $("<li></li>").text(str)
          $('#response-modal').append(li);
        })
        showResponseModal();
      },
      error: function(err) {
        console.log("ERROR: ", err.responseText);
        showErrorModal(parseResponseText(err.responseText));
      }
    })
}

// Select all templates
function selectAll() {
  var allCheckboxes = document.querySelectorAll(".template-checkbox");
  allCheckboxes.forEach(function(el) {
    el.checked = true;
  })
}

// Deselect all templates
function deselectAll() {
  var allCheckboxes = document.querySelectorAll(".template-checkbox");
  allCheckboxes.forEach(function(el) {
    el.checked = false;
  })
}

// Handles error messages in varying formats
function parseResponseText(str) {
  var startIndex = str.indexOf("<pre>") + 5;
  var endIndex = str.indexOf("<br>");
  return str.includes('<html>') ? str.substring(startIndex, endIndex) : "ERROR: " + str;
}

// Display error modal
function showErrorModal(str) {
  $('#error-modal').removeClass('no-display').text(str);
  $('#modal-container').removeClass('no-display');
  $('#loading-modal').addClass('no-display');
}

// Display response modal after submitting template list for transfer.
function showResponseModal(str) {
  $('#response-modal').removeClass('no-display');
  $("#close-modal").removeClass('no-display');
  $('#loading-modal').addClass('no-display');
}

// Hide all modals
function hideModal() {
  $('#error-modal').addClass('no-display').text('');
  $('#response-modal').addClass('no-display').html('');
  $('#modal-container').addClass('no-display');
  $('intro-modal').addClass('no-display').html('');
}

// Thrilling sailboat "animation".
function showLoadingModal() {
  $('#loading-modal').removeClass('no-display');
  $('#modal-container').removeClass('no-display');
  $("#close-modal").addClass('no-display');
}
