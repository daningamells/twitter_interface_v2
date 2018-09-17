/*****************************************
Treehouse Fullstack Javascript Techdegree,
project #7: "Build a Twitter Interface"
******************************************

/*****************************************
Requiring everthing needed and declaring
global variables
*****************************************/

const express = require('express');
const app = express();

const Twit = require('twit')
const token = require('./config.js');
const T = new Twit(token);

const bodyParser = require('body-parser');
const path = require('path');
var viewPath = path.join(__dirname, '/views');

//Setting up public folder for CSS and Images
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({
  extended: true
}));

//Setting Pug as view engine
app.set('views', viewPath);
app.set('view engine', 'pug');

let profileData = {};
let timelineData = [];
let friendsData = [];
let directMessagesData = [];

/*****************************************
Treehouse Fullstack Javascript Techdegree,
project #7: "Build a Twitter Interface"
******************************************/

app.use((req, res, next) => {
  T.get('account/verify_credentials', (err, data, response) => {
    if (!err) {
      const username = data.screen_name;
      const profilPicture = data.profile_image_url;
      const bannerPicture = data.profile_banner_url;
      const followersCount = data.followers_count;
      const name = data.name;
      const profData = {
        username: username,
        profilPicture: profilPicture,
        bannerPicture: bannerPicture,
        followersCount: followersCount,
        name: name
      };
      profileData = profData;
      next();
    } else {
      console.log('Account failed: ' + err.message);
      next(err); //engage error handler with current error
    }
  });
});

app.use((req, res, next) => {
  T.get('statuses/user_timeline', {
    count: 5
  }, function(err, data, response) {
    timelineData = [];
    if (!err) {
      for (var i = 0; i < 5; i++) {
        const dateSent = data[i].created_at.substr(0, 10);
        const yearSent = data[i].created_at.substr(26, 30);
        const fullDate = dateSent + ' ' + yearSent;
        const tweetInfo = {
          text: data[i].text,
          created_at: fullDate,
          username: data[i].user.screen_name,
          profilPicture: data[i].user.profile_image_url,
          retweets: data[i].retweet_count,
          like: data[i].favorite_count,
        };
        timelineData.push(tweetInfo);

      }
    } else {
      console.log('Timeline failed: ' + err.message);
      next(err); //engage error handler with current error
    }
    next();
  });
});

app.use((req, res, next) => {
  T.get('followers/list', {
    count: 5
  }, function(err, data, response) {
    if (!err) {
      for (var i = 0; i < 5; i++) {
        const friends = {
          realName: data.users[i].name,
          screenName: data.users[i].screen_name,
          profilePicture: data.users[i].profile_image_url
        };
        friendsData.push(friends);
      }
    } else {
      console.log('Followers failed: ' + err.message);
      next(err); //engage error handler with current error
    }
    next();
  });
});

app.use((req, res, next) => {
      T.get('direct_messages', {
        count: 5
      }, function(err, data, response) {
        if (!err) {
          for (var i = 0; i < 5; i++) {
            // Date format
            const dateSent = data[i].created_at.substr(0, 10);
            const yearSent = data[i].created_at.substr(26, 30);
            const fullDate = dateSent + ' ' + yearSent;
            // Time format
            const timeSent = data[i].created_at.substr(11, 9);
            const message = {
              text: data[i].text,
              profilPictureSender: data[i].sender.profile_image_url,
              senderUsername: data[i].sender.screen_name,
              fullDate: fullDate,
              timeSent: timeSent
            };
            directMessagesData.push(message)

          }
        } else {
          console.log('Direct messages failed: ' + err.message);
          next(err); //engage error handler with current error
        }
        next();
      });
    });

/*****************************************
    Routing
    Set up routes for the home & error pages
*****************************************/

    app.get('/', (req, res) => {
      timelineData = timelineData.slice(0, 5);
      friendsData = friendsData.slice(0, 5);
      directMessagesData = directMessagesData.slice(0, 5);
    res.render('index', { //render index.pug with all Twitter data
        timelineData: timelineData,
        friendsData: friendsData,
        directMessagesData: directMessagesData,
        profileData: profileData
    });
});

/*****************************************
    Form post request
*****************************************/

app.post('/', (req, res, next) => {
  // If a tweet exists, fill in the status and then redirect
  if (req.body.tweet) {
    T.post('statuses/update', { status: req.body.tweet }, (err, data, response) => {

      return res.redirect('/');
      next()
    });
  // Otherwise redirect the user
  } else {
      return res.redirect('/');
      next(err);
  }
});

/*****************************************
    ERROR HANDLING
    making a 404 error & handling errors
*****************************************/

// 404 error
app.use((req, res, next) => {
    const err = new Error ('Page not found.'); //generate the error
    next(err); //pass error to error handler
});

//our error handler middleware
app.use((err, req, res, next) => { //called by doing a next(err)
    res.render('error', { error : err }); //render error.pug with current "err" object
});

/*****************************************
    Setting up the server
*****************************************/

    app.listen(3000, () => {
      console.log('the application is running3');
    });
