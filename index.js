var ajaxCallURL='';
var protocal = 'main';
var currentUser;

//default admin user
//store in local storage
// var users = [
//     {
//       admin: '123456',
//       id: 1,
//       favoriteImages: []
//     }];
// window.localStorage.setItem('users',JSON.stringify(users));

//retrieve users object
var users = JSON.parse(window.localStorage.getItem('users'));
if(!users){users=[];}
ajaxCall();

//ajax call method
function ajaxCall (imgID){
    if(imgID){
        ajaxCallURL=`https://api.pexels.com/v1/photos/${imgID}`;
    }else{
        ajaxCallURL='https://api.pexels.com/v1/curated/?page=1&per_page=15';
    }
    $.ajax({
        method:'GET',
        datatype: 'json',
        beforeSend: function(xhr){
        xhr.setRequestHeader ('Authorization', '563492ad6f91700001000001d01e8b73946e44f0827235723b4f8d8a');
        },
        url: ajaxCallURL,
        success: function (data){
        loadMainPage(data);
        },
        error: function (error){
        console.log(error);
        }
    });
    
}

function loadMainPage(data){ 
  //detach everything from body
  $('div').detach();

  if(protocal==='main'){
        //load header
        console.log(data);
        var photos=data.photos;
        $header = $('<div class="header"></div>');
        $webName = $('<div><h1>Instar Gram</h1></div>');
        $seeFavorite = $('<button class="favorite">List All Favorite</button>');
        $logIn=$('<button class="login">Log In</button>');
        $register=$('<button class="register">Register Now</button>');
        $logout=$('<button>Log out</button>');

        //check if there is any user login through global variable isAnyUserLogin
        if(currentUser){
          //if yes, then append web name, favorite button and log out button
          $header.append($webName).append(`<div><h2>${currentUser.username}</h2></div>`).append($seeFavorite).append($logout);
        }else{
          //if no user login, then append log in button and register button
          $webName.append($logIn).append($register);
          $header.append($webName);
        }

        //when click login button, jump to log in page
        $logIn.on('click',function(){
            protocal='login';
            loadMainPage();
        })

        //when click register button, jump to register page
        $register.on('click',function(){
            protocal='register';
            loadMainPage();
        })

        $logout.on('click',function(){
            currentUser=undefined;
            protocal='main';
            ajaxCall();
        })

        $('body').prepend($header);

        //load artist and art
        $display = $('<div class="display"></div>');
        for(var i=0; i<photos.length; i++){
            $photoDiv=$('<div class="photo"></div>');
            $photographer=$(`<h2 class="name">${photos[i].photographer}</h2>`);
            var $photo = $(`<img class="${photos[i].id}" src="${photos[i].src.medium}" alt="${photos[i].alt}" />`);
            $photoDiv.append($photographer).append($photo);
            $photoDiv.append(`<button id="${photos[i].id}" class="zoomIn">Zoom In</button>`);
            $display.append($photoDiv);
        }
        $('body').append($display);

        //when click zoom in button, zoom image in to landscape size
        $('.zoomIn').on('click',function(e){
            protocal='detail';
            ajaxCall(e.target.id);
        });

        //add image to favorite list by double clicking
        $('img').on('dblclick',function(e){
            if(currentUser){
            var landscapeURL = e.target.src.slice(0,-5);
            var favorite = {
                url: landscapeURL+'fit=crop&h=627&w=1200',
                id: e.target.className
            };
            currentUser.favoriteImages.push(favorite);
            users[currentUser.id-1]=currentUser;
            window.localStorage.setItem('users',JSON.stringify(users));
            window.alert('Added to your favorite');
            // window.localStorage.setItem()
            }else{
                window.alert('Directing you to log in page');
                protocal='login';
                loadMainPage();
            }
        });

        //when click favorite button, show current login username and his favorite list of art
        $('.favorite').on('click',function(){
            //check if current login user has a favorite list, if not, alert the user
            currentUser.favoriteImages=users[currentUser.id-1].favoriteImages;
            if(currentUser.favoriteImages.length===0){
                window.alert(`You don't have a favorite image yet!\nDouble Click an image to add to your favorite list.`)
            //if yes, load the favorite list
            }else{
                protocal='favorite';
                loadMainPage();   
            }
        });
    //display detail of img
    }else if(protocal==='detail'){
        $('body').append(`<div><img src="${data.src.landscape}" alt="${data.alt}" /></div>`);
        $('body').append('<div><button class="goback">Go Back</button></div>');
        $('.goback').on('click',function(){
            //GET Method again
            protocal='main';
            ajaxCall();
        });

    //display favorite List
    }else if(protocal==='favorite'){
        $username=$(`<div><h1>${currentUser.username}'s Favorite Images</h1></div>`);
        $('body').append($username);
        for(var i=0;i<currentUser.favoriteImages.length;i++){
            $img = $(`<div><img src="${currentUser.favoriteImages[i].url}"/></div>`);
            $dislikeButton = (`<button class="dislike" id="${i}">Dislike</button>`);
            $username.append($img).append($dislikeButton);
        }
        //dislike button onclick
        $('.dislike').click(function(e){
            currentUser.favoriteImages.splice(e.target.id,1);
            users[currentUser.id-1]=currentUser;
            window.localStorage.setItem('users',JSON.stringify(users));
            if(currentUser.favoriteImages.length===0){
                protocal='main';
                ajaxCall();
            }else{
                protocal='favorite';
                loadMainPage(); 
            }         
        })
        $('body').append($username);
        $('body').append('<div><button class="goback">Go Back</button></div>');
        $('.goback').on('click',function(){
            //GET Method again
            protocal='main';
            ajaxCall();
        });
    }else if(protocal==='login'){
        //load login page
        $loginPageTitle=$('<div><h1>Log In Page</h1></div>');
        $username=$('<div>username: <input class="username"></input></div>');
        $password=$('<div>password: <input class="password"></input></div>');
        $loginButton=$('<div><button class="login">log In</button></div>');
        $registerButton = $('<div><button class="register">Register</button></div>');
        $cancel=$('<div><button class="cancel">cancel</button></div>');
        $('body').append($loginPageTitle).append($username).append($password).append($loginButton).append($registerButton).append($cancel);
        
        //when click login button
        $('.login').on('click', function(){
            //check if the system has any account exist
            if(users.length===0){
                window.alert('Please Register First!');
                protocal='register';
                loadMainPage();
            }else{
                //check if both input fields have value
                if($('.username').val() && $('.password').val()){
                    for(var i=0;i<users.length;i++){
                        //check if username and password match the system, if yes set isAnyUserLogin to true
                        if(users[i][$('.username').val()]===$('.password').val()){       
                            currentUser=users[i];
                            currentUser.username=$('.username').val();
                        }
                    }
                    //if userLogin is true, log in successed and load the main page
                    if(currentUser){
                        protocal='main';
                        ajaxCall();
                    //if no, alert the user
                    }else{
                        window.alert('username and password doesn\'t match');
                    }
                    
                //didn't put text in username and password field
                }else{
                    window.alert('Make sure both fields are filled');
                }
            }
        });

        //register button take you to register page
        $('.register').on('click',function(){
            protocal='register';
            loadMainPage();
        });

        //cancel button take you to main page
        $('.cancel').on('click',function(){
            protocal='main';
            ajaxCall();
        });
    }else if(protocal==='register'){
        $registerPage=$('<div><h1>Register Page</h1></div>');
        $username=$('<div>username: <input class="username"></input></div>');
        $password=$('<div>password: <input class="password1"></input></div>');
        $passwordAgain=$('<div>enter again:<input class="password2"></input></div>');
        $registerButton=$('<div><button class="register">Register</button></div>');
        $cancel=$('<div><button class="cancel">cancel</button></div>');
        $('body').append($registerPage).append($username).append($password).append($passwordAgain).append($registerButton).append($cancel);
        
        $('.register').on('click', function(){
            //check if username already exist
            var userExist = false;
            for(var i=0;i<users.length;i++){
                if($('.username').val() in users[i]){
                    userExist=true;
                }
            }
                //if username exist, then alert the user
                if(userExist){
                    window.alert('username already existed!!!');
                //if username doesn't already exist
                }else{
                    //check if all input fields have value
                    if($('.username').val() && $('.password1').val() && $('.password2').val()){
                        //check if passwords match each other
                        if($('.password1').val()===$('.password2').val()){
                            //add new user
                            var user = {};
                            var username =$('.username').val();
                            var password=$('.password1').val();
                            user[username] = password;
                            user.favoriteImages=[];
                            user.id=users.length+1;
                            user.username=$('.username').val();
                            users.push(user);
                            window.alert('Account register successfully, please log in.')
                            window.localStorage.setItem('users',JSON.stringify(users));
                            protocal='login';
                            loadMainPage();
                        //passwords don't match
                        }else{
                            window.alert(`password don't match each other!`);
                        }
                    //didn't put text in username or both password fields
                    }else{
                        window.alert('Make sure all fields are filled');
                    }
                }
        });

        $('.cancel').on('click',function(){
            protocal='main';
            ajaxCall();
        });
    }
};