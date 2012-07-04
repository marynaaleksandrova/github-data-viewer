$(function(){
    window.currentUser = null;
    
    function getLocalStorageState() {   
      var checkboxStateStr = localStorage.getItem('checkboxStateStr');
      if ( checkboxStateStr == undefined) {
        return {
          'created': false,
          'updated': false,
          'size': false,
          'watchers': false,
          'wiki': false,
          'issues': false,
          'forks': false,
        };
      } else {
        return JSON.parse(checkboxStateStr);
        console.log(checkboxState);
      }
    }

    var checkboxState = {
      'created': false,
      'updated': false,
      'size': false,
      'watchers': false,
      'wiki': false,
      'issues': false,
      'forks': false,
    };
    
    function getLocalStorageData(key) {   
      var key = localStorage.getItem(key);
      if ( key == undefined) {
        return [];
      } else {
        return JSON.parse(key);
      }
    }
    
    var reposContainer = $("#repos");
    var usernames = getLocalStorageData('usernamesStr');
    var userOrgContainer = $('#user-organizations');
    var userInfoContainer = $('#main-user-info');
      
    var i = 0;
    for (; i < usernames.length; i++) {
      $('#recent-usernames').append("<a href='#'>" + usernames[i] + "</a><br/>");
    }
    
    function showUserInfo(username) {
      currentUser = username;

      $('#repos').html('');

      $('#login-form').addClass('invisible');
      $('#user-info').addClass('visible');

      usernames.unshift(username);
      usernames = _.uniq(usernames);
      
      localStorage.setItem('usernamesStr', JSON.stringify(usernames));

      var userInfoTpl = _.template($('#user-info-tpl').html());

      $.getJSON("https://api.github.com/users/" + username, function(info) {
        userInfoContainer.html('');
        var html = userInfoTpl(info);
        userInfoContainer.append(html);
      });

      var userOrgTpl = _.template($('#user-and-orgs-tpl').html());

      $.getJSON("https://api.github.com/users/" + username + "/orgs", function(orgs) {
        userOrgContainer.html('');
        var i = 0;
        for (; i < orgs.length; i++) {
          var html = userOrgTpl(orgs[i]);
          userOrgContainer.append(html);
        }
      });
    
      var reposItemTpl = _.template($("#repositories-tpl").html());
      
      $.getJSON("https://api.github.com/users/" + username + "/repos", function(repos) {
        var i = 0;
        for (; i < repos.length; i++) {
          var html = reposItemTpl(repos[i]);
          reposContainer.append(html);
        }
        checkboxState = getLocalStorageState();
        var checkboxes = $("input[type='checkbox']");
        var i = 0;
        for (; i < checkboxes.length; i++) {
          var identifier = $( checkboxes[i] ).attr('value');
          checkboxes[i].checked = checkboxState[identifier];
          if (checkboxState[identifier] == true) {
            $('.' + identifier).removeClass('invisible').addClass('visible-cell');
          }
        }
      });
    }
    
    $("#options").on("click", "input[type='checkbox']", function(){
      if ( $(this).prop('checked') == true ) {
      
        var className = $(this).attr('value');
        $('.' + className).removeClass('invisible').addClass('visible-cell');
        checkboxState[className] = true;
        localStorage.setItem('checkboxStateStr', JSON.stringify(checkboxState));
        
      } else if ( $(this).prop('checked') == false ) {
      
        var className = $(this).attr('value');
        $('.' + className).removeClass('visible-cell').addClass('invisible');
        checkboxState[className] = false;
        localStorage.setItem('checkboxStateStr', JSON.stringify(checkboxState));
      }
    });
    
    reposContainer.on('click', '.history-btn', showHistory);
      
    function showHistory(){
     
      var commitsUrl = $(this).parent().find("h1").html();
      var commitItemTpl = _.template($("#commits-history").html());
      var commitsHtml = '<ul class="history">';
      
      $.getJSON("https://api.github.com/repos/" + currentUser + "/" + commitsUrl + "/commits", function(commits) {
        var i = 0;
        for (; i < commits.length; i++) {
          var html = commitItemTpl(commits[i]);
          commitsHtml += html; 
        }
        commitsHtml += "</ul>";
        new ui.Dialog({title: "Commits' history",  message: $(commitsHtml)}).closable().overlay().show();
      });
    }

    $('tbody').on('click', 'td.name a', function(e){
      e.preventDefault();
    });

    $('tbody').on('click', 'tr', function(){
      var repoName = $(this).find("a").attr('href');
      page(repoName);
    });
    
    $("#show-repos-btn").on("click", function(){
      var username = $('#username-input').val();
      if (username.length) {
        page('/repos/' + username);
        $("#username-input").val('');
      } else {
        alert ('Enter username');
      }
    });

    $("#username-input").keypress(function(e) {
    
      if(e.keyCode == 13) {
        e.preventDefault();
        var username = $('#username-input').val();
        if (username.length) {
          page('/repos/' + username);
          $("#username-input").val('');
        } else {
          alert ('Enter username');
        }
      }
    });
    
    $('#recent-usernames').on("click", "a", function(e){
      e.preventDefault();
      var username = $(this).text();
      page('/repos/' + username);
      $("#username-input").val('');
    });

    page('/repos/:username', function(ctx){
      var username = ctx.params.username;
      showUserInfo(username);
    });

    page('/repos/:username/:repoName', function(ctx){
      var repoName = ctx.params.repoName;
      var username = ctx.params.username;
      $('#login-form').removeClass('visible').addClass('invisible');
      $('#user-info').removeClass('visible').addClass('invisible');
      $('#repo-info').removeClass('invisible').addClass('visible');
      var repoInfoContainer = $('#repo-info').html('');
      repoInfoContainer.repo({user: username, name: repoName});
    });

    page('', function(){
      $('#login-form').removeClass('invisible').addClass('visible');
      $('#user-info').removeClass('visible').addClass('invisible');
    });
    page.start({ click: false });
    
	});