// storage.js
// The Golden Oasis - Camp & Resort - cookies and sessions
// A cookie with an expiry date is saved for that many days.
// A cookie without an expiry date is a session cookie: the browser
// deletes it when it is closed. We use session cookies for the login
// and for the booking that is in progress.

// ---------- basic cookie functions ----------
// Chrome does not save cookies for pages opened directly from a folder (file:///...).
// So that the website works both from the folder and from a server, these functions
// check once if cookies work. If they do not, the same data is kept in the browser's
// storage instead: localStorage for cookies with an expiry date and sessionStorage
// for session cookies. The rest of the website only uses setCookie / getCookie / deleteCookie.

let cookiesAllowed = cookiesWork();

// check if the browser saves cookies
function cookiesWork() {
    document.cookie = "testCookie=yes; path=/";
    let works = document.cookie.indexOf("testCookie=yes") != -1;
    document.cookie = "testCookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
    return works;
}

// create a cookie (days is optional - leave it out for a session cookie)
function setCookie(name, value, days) {
    if (!cookiesAllowed) {
        if (days) {
            let expires = new Date().getTime() + days * 24 * 60 * 60 * 1000;
            localStorage.setItem(name, expires + "|" + value);
        } else {
            sessionStorage.setItem(name, String(value));
        }
        return;
    }

    let cookieText = name + "=" + encodeURIComponent(value) + "; path=/";

    if (days) {
        let date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        cookieText = cookieText + "; expires=" + date.toUTCString();
    }

    document.cookie = cookieText;
}

// read a cookie, returns "" if the cookie does not exist
function getCookie(name) {
    if (!cookiesAllowed) {
        if (sessionStorage.getItem(name) != null) {
            return sessionStorage.getItem(name);
        }
        let saved = localStorage.getItem(name);
        if (saved == null) {
            return "";
        }
        let expires = parseInt(saved.substring(0, saved.indexOf("|")));
        if (new Date().getTime() > expires) {
            localStorage.removeItem(name); // expired
            return "";
        }
        return saved.substring(saved.indexOf("|") + 1);
    }

    let allCookies = document.cookie.split(";");

    for (let i = 0; i < allCookies.length; i++) {
        let cookie = allCookies[i].trim();

        if (cookie.indexOf(name + "=") == 0) {
            return decodeURIComponent(cookie.substring(name.length + 1));
        }
    }
    return "";
}

// delete a cookie by giving it a date in the past
function deleteCookie(name) {
    if (!cookiesAllowed) {
        sessionStorage.removeItem(name);
        localStorage.removeItem(name);
        return;
    }
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
}

// ---------- runs on every page (body onload) ----------

function pageSetup() {
    let user = getLoggedUser();

    // show the logged in user in the top bar
    if (user != null) {
        let myBookingsLink = document.getElementById("accountLinks").getElementsByTagName("a")[0].getAttribute("href");
        document.getElementById("accountLinks").innerHTML =
            "Hi, <a href='" + myBookingsLink + "'>" + user.name + "</a> | <a href='#' onclick='logout(); return false;'>Logout</a>";

        // fill the name, email and phone boxes of the forms on this page
        fillUserDetails(user);
    }
}

function fillUserDetails(user) {
    if (document.getElementById("fullName") != null && document.getElementById("fullName").value == "") {
        document.getElementById("fullName").value = user.name;
    }
    if (document.getElementById("email") != null && document.getElementById("email").value == "") {
        document.getElementById("email").value = user.email;
    }
    if (document.getElementById("phone") != null && document.getElementById("phone").value == "") {
        document.getElementById("phone").value = user.phone;
    }
}

// called by every booking form before it is validated
// visitors can see every page, but they must login or register to book
function requireLogin() {
    if (getLoggedUser() != null) {
        return true;
    }

    alert("Please login or register to make a booking.");

    // remember this page so the user comes back here after login (session cookie)
    setCookie("returnPage", window.location.href);
    window.location.href = "my-bookings.html";
    return false;
}

// ---------- room selected from a room page (session cookie) ----------

function selectRoom(roomKey) {
    setCookie("selectedRoom", roomKey);
}

// ---------- user accounts and login session ----------

// cookie names cannot contain @ or . so we replace them
function userCookieName(email) {
    return "user_" + email.toLowerCase().replace(/[^a-z0-9]/g, "_");
}

// account is saved for 1 year as  name|phone|password
function saveUser(name, email, phone, password) {
    setCookie(userCookieName(email), name + "|" + phone + "|" + password, 365);
}

function getUser(email) {
    let data = getCookie(userCookieName(email));
    if (data == "") {
        return null;
    }
    let parts = data.split("|");
    return { name: parts[0], email: email.toLowerCase(), phone: parts[1], password: parts[2] };
}

// login is a session cookie (no expiry date)
function loginUser(user) {
    setCookie("loggedUser", user.name + "|" + user.email + "|" + user.phone);
}

function getLoggedUser() {
    let data = getCookie("loggedUser");
    if (data == "") {
        return null;
    }
    let parts = data.split("|");
    return { name: parts[0], email: parts[1], phone: parts[2] };
}

function logout() {
    deleteCookie("loggedUser");
    alert("You have been logged out.");
    location.reload();
}

// ---------- bookings (saved in one cookie for 1 year) ----------
// each booking is saved as fields joined with ~ and bookings are joined with |

let bookingFields = ["id", "type", "title", "name", "email", "phone", "date1", "date2", "guests", "total", "status", "payMethod", "txn", "notes"];

function getBookings() {
    let data = getCookie("oasisBookings");
    let list = [];

    if (data == "") {
        return list;
    }

    let rows = data.split("|");
    for (let i = 0; i < rows.length; i++) {
        let values = rows[i].split("~");
        let booking = {};
        for (let j = 0; j < bookingFields.length; j++) {
            booking[bookingFields[j]] = values[j] || "";
        }
        list.push(booking);
    }
    return list;
}

function saveAllBookings(list) {
    let rows = [];

    for (let i = 0; i < list.length; i++) {
        let values = [];
        for (let j = 0; j < bookingFields.length; j++) {
            // remove the separator characters from user text
            let value = String(list[i][bookingFields[j]] || "").replace(/[~|]/g, " ");
            values.push(value);
        }
        rows.push(values.join("~"));
    }
    setCookie("oasisBookings", rows.join("|"), 365);
}

function saveBooking(booking) {
    let list = getBookings();
    list.push(booking);
    saveAllBookings(list);
}

function findBooking(id) {
    let list = getBookings();
    for (let i = 0; i < list.length; i++) {
        if (list[i].id == id) {
            return list[i];
        }
    }
    return null;
}

function setBookingStatus(id, status) {
    let list = getBookings();
    for (let i = 0; i < list.length; i++) {
        if (list[i].id == id) {
            list[i].status = status;
        }
    }
    saveAllBookings(list);
}

// new booking id like OCR482913
function newBookingId(prefix) {
    let number = Math.floor(100000 + Math.random() * 900000);
    return prefix + number;
}
