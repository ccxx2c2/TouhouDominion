"use strict";
//init page
$("#loginModal").modal("show");
$("#announceModal").modal("hide");
for(let i = 0; i < ROOMAMOUNT; i+=1){
  $("#roomnumber").append(`<option value='${i}'>${i}</option>`)
}

function register(){ // emit:register
  // global username
    $(".alert.alert-danger").hide();
    $(".alert.alert-success").hide();
    username = $('#username').val();
    socket.emit('register',{
        username: username,
        password: $('#password').val()
    });

}

function login(){//emit: verifyWaiting
  // global username,room
    $(".alert.alert-danger").hide();
    $(".alert.alert-success").hide();
    if($('#roomnumber').val() === null){
        $(".alert.alert-danger").text("请选择房间！").show();
        return;
    }
    username = $('#username').val();
    room = $('#roomnumber').val();
    socket.emit('verifyWaiting',{
        username: username,
        password: $('#password').val(),
        room: room,
        type: "new"
    });
}

/* data: valid, errorcode
 * callee:
 */
socket.on('registered', (data) => {
    if(data.valid){
        $("#loginModal").find(".alert.alert-success").text("注册成功！").show();
    }
    else{
        if(data.errorcode === 1){
            $("#loginModal").find(".alert.alert-danger").text("暂不开放注册！").show();
            return;
        }
    }
});

$("#loginModal").keyup(function(event){
    if(event.keyCode === ENTER){
        login();
    }
});
