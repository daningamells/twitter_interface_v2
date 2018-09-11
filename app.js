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

let profileData = [];
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
      const profData = {
        username: username,
        profilPicture: profilPicture,
        bannerPicture: bannerPicture,
        followersCount: followersCount
      };
      profileData.push(profData);
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
        next();
      }
    } else {
      console.log('Timeline failed: ' + err.message);
      next(err);
    }
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
          profilPicture: data.users[i].profile_image_url
        };
        friendsData.push(friends);
        next();
      }
    } else {
      console.log('Followers failed: ' + err.message);
      next(err);
    }
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
            next();
          }
        } else {
          console.log('Direct messages failed: ' + err.message);
          next(err);
        }
      });
    });

    app.get('/', (req, res) => {
    res.render('index', { //render index.pug with all Twitter data
        timelineData: timelineData,
        friendsData: friendsData,
        directMessagesData: directMessagesData,
        profileData: profileData
    });
});

    app.listen(3000, () => {
      console.log('the application is running3');
    });
