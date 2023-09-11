// ==UserScript==
// @name        eBay easy item ID
// @namespace   pnppl
// @match       http*://www.ebay.*/itm/*
// @match       http*://ebay.*/itm/*
// @grant       none
// @version     1.1
// @author      pnppl
// @description Puts the item ID under the title with buttons for copying it and the cleaned URL
// @license     MIT
// ==/UserScript==

const url = window.location.href;
const reItm = /.*\/([0-9]{12})/;
const itm = url.match(reItm)[1];
const reTLD = /^https?:\/\/(?:www.)?(ebay\.[a-z]{2,3}(?:\.[a-z]{2,3})?)/i;
const tld = url.match(reTLD)[1];
const cleanURL = `https://${tld}/itm/${itm}`;
const titleMob = document.querySelector("#vi-frag-app-title");
const titleDesk = document.querySelector(".x-item-title");
const newHTML = `               \
    <style>                     \
        button:focus.userjs {   \
            background:lime;    \
        }                       \
    </style>                    \
    <div>                       \
        <p>                     \
            ${itm} <button class="userjs" onclick="navigator.clipboard.writeText('${itm}')">📋</button> <button class="userjs" onclick="navigator.clipboard.writeText('${cleanURL}')">🔗</button> \
        </p>                    \
    </div>                      \
`;

if (titleMob == null) {
    titleDesk.insertAdjacentHTML("afterend", newHTML);
} else {
    titleMob.insertAdjacentHTML("afterend", newHTML);
}