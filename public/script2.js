function greet() {
    const txt = document.createElement("li");
    const txt_node = document.createTextNode("Ahoj jak ti můžu pomoci");
    txt.appendChild(txt_node);
    document.getElementById("chat-window").appendChild(txt);

}


document.addEventListener('DOMContentLoaded', (event) => {
    greet();
});