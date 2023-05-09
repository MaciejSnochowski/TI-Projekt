function hamburgerHandler(){;
    console.log("init D word");
    const ToggledOn= '"w-full" id="navbar-hamburger"';
    const ToggledOff='"hidden w-full" id="navbar-hamburger"';

    const checkBox= document.getElementById('checkbox-id');
    const nav=document.getElementById('my-navbar-hamburger');
  //  const checkBox= document.querySelector('#checkbox-id')
    if(checkBox.checked== true){
        console.log("true")
        
    }else{console.log('false')}
  

}
async function checkBox_handler(){
    const nav=document.getElementById('my-navbar-hamburger');
    const checkBox= document.getElementById('checkbox-id');
    if(checkBox.checked== true){
      //  nav.classList.remove('my-hidden');
    
        nav.classList.remove('hidden');
        nav.classList.remove('my-hidden-d');
        console.log("true");
        nav.classList.add('my-hidden')
        
    }else{// nav.classList.add('my-hidden');
        nav.classList.remove('my-hidden');
        nav.classList.add('my-hidden-d');
        await new Promise(r=>setTimeout(r,2200));
        nav.classList.add('hidden');
    console.log("false");}

}