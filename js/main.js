var onAuthorize = function() {
    updateLoggedIn();

    getBoards();
};

var getBoards = function() {
  Trello.get('members/me/boards', function(r) {
    $('#boards ul').empty();
    for(i in r) {
      b = r[i];
      $('<li/>')
      .attr({
        'data-id': b.id
      })
      .on('click', boardClicked)
      .text(b.name)
      .appendTo($('#boards ul'));
    }
  });
};

var boardClicked = function() {
  $('#lists ul, #cards ul').empty();
  id = $(this).attr('data-id');
  getLists(id);
  getMembers(id);
};

var members = [];
var getMembers = function(id) {
  Trello.get('boards/' + id + '/members', function(r) {
    members = r;
  });
};

var getLists = function(id) {
  Trello.get('boards/' + id + '/lists', function(r) {
    for(i in r) {
      l = r[i];
      $('<li/>')
      .attr({
        'data-id': l.id
      })
      .on('click', listClicked)
      .text(l.name)
      .appendTo($('#lists ul'));
    }
  });
}

var listClicked = function() {
  $('#cards ul').empty();
  id = $(this).attr('data-id');
  getCards(id);
}

var getCards = function(id) {
  Trello.get('lists/' + id + '/cards', function(r) {
    for(var i in r) {
      c = r[i];
      // parse points out of name
      var points = c.name.split('[');
      if (points[1]) {
        points = points[1].replace(']', '').split(' ')[1]; //TODO: <3 potential runtime error
      } else {
        points = '';
      }

      // remove points from name
      c.name = c.name.split('[')[0]

      card = $('<div/>')
      .attr({
        'data-id': c.id
      })
      .addClass('card')
      .append(
        $('<div/>')
        .addClass('inner')
        .append(
          $('<div/>')
          .addClass('gradient')
        )
        .append(
          $('<h2>')
          .text(c.name)
        )
        .append(
          $('<div/>')
          .html(marked(c.desc))
        )
      );

      card.append(
        $('<span/>')
        .addClass('points')
        .html(points)
      );

      //process assigned members
      memberSection = $('<ul/>').addClass('members');
      for(var j in c.idMembers) {
        m = c.idMembers[j];
        member = _.find(members, function(mem) {
          return mem.id == m;
        });
        if(!member) continue;
        memberSection.append(
          $('<li/>')
          .text(member.fullName.split(' ')[0])
        );
      }
      card.append(memberSection);

      card.appendTo($('#cards'));
      if((parseInt(i)+1) % 4 == 0) {
        $('#cards').append($('<div class="clear"/>'));
      }
    }
  });
};

var updateLoggedIn = function() {
    var isLoggedIn = Trello.authorized();
    $("#loggedout").toggle(!isLoggedIn);
    $("#loggedin").toggle(isLoggedIn);
};

var logout = function() {
    Trello.deauthorize();
    updateLoggedIn();
};

$(function() {

  Trello.authorize({
      interactive:false,
      success: onAuthorize
  });

  $("#connectLink")
    .click(function(){
      Trello.authorize({
          type: "popup",
          name: 'Trello Printer',
          expiration: 'never',
          success: onAuthorize
      })
  });

  $("#disconnect").click(logout);
});
