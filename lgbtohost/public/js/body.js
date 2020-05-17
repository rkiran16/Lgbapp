let next, prev, btnNext, email, fullName, statusbarz;
const rstatus = window.location.hash.replace('#', '');

window.onload = () => {
    fullName = document.getElementById("name");
    email = document.getElementById("email");
    btnNext = document.getElementById("btn-next");
    next = document.getElementById('form-next');
    prev = document.getElementById('form-prev');
    statusbarz = document.getElementById('status-bar');
    next.classList.toggle('u-hide');
    statusbarz.classList.toggle('u-hide');
};

const runNext = () => {
    prev.classList.toggle('u-hide');
    next.classList.toggle('u-hide');
};

runPrev = () => {
    next.classList.toggle('u-hide');
    prev.classList.toggle('u-hide');
};

checkEntry = () => {
    if (!fullName.validity.valid) {
        fullName.placeholder = "Please enter a name!";
    } else {
        if (!email.validity.valid) {
            email.placeholder = "Please enter a valid email";
        } else {
            runNext();
        }
    }
}

const controller = () => {
    let result;
    result = rstatus.replace(/%20/g, " ");
    if(result){
        statusbarz.classList.toggle('u-hide');
        statusbarz.innerHTML = result;
    
        setTimeout(() =>{
            statusbarz.classList.toggle('u-hide')
        }, 5000);
    }
}    

['hashchange', 'load'].forEach(event => window.addEventListener(event, controller));