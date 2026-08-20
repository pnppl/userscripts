// ==UserScript==
// @name        Discourse Lite
// @namespace   pnppl
// @version     0.11
//
// @match       https://discourse.org/
// @include     /^https://discourse[.][^/]*?/.*?$/
// @include     /^https://meta[.]discourse[.]org/.*?$/
// @grant       none
//
// @author      pnppl
// @description Redirects Discourse links to minimal version and adds back a few missing features
// @run-at document-start
// ==/UserScript==

const postAvatars = true;
const latestAvatars = true;
const allCategoryAvatars = false;

// /raw... or .../print
const goodPathRegex = /(^[/](raw|chat|search)[/]?)|([/]preferences[/]?)|([/](print)[/]?$)/;
// ...?_escaped_fragment_
const goodSearchRegex = /[?&](_escaped_fragment_|DLfull=true)$/;
// ...?page=n
const pageSearchRegex = /[?&]page=([0-9]+)/;
// .../c/name/cat
const catRegex = /^[/]c[/][^/]+[/]([0-9]+)[/]?$/;
// .../t/name/thread
const threadRegex = /^[/]t[/][^/]+[/]([0-9]+)[/]?$/;
// .../t/name/thread/post
const postRegex = /^[/]t[/][^/]+[/][0-9]+[/]([0-9]+)[/]?$/;
// ../print
const printRegex = /[/]print[/]?$/;
const fullPathRegex = /(^[/](chat|search))|([/]preferences[/])/;
const fullSearchRegex = /[?&]DLfull(=true)?$/;

const currURL = document.location;

const css = `
  html,
  header,
  thead th,
  .category,
  .category div,
  .topics,
  .topics div,
  .topic-list-item,
  .topic-list-item p,
  .replies .posts,
  .views,
  .views + td {
    background: #eee !important;
    color: initial !important;
    cursor: revert !important;
  }
  body.crawler span:has(>a),
  body.crawler a,
  body.crawler a * {
    color: blue !important;
  }
  body.crawler span:has(>a:visited),
  body.crawler a:visited,
  body.crawler a:visited * {
    color: purple !important;
  }
  a:focus,
  a:focus-visible {
    outline: revert !important;
  }
  body,
  #main-outlet {
    max-width: 80ch;
    margin: auto;
  }
  header,
  h1,
  nav,
  .topic-category {
    text-align: center;
  }
  .DLavatar {
    margin-right: 1ch;
    border: 1px solid black;
  }
  .DLdate {
    text-wrap: nowrap;
  }
  blockquote,
  aside.quote,
  aside.onebox,
  a.mention {
    color: #eee !important;
    background: gray !important;
  }
  .post-likes {
    color: crimson;
    font-size: 0.9em;
    font-family: sans-serif;
    font-weight: bold;
/*    display: block;
    width: fit-content;
    margin-left: auto; */
  }
  .DLreply {
    display: block;
    width: fit-content;
    margin-left: auto;
  }
  a[rel='next'] {
    float: right;
  }
  .loadButton {
    display: block;
    width: fit-content;
    margin: auto;
    text-align: center;
  }
  #DLsearch {
    width: 100%;
  }
  iframe {
    width: 100%;
    height: 100%;
  }
  .powered-by-link {
    display: none !important;
  }
  /* hide TOS links */
  footer nav ul li:nth-child(4),
  footer nav ul li:nth-child(5),
  footer nav ul li:nth-child(6) {
    display: none !important;
  }
  @media (prefers-color-scheme: dark) {
    html,
    header,
    thead th,
    .category,
    .category div,
    .topics,
    .topics div,
    .topic-list-item,
    .topic-list-item p,
    .replies .posts,
    .views,
    .views + td {
      background: black !important;
    }
    body.crawler span:has(>a),
    body.crawler a,
    body.crawler a * {
      color: linkText !important;
    }
    body.crawler span:has(>a:visited),
    body.crawler a:visited,
    body.crawler a:visited * {
      color: visitedText !important;
    }
  }
`;
var moreCSS = '';
if (latestAvatars) {
  moreCSS = `
  body.crawler .topic-list td.posters {
    display: revert;
  }
  body.crawler .topic-list td.posters .avatar {
    display: none;
  }
  body.crawler .topic-list td.posters .latest {
    display: block;
    word-break: break-all;
    float: none;
  }
  body.crawler .topic-list td.posters .latest .avatar {
    display: inline;
  }
`;
}
if (allCategoryAvatars) {
  moreCSS = `
  /* unhide avatars from topic list */
  body.crawler .topic-list td.posters {
    display: revert;
  }
`;
}

function insertCSS() {
		const newStyle = document.createElement("style");
		newStyle.innerHTML = css + moreCSS;
		try {
      document.head.appendChild(newStyle);
    } catch (err) {
      console.log("shit hasn't loaded yet");
    }
}

function killJS() {
  const meta = document.createElement('meta');
  meta.httpEquiv = 'Content-Security-Policy';
  meta.content = "script-src 'none'";
  try {
    document.head.insertBefore(meta, document.head.firstChild);
  } catch (err) {
    console.log("not loaded");
  }
}


// --> asap <--
if (currURL.pathname.match(fullPathRegex) || currURL.search.match(fullSearchRegex)) {
  const enableDL = document.createElement("a");
  enableDL.href = currURL.origin + currURL.pathname + "?_escaped_fragment_";
  if (currURL.fragment) {
    enableDL.href += currURL.fragment;
  }
  enableDL.innerText = "[L]ite version";
  enableDL.accessKey = "l";
  document.body.insertBefore(enableDL, document.body.firstChild);
  return;
}
insertCSS();
window.print = function() {
  console.log("Print dialog blocked");
};
killJS();
//////////////////////////////


function rewrite(url) {
  try {
    if (url.pathname.match(goodPathRegex) || url.search.match(goodSearchRegex) || !url.origin.match(currURL.origin)) {
      console.log("URL already good, no need to rewrite");
    } else {
      console.log("No matches, rewriting to fragment view");
      if (url.search.match(pageSearchRegex)) {
        url.search += "&_escaped_fragment_";
      } else {
        url.search = '?_escaped_fragment_';
      }
    }
  } catch (err) {
    console.log(err);
  }
  return url;
}

function getPage(url) {
  const page = url.search.match(pageSearchRegex);
  if (page === null) {
    return 1;
  }
  return page[1];
}

function rewriteLocation(location) {
  const newURL = rewrite(location);
  if (newURL != location) {
    location.replace(newURL);
  }
}

function rewriteLinks() {
  links = document.querySelectorAll('a');
  for (i in links) {
    try {
      links[i].href = rewrite(new URL(links[i].href));
    } catch (err) {
      console.log("missing href");
    }
  }
}

function onLoad() {
  // insert CSS and kill JS again on load
  insertCSS();
  killJS();
  rewriteLinks();

  //--- HTML fixes
  // link to full version of any page in header
  const fullLink = document.createElement("a");
  fullLink.href = currURL.origin + currURL.pathname + "?DLfull=true";
  if (currURL.fragment) {
    fullLink.href += currURL.fragment;
  }
  fullLink.target = "_blank";
  fullLink.innerText = "[F]ull version";
  fullLink.accessKey = "f";
  document.getElementsByTagName("header")[0].appendChild(fullLink);

  // next/prev
  try {
    const next = document.querySelector("a[rel='next']");
    next.accessKey = "n";
    next.innerText = "[n]ext page →";
    navParent = next.parentNode.parentNode.parentNode.parentNode;
  } catch {
    console.log("no next");
  }
  try {
    const prev = document.querySelector("a[rel='prev']");
    prev.accessKey = "b";
    prev.innerText = "← previous page [b]";
    navParent = prev.parentNode.parentNode.parentNode;
  } catch {
    console.log("no prev");
  }

  // -- listings
  // latest poster's name
  if (!allCategoryAvatars) {
    const latestImg = document.querySelectorAll("body.crawler .topic-list td.posters .latest .avatar");
    for (i in latestImg) {
      try {
        const name = latestImg[i].title.replace(" - ", '').replace("Original Poster, ", '').replace("Most Recent Poster", '');
        const nameSpan = document.createElement("span");
        nameSpan.innerText = name;
        latestImg[i].parentNode.appendChild(nameSpan);
      } catch (err) {
        console.log("missing title probably");
      }
    }
    // last activity date
    const latestDate = document.querySelectorAll("body.crawler .topic-list td:last-of-type");
    for (i in latestDate) {
      try {
        const dateSpan = document.createElement("span");
        dateSpan.innerText = latestDate[i].innerText;
        dateSpan.className = "DLdate";
        dateSpan.style = "color: initial";
        latestDate[i].parentNode.querySelector(".posters").appendChild(dateSpan);
      } catch (err) {
        console.log("missing parent");
      }
    }
  }

  // -- threads
  if (currURL.pathname.match(threadRegex) || currURL.pathname.match(printRegex)) {
    const posts = document.querySelectorAll(".crawler-post");
    for (i in posts) {
      try {
        const postID = posts[i].id;
        const postNum = postID.slice(5);
        const postPos = document.querySelector("#" + postID + " [itemprop='position'] ");
        const postTime = document.querySelector("#" + postID + " .post-time");
        const postParent = postTime.parentNode;
        const postAuthor = document.querySelector("#" + postID + " [itemprop='name']");
        const postBody = document.querySelector("#" + postID + " .post");

        // make post# link to its own anchor
        const postSelfURL = document.createElement("a");
        postSelfURL.href = "#" + postID;
        postParent.appendChild(postSelfURL);
        postSelfURL.appendChild(postPos);

        //  make timestamp link to individual post
        const postURL = document.createElement("a");
        postURL.href = currURL.origin + currURL.pathname.replace(/[/]$/, '').replace(/[/]print$/, '') + '/' + postNum + '?_escaped_fragment_';
        postParent.appendChild(postURL);
        postURL.appendChild(postTime);

        // add missing avatars
        // 48x48 avatar: https://discourse.32bit.cafe/user_avatar/discourse.32bit.cafe/xandra/48/5075_2.png
        // seems like the numbers in the filename don't matter, they all resolve but have a different canonical name when you open it
        // seems to slow things down a fair bit, maybe they don't get cached
        if (postAvatars) {
          const avatarUrl = "/user_avatar/" + currURL.origin.replace(/^https:[/][/]/, '') + "/" + postAuthor.innerText + "/48/5075_2.png";
          const avatar = document.createElement("img");
          avatar.src = avatarUrl;
          avatar.width = "48";
          avatar.height = "48";
          avatar.className = "DLavatar";
          try { avatar.alt = postAuthor.innerText } catch (err) { console.log("alt text fail" + err) }
          postAuthor.parentNode.insertBefore(avatar, postAuthor);
        }

        // add ersatz reply button
        const reply = document.createElement("a");
        reply.href = currURL.origin + currURL.pathname.replace(/[/]$/, '').replace(/[/]print$/, '') + '/' + postNum + '?DLfull=true';
        reply.target = "_blank";
        reply.className = "DLreply";
        reply.innerText = "reply (full)";
        postBody.parentNode.appendChild(reply);
      } catch (err) {
        console.log(err);
      }
    }
    // add caption to mysterious backlinks
    try {
      const backlinksHead = document.createElement("h4");
      backlinksHead.append(document.createTextNode("Backlinks"));
      const backlinks = document.querySelector(".crawler-linkback-list div");
      backlinks.parentNode.insertBefore(backlinksHead, backlinks);
    } catch (err) {
      console.log("no backlinks");
    }

    // load all
    try {
      const loadAll = document.createElement("a");
      loadAll.href = currURL.origin + currURL.pathname.replace(/[/]$/, '') + "/print";
      loadAll.className = "loadButton";
      loadAll.innerHTML = "Load [A]ll";
      loadAll.accessKey = "a";
      navParent.appendChild(loadAll);
    } catch (err) {
      console.log("no prev/next");
    }
  }

  // --- footer
  const footer = document.querySelector("footer nav ul");
  const home = document.querySelector("footer nav ul li:first-child a");
  home.innerText = "[H]ome";
  home.accessKey = "h";

  // add link to topic view
  const latest = document.createElement("a");
  const latestli = document.createElement("li");
  latest.href = "/latest?_escaped_fragment_";
  latest.accessKey = "l";
  latest.innerText = "[L]atest";
  footer.insertBefore(latestli, document.querySelector("footer nav ul li:first-child + li"));
  latestli.appendChild(latest);

  // add link to chat in footer
  const chat = document.createElement("a");
  const chatli = document.createElement("li");
  chat.href = "/chat/";
  chat.target = "_blank";
  chat.accessKey = "c"
  chat.innerText = "[C]hat (full)";
  footer.appendChild(chatli).appendChild(chat);

  // add search box below footer
  const searchForm = document.createElement("form");
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const searchTerm = e.srcElement[0].value;
    const thread = currURL.pathname.match(threadRegex);
    const cat = currURL.pathname.match(catRegex);
    if (thread) {
      window.open("/search?q=" + searchTerm + " topic:" + thread[1], "_blank");
    } else if (cat) {
      window.open("/search?q=" + searchTerm + " category:" + cat[1], "_blank");
    } else {
      window.open("/search?q=" + searchTerm, "_blank");
    }
  });
  const search = document.createElement("input");
  search.type = "text";
  search.placeholder = "[S]earch (opens full site in new tab)";
  search.accessKey = "s";
  search.id = "DLsearch";
  searchForm.appendChild(search);
  document.querySelector("footer").appendChild(searchForm);
}

rewriteLocation(currURL);
window.addEventListener('load', onLoad);
