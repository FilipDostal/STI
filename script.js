const phrase = "Ještě s něcím mohu pomoci?"
const phraseEN = "Anything else I can help you with?"
let timeout;

function submitClick(){
    var div = document.getElementById("chat-window");
    const txt = document.createElement("li");
    const msg = document.getElementById("text").value;
    const txt_node = document.createTextNode(msg);
    txt.appendChild(txt_node);
    document.getElementById("chat-window").appendChild(txt);
    clearTimeout(timeout);
    timeout = setTimeout(showPhrase, 30000);
    const lang = document.getElementById("language").innerHTML;
    fetch('/dotaz?cmd=' + msg + '&lang=' + lang, {method: 'GET'}).then(function(response){
        if(response.ok){
            response.text().then(function(res){
                console.log(res);
            const txt2 = document.createElement("li");
            const txt_node2 = document.createTextNode(res);
            txt2.appendChild(txt_node2);
            document.getElementById("chat-window").appendChild(txt2);
            });
            return response.text;
        }
        throw new Error('FAILED');
    }).then(function(html){console.log(html);}).catch(function(err){console.log(err);});

}

function changeL(){
    const lang = document.getElementById("language").innerHTML;
    if(lang == "1"){
        document.getElementById("language").innerHTML = "0";
        document.getElementById("btn1").innerHTML = "Send";
        document.getElementById("btn2").innerHTML = "CZ";
        document.getElementById("msg").innerHTML = "Enter your msg here:";

    }
    else{
        document.getElementById("language").innerHTML = "1";
        document.getElementById("btn1").innerHTML = "Odeslat ";
        document.getElementById("btn2").innerHTML = "EN";
        document.getElementById("msg").innerHTML = "Zde můžete psát:";

    }

}

function showPhrase(){
    const txt = document.createElement("li");
    const txt_node = document.createTextNode(phrase);
    txt.appendChild(txt_node);
    document.getElementById("chat-window").appendChild(txt);

}
