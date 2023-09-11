// ==UserScript==
// @name        eBay mobile easy item ID
// @namespace   pnppl
// @match       https://www.ebay.com/itm/*
// @grant       none
// @version     1.0
// @author      pnppl
// @description Puts the item ID under the title with buttons for copying it and the cleaned URL
// @license     MIT
// ==/UserScript==

const url = window.location.href;
const re = /.*\/itm\/([0-9]*)/;
const itm = url.match(re)[1];
const cleanURL = `https://www.ebay.com/itm/${itm}`;
const title = document.querySelector("#vi-frag-app-title");
const newHTML = `               \
    <style>                     \
        button:focus.userjs {   \
            background:lime;    \
        }                       \
    </style>                    \
    <div class="vi-sellerinfo"> \
        <p>                     \
            ${itm} <button class="userjs" onclick="navigator.clipboard.writeText('${itm}')">📋</button> <button class="userjs" onclick="navigator.clipboard.writeText('${cleanURL}')">🔗</button> \
        </p>                    \
    </div>                      \
`;

title.insertAdjacentHTML("afterend", newHTML);
