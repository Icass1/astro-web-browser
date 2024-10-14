import { atom } from 'nanostores';

let viewIndex = "big"

if (typeof localStorage !== "undefined") {
    viewIndex = localStorage.getItem("viewIndex") || "big"
}


const $viewIndex = atom(viewIndex);


if (typeof localStorage !== "undefined") {
    $viewIndex.subscribe(a => {
        localStorage.setItem("viewIndex", a)
    })
}

export { $viewIndex } 