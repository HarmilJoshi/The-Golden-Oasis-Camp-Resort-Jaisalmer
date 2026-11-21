// main.js
// The Golden Oasis - Camp & Resort - form validation and actions
// Every form calls its validate function with onsubmit="return validate...()"
// If a field is wrong, the error is shown under it and the form is not submitted.

// ---------- resort data used for prices ----------

const rooms = {
    "luxury-cottage": { name: "Luxury Cottage", price: 12500, maxGuests: 3 },
    "deluxe-room": { name: "Deluxe Room", price: 7500, maxGuests: 2 },
    "family-suite": { name: "Family Suite", price: 15000, maxGuests: 5 },
    "jungle-tent": { name: "Jungle Tent", price: 5500, maxGuests: 3 },
};

const activityPrices = {
    safari: 1500,
    trekking: 900,
    rafting: 2000,
    cycling: 600,
    birdwatching: 800,
    campfire: 500,
};

const cafePrices = [80, 180, 220, 150, 90, 240];
const cafeItems = ["Masala Chai", "Cappuccino", "Cold Coffee", "Butter Croissant", "Pyaaz Kachori", "Veg Club Sandwich"];

const taxRate = 0.12;

// ---------- regular expressions ----------

const namePattern = /^[A-Za-z][A-Za-z .']{1,49}$/;
const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const phonePattern = /^[6-9][0-9]{9}$/;
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
const cardPattern = /^[0-9]{16}$/;
const expiryPattern = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
const cvvPattern = /^[0-9]{3}$/;
const upiPattern = /^[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}$/;
const bookingIdPattern = /^[A-Z]{3}[0-9]{6}$/;
const placePattern = /^[A-Za-z][A-Za-z ,.'-]{2,59}$/;

// ---------- helper functions ----------

function getValue(id) {
    return document.getElementById(id).value.trim();
}

function showError(id, message) {
    document.getElementById(id + "Error").innerHTML = message;
    document.getElementById(id).classList.add("input-error");
}

function clearError(id) {
    document.getElementById(id + "Error").innerHTML = "";
    document.getElementById(id).classList.remove("input-error");
}

function formatRupees(amount) {
    return "Rs. " + Math.round(amount).toLocaleString("en-IN");
}

// number of days from today to a date written as YYYY-MM-DD
function daysFromToday(dateText) {
    let today = new Date();
    today.setHours(0, 0, 0, 0);
    let date = new Date(dateText + "T00:00:00");
    return Math.round((date - today) / (1000 * 60 * 60 * 24));
}

function daysBetween(firstDate, secondDate) {
    let first = new Date(firstDate + "T00:00:00");
    let second = new Date(secondDate + "T00:00:00");
    return Math.round((second - first) / (1000 * 60 * 60 * 24));
}

// 2026-11-20  ->  20 Nov 2026
function formatDate(dateText) {
    if (dateText == "") {
        return "-";
    }
    let date = new Date(dateText + "T00:00:00");
    return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

// 19:30  ->  7:30 PM
function formatTime(timeText) {
    if (timeText == "") {
        return "-";
    }
    let parts = timeText.split(":");
    let hour = parseInt(parts[0]);
    let ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12;
    if (hour == 0) {
        hour = 12;
    }
    return hour + ":" + parts[1] + " " + ampm;
}

// ---------- date and time boxes ----------
// Dates and times can only be chosen from the calendar / clock, not typed.
// Typing is blocked in the HTML with onkeydown, and clicking the box opens the picker.

// date box (calendar only): value is already YYYY-MM-DD
function dateValue(id) {
    return getValue(id);
}

// time box (clock only): value is already HH:MM (24 hour)
function timeValue(id) {
    return getValue(id);
}

// put a saved date (YYYY-MM-DD) back into a date box
function showDate(id, savedDate) {
    document.getElementById(id).value = savedDate;
}

// ---------- common field checks (each returns true or false) ----------

function checkName(id) {
    let value = getValue(id);
    if (value == "") {
        showError(id, "Name is required.");
        return false;
    }
    if (!namePattern.test(value)) {
        showError(id, "Enter a valid name (letters and spaces only, 2 to 50 characters).");
        return false;
    }
    clearError(id);
    return true;
}

function checkEmail(id) {
    let value = getValue(id);
    if (value == "") {
        showError(id, "Email is required.");
        return false;
    }
    if (!emailPattern.test(value)) {
        showError(id, "Enter a valid email address, for example name@example.com.");
        return false;
    }
    clearError(id);
    return true;
}

function checkPhone(id) {
    let value = getValue(id);
    if (value == "") {
        showError(id, "Mobile number is required.");
        return false;
    }
    if (!phonePattern.test(value)) {
        showError(id, "Enter a valid 10-digit mobile number starting with 6, 7, 8 or 9.");
        return false;
    }
    clearError(id);
    return true;
}

function checkSelect(id, label) {
    if (getValue(id) == "") {
        showError(id, "Please select " + label + ".");
        return false;
    }
    clearError(id);
    return true;
}

function checkNumber(id, label, min, max) {
    let value = getValue(id);
    if (value == "") {
        showError(id, label + " is required.");
        return false;
    }
    let number = Number(value);
    if (isNaN(number) || number != parseInt(value)) {
        showError(id, label + " must be a whole number.");
        return false;
    }
    if (number < min || number > max) {
        showError(id, label + " must be between " + min + " and " + max + ".");
        return false;
    }
    clearError(id);
    return true;
}

// minDays and maxDays are counted from today
function checkDate(id, label, minDays, maxDays) {
    if (getValue(id) == "") {
        showError(id, label + " is required. Please choose a date.");
        return false;
    }
    let value = dateValue(id);
    if (value == "") {
        showError(id, "Please choose a date from the calendar.");
        return false;
    }
    let days = daysFromToday(value);
    if (days < minDays) {
        if (minDays == 0) {
            showError(id, label + " cannot be in the past.");
        } else {
            showError(id, label + " must be at least " + minDays + " day(s) from today.");
        }
        return false;
    }
    if (days > maxDays) {
        showError(id, label + " can be at most " + maxDays + " days from today.");
        return false;
    }
    clearError(id);
    return true;
}

// openTime and closeTime are written as HH:MM
function checkTime(id, label, openTime, closeTime) {
    if (getValue(id) == "") {
        showError(id, label + " is required.");
        return false;
    }
    let value = timeValue(id);
    if (value == "") {
        showError(id, "Please choose a time from the clock.");
        return false;
    }
    if (value < openTime || value > closeTime) {
        showError(id, "Please choose a time between " + formatTime(openTime) + " and " + formatTime(closeTime) + ".");
        return false;
    }
    clearError(id);
    return true;
}

// date of birth box: the calendar only allows ages from 18 to 100 years
function setDobLimits(id) {
    let today = new Date();
    let maxYear = today.getFullYear() - 18;
    let minYear = today.getFullYear() - 100;
    let month = String(today.getMonth() + 1).padStart(2, "0");
    let day = String(today.getDate()).padStart(2, "0");
    document.getElementById(id).max = maxYear + "-" + month + "-" + day;
    document.getElementById(id).min = minYear + "-" + month + "-" + day;
}

// date of birth: the guest who books must be at least 18 years old
function checkAge(id) {
    let value = dateValue(id);
    if (value == "") {
        showError(id, "Date of birth is required. Please choose a date.");
        return false;
    }
    let parts = value.split("-");
    let birth = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    let today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    // not had the birthday yet this year
    if (today.getMonth() < birth.getMonth() || (today.getMonth() == birth.getMonth() && today.getDate() < birth.getDate())) {
        age = age - 1;
    }
    if (birth > today) {
        showError(id, "Date of birth cannot be in the future.");
        return false;
    }
    if (age > 100) {
        showError(id, "Please choose your real date of birth (age cannot be more than 100 years).");
        return false;
    }
    if (age < 18) {
        showError(id, "You must be 18 years or older to book. Please ask an adult to make the booking.");
        return false;
    }
    clearError(id);
    return true;
}

function checkLength(id, label, minLength) {
    let value = getValue(id);
    if (value == "") {
        showError(id, label + " is required.");
        return false;
    }
    if (value.length < minLength) {
        showError(id, label + " must be at least " + minLength + " characters.");
        return false;
    }
    clearError(id);
    return true;
}

function checkTerms(id) {
    if (!document.getElementById(id).checked) {
        document.getElementById(id + "Error").innerHTML = "You must accept the terms and conditions.";
        return false;
    }
    document.getElementById(id + "Error").innerHTML = "";
    return true;
}

// ---------- newsletter (footer of every page) ----------

function validateNewsletter() {
    let email = getValue("newsEmail");
    let error = document.getElementById("newsEmailError");

    if (email == "") {
        error.innerHTML = "Please enter your email.";
        return false;
    }
    if (!emailPattern.test(email)) {
        error.innerHTML = "Please enter a valid email address.";
        return false;
    }
    if (getCookie("newsletter") == email) {
        error.innerHTML = "This email is already subscribed.";
        return false;
    }

    error.innerHTML = "";
    setCookie("newsletter", email, 365);
    alert("Thank you! " + email + " is now subscribed to our newsletter.");
    document.getElementById("newsEmail").value = "";
    return false;
}

// ---------- contact page ----------

function validateContactForm() {
    let valid = true;

    if (!checkName("fullName")) valid = false;
    if (!checkEmail("email")) valid = false;
    if (!checkPhone("phone")) valid = false;
    if (!checkSelect("subject", "a subject")) valid = false;
    if (!checkLength("message", "Message", 20)) valid = false;
    if (!checkTerms("terms")) valid = false;

    if (valid) {
        alert("Thank you, " + getValue("fullName") + "! Your message has been sent. We will reply within 24 hours.");
        document.getElementById("contactForm").reset();
    }
    return false;
}

// ---------- restaurant: table reservation ----------

function validateTableForm() {
    // only logged in users can book
    if (!requireLogin()) {
        return false;
    }

    let valid = true;

    if (!checkName("fullName")) valid = false;
    if (!checkPhone("phone")) valid = false;
    if (!checkEmail("email")) valid = false;
    if (!checkDate("date", "Date", 0, 60)) valid = false;
    if (!checkTime("time", "Time", "07:30", "22:30")) valid = false;
    if (!checkNumber("guests", "Guests", 1, 20)) valid = false;

    if (valid) {
        let booking = {
            id: newBookingId("TBL"),
            type: "table",
            title: "Table reservation - Dhola Maru",
            name: getValue("fullName"),
            email: getValue("email"),
            phone: getValue("phone"),
            date1: dateValue("date"),
            date2: timeValue("time"),
            guests: getValue("guests"),
            total: 0,
            status: "Confirmed",
            notes: getValue("notes"),
        };
        saveBooking(booking);
        alert(
            "Table reserved! Reference ID: " +
                booking.id +
                "\nTable for " +
                booking.guests +
                " on " +
                formatDate(booking.date1) +
                " at " +
                formatTime(booking.date2) +
                ".",
        );
        document.getElementById("tableForm").reset();
    }
    return false;
}

// ---------- cafe: pre-order ----------

function updateCafeTotal() {
    let total = 0;
    for (let i = 0; i < cafePrices.length; i++) {
        let quantity = parseInt(document.getElementById("qty" + (i + 1)).value) || 0;
        total = total + quantity * cafePrices[i];
    }
    document.getElementById("cafeTotal").innerHTML = formatRupees(total);
    return total;
}

function validateCafeForm() {
    // only logged in users can book
    if (!requireLogin()) {
        return false;
    }

    let valid = true;
    let items = [];

    // every quantity must be a number from 0 to 10
    for (let i = 0; i < cafePrices.length; i++) {
        let quantity = document.getElementById("qty" + (i + 1)).value;
        if (quantity == "" || isNaN(quantity) || quantity < 0 || quantity > 10) {
            document.getElementById("cafeItemsError").innerHTML = "Quantity of " + cafeItems[i] + " must be between 0 and 10.";
            return false;
        }
        if (quantity > 0) {
            items.push(cafeItems[i] + " x " + quantity);
        }
    }

    if (items.length == 0) {
        document.getElementById("cafeItemsError").innerHTML = "Please add at least one item to your order.";
        valid = false;
    } else {
        document.getElementById("cafeItemsError").innerHTML = "";
    }

    if (!checkName("fullName")) valid = false;
    if (!checkPhone("phone")) valid = false;
    if (!checkEmail("email")) valid = false;
    if (!checkTime("time", "Pick-up time", "08:00", "20:45")) valid = false;

    if (valid) {
        let total = updateCafeTotal();
        let today = new Date();
        let booking = {
            id: newBookingId("CAF"),
            type: "cafe",
            title: "Sunset Cafe order",
            name: getValue("fullName"),
            email: getValue("email"),
            phone: getValue("phone"),
            date1: today.toISOString().substring(0, 10),
            date2: timeValue("time"),
            guests: items.length,
            total: total,
            status: "Confirmed",
            notes: items.join(", "),
        };
        saveBooking(booking);
        alert(
            "Order placed! Reference ID: " +
                booking.id +
                "\n" +
                items.join("\n") +
                "\nTotal: " +
                formatRupees(total) +
                "\nPick up at " +
                formatTime(booking.date2) +
                ".",
        );
        document.getElementById("cafeOrderForm").reset();
        updateCafeTotal();
    }
    return false;
}

// ---------- activity pages (safari, trekking, rafting, cycling, ...) ----------

function updateActivityTotal() {
    let price = parseInt(getValue("activityPrice"));
    let people = parseInt(getValue("participants")) || 0;
    document.getElementById("activityTotal").innerHTML = formatRupees(price * people);
}

function validateActivityForm() {
    // only logged in users can book
    if (!requireLogin()) {
        return false;
    }

    let valid = true;
    let maxPeople = parseInt(getValue("maxPeople"));

    if (!checkName("fullName")) valid = false;
    if (!checkEmail("email")) valid = false;
    if (!checkPhone("phone")) valid = false;

    // only the kids zone page has these two fields
    if (document.getElementById("childName") != null) {
        if (!checkName("childName")) valid = false;
        if (!checkNumber("childAge", "Child's age", 3, 12)) valid = false;
    }

    if (!checkDate("date", "Date", 1, 90)) valid = false;
    if (!checkTime("time", "Time", getValue("openTime"), getValue("closeTime"))) valid = false;
    if (!checkNumber("participants", "Number of people", 1, maxPeople)) valid = false;

    if (valid) {
        let price = parseInt(getValue("activityPrice"));
        let people = parseInt(getValue("participants"));
        let notes = getValue("notes");
        if (document.getElementById("childName") != null) {
            notes = "Child: " + getValue("childName") + ", age " + getValue("childAge") + ". " + notes;
        }

        let booking = {
            id: newBookingId("ACT"),
            type: "activity",
            title: getValue("activityName"),
            name: getValue("fullName"),
            email: getValue("email"),
            phone: getValue("phone"),
            date1: dateValue("date"),
            date2: timeValue("time"),
            guests: people,
            total: price * people,
            status: "Confirmed",
            notes: notes,
        };
        saveBooking(booking);
        alert(
            "Booking confirmed! Reference ID: " +
                booking.id +
                "\n" +
                booking.title +
                " on " +
                formatDate(booking.date1) +
                " at " +
                formatTime(booking.date2) +
                "\nAmount " +
                formatRupees(booking.total) +
                " is payable at the resort.",
        );
        document.getElementById("activityForm").reset();
        updateActivityTotal();
    }
    return false;
}

// ---------- room comparison: total for number of nights ----------

function calculateStay() {
    if (!checkNumber("cmpNights", "Number of nights", 1, 30)) {
        return false;
    }
    let nights = parseInt(getValue("cmpNights"));

    for (let key in rooms) {
        let total = rooms[key].price * nights * (1 + taxRate);
        document.getElementById("total-" + key).innerHTML = formatRupees(total);
    }
    document.getElementById("nightsLabel").innerHTML = nights;
    return false;
}

// ---------- booking page ----------

// fill the form from session cookies (room page / login)
function prefillBooking() {
    // the booking page is only for logged in users
    if (!requireLogin()) {
        return;
    }

    setDobLimits("dob");

    if (getCookie("selectedRoom") != "") {
        document.getElementById("roomType").value = getCookie("selectedRoom");
    }

    let user = getLoggedUser();
    if (user != null) {
        document.getElementById("fullName").value = user.name;
        document.getElementById("email").value = user.email;
        document.getElementById("phone").value = user.phone;
    }
    calculatePrice();
}

function getSelectedActivities() {
    let boxes = document.getElementsByName("activities");
    let selected = [];
    for (let i = 0; i < boxes.length; i++) {
        if (boxes[i].checked) {
            selected.push(boxes[i].value);
        }
    }
    return selected;
}

// check the coupon code, returns the discount percent (0 if not valid)
function couponPercent(code, roomKey, nights, checkIn) {
    code = code.toUpperCase();
    if (code == "OASIS10") {
        return 10;
    }
    if (code == "DESERT20" && nights >= 3) {
        return 20;
    }
    if (code == "FAMILY15" && roomKey == "family-suite") {
        return 15;
    }
    if (code == "EARLY25" && checkIn != "" && daysFromToday(checkIn) >= 30) {
        return 25;
    }
    return 0;
}

function calculatePrice() {
    let roomKey = getValue("roomType");
    let checkIn = dateValue("checkIn");
    let checkOut = dateValue("checkOut");
    let roomCount = parseInt(getValue("rooms")) || 1;
    let guests = (parseInt(getValue("adults")) || 0) + (parseInt(getValue("children")) || 0);
    let nights = 0;

    if (checkIn != "" && checkOut != "") {
        nights = daysBetween(checkIn, checkOut);
    }

    let price = { nights: nights, roomCost: 0, activityCost: 0, discount: 0, tax: 0, total: 0, percent: 0 };

    if (roomKey != "" && nights > 0) {
        price.roomCost = rooms[roomKey].price * nights * roomCount;

        let selected = getSelectedActivities();
        for (let i = 0; i < selected.length; i++) {
            price.activityCost = price.activityCost + activityPrices[selected[i]] * guests;
        }

        price.percent = couponPercent(getValue("coupon"), roomKey, nights, checkIn);
        price.discount = ((price.roomCost + price.activityCost) * price.percent) / 100;
        price.tax = (price.roomCost + price.activityCost - price.discount) * taxRate;
        price.total = price.roomCost + price.activityCost - price.discount + price.tax;
    }

    // show the summary
    document.getElementById("sumRoom").innerHTML = roomKey == "" ? "-" : rooms[roomKey].name;
    document.getElementById("sumNights").innerHTML = nights > 0 ? nights + " night(s) x " + roomCount + " room(s)" : "-";
    document.getElementById("sumGuests").innerHTML = guests + " guest(s)";
    document.getElementById("sumRoomCost").innerHTML = formatRupees(price.roomCost);
    document.getElementById("sumActs").innerHTML = formatRupees(price.activityCost);
    document.getElementById("sumDisc").innerHTML = "- " + formatRupees(price.discount);
    document.getElementById("sumTax").innerHTML = formatRupees(price.tax);
    document.getElementById("sumTotal").innerHTML = formatRupees(price.total);

    return price;
}

function validateBookingForm() {
    // only logged in users can book
    if (!requireLogin()) {
        return false;
    }

    let valid = true;

    if (!checkName("fullName")) valid = false;
    if (!checkEmail("email")) valid = false;
    if (!checkPhone("phone")) valid = false;
    if (!checkAge("dob")) valid = false;
    if (!checkSelect("roomType", "a room or tent")) valid = false;
    if (!checkDate("checkIn", "Check-in date", 0, 365)) valid = false;
    if (!checkDate("checkOut", "Check-out date", 1, 395)) valid = false;
    if (!checkNumber("rooms", "Rooms", 1, 5)) valid = false;
    if (!checkNumber("adults", "Adults", 1, 15)) valid = false;
    if (!checkNumber("children", "Children", 0, 6)) valid = false;
    if (!checkTerms("terms")) valid = false;

    // check-out must be after check-in, maximum 30 nights
    if (dateValue("checkIn") != "" && dateValue("checkOut") != "") {
        let nights = daysBetween(dateValue("checkIn"), dateValue("checkOut"));
        if (nights < 1) {
            showError("checkOut", "Check-out must be after check-in.");
            valid = false;
        } else if (nights > 30) {
            showError("checkOut", "Maximum stay is 30 nights per booking.");
            valid = false;
        }
    }

    // guests must fit in the selected rooms
    let roomKey = getValue("roomType");
    if (roomKey != "" && valid) {
        let guests = parseInt(getValue("adults")) + parseInt(getValue("children"));
        let maxGuests = rooms[roomKey].maxGuests * parseInt(getValue("rooms"));
        if (guests > maxGuests) {
            showError(
                "adults",
                rooms[roomKey].name + " allows " + rooms[roomKey].maxGuests + " guests per room. Add more rooms or choose a bigger room.",
            );
            valid = false;
        }
    }

    // coupon is optional, but if it is entered it must be valid
    let price = calculatePrice();
    let coupon = getValue("coupon");
    if (coupon != "" && valid) {
        if (price.percent == 0) {
            showError("coupon", "This coupon code is not valid for your booking.");
            valid = false;
        } else {
            clearError("coupon");
        }
    } else if (coupon == "") {
        clearError("coupon");
    }

    if (valid) {
        // save the booking in session cookies for the payment page
        setCookie("bkName", getValue("fullName"));
        setCookie("bkEmail", getValue("email"));
        setCookie("bkPhone", getValue("phone"));
        setCookie("bkRoom", roomKey);
        setCookie("bkCheckIn", dateValue("checkIn"));
        setCookie("bkCheckOut", dateValue("checkOut"));
        setCookie("bkNights", price.nights);
        setCookie("bkRooms", getValue("rooms"));
        setCookie("bkGuests", parseInt(getValue("adults")) + parseInt(getValue("children")));
        setCookie("bkActivities", getSelectedActivities().join(", "));
        setCookie("bkCoupon", coupon.toUpperCase());
        setCookie("bkRoomCost", price.roomCost);
        setCookie("bkActCost", price.activityCost);
        setCookie("bkDiscount", price.discount);
        setCookie("bkTax", price.tax);
        setCookie("bkTotal", price.total);
        setCookie("bkRequests", getValue("requests"));
        window.location.href = "payment.html";
    }
    return false;
}

// ---------- payment page ----------

function summaryRow(label, value) {
    return "<div class='sum-row'><span>" + label + "</span><span>" + value + "</span></div>";
}

function loadPaymentPage() {
    if (!requireLogin()) {
        return;
    }

    if (getCookie("bkTotal") == "") {
        document.getElementById("paymentArea").innerHTML =
            "<div class='empty-state'><h3>No booking in progress</h3>" +
            "<p>Please fill in the booking form first.</p>" +
            "<a class='btn btn-gold' href='booking.html'>Book a Stay</a></div>";
        return;
    }

    let html =
        summaryRow("Guest", getCookie("bkName")) +
        summaryRow("Room", rooms[getCookie("bkRoom")].name) +
        summaryRow("Check-in", formatDate(getCookie("bkCheckIn"))) +
        summaryRow("Check-out", formatDate(getCookie("bkCheckOut"))) +
        summaryRow("Stay", getCookie("bkNights") + " night(s), " + getCookie("bkRooms") + " room(s)") +
        summaryRow("Guests", getCookie("bkGuests")) +
        summaryRow("Room charges", formatRupees(getCookie("bkRoomCost"))) +
        summaryRow("Activities", formatRupees(getCookie("bkActCost")));

    if (getCookie("bkCoupon") != "") {
        html = html + summaryRow("Discount (" + getCookie("bkCoupon") + ")", "- " + formatRupees(getCookie("bkDiscount")));
    }
    html =
        html +
        summaryRow("GST (12%)", formatRupees(getCookie("bkTax"))) +
        "<div class='sum-row sum-total'><span>Total</span><span>" +
        formatRupees(getCookie("bkTotal")) +
        "</span></div>";

    document.getElementById("paySummary").innerHTML = html;
    document.getElementById("payAmount").innerHTML = formatRupees(getCookie("bkTotal"));
    document.getElementById("cardName").value = getCookie("bkName");
}

// Luhn check: the standard formula banks use to catch mistyped card numbers
// expiry box: add "/" after the month while typing (MM/YY)
function formatExpiry(box, event) {
    let digits = box.value.replace(/[^0-9]/g, "").substring(0, 4);
    // a month like 5 becomes 05
    if (digits.length == 1 && parseInt(digits) > 1) {
        digits = "0" + digits;
    }
    if (digits.length > 2) {
        box.value = digits.substring(0, 2) + "/" + digits.substring(2);
    } else if (digits.length == 2 && event.inputType != "deleteContentBackward") {
        box.value = digits + "/";
    } else {
        box.value = digits;
    }
}

// card number box: keep only digits and add a space after every 4 digits while typing
function formatCardNumber(box) {
    let digits = box.value.replace(/[^0-9]/g, "").substring(0, 16);
    let formatted = "";
    for (let i = 0; i < digits.length; i++) {
        if (i > 0 && i % 4 == 0) {
            formatted = formatted + " ";
        }
        formatted = formatted + digits.charAt(i);
    }
    box.value = formatted;
}

function luhnCheck(cardNumber) {
    let sum = 0;
    let double = false;

    for (let i = cardNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cardNumber.charAt(i));
        if (double) {
            digit = digit * 2;
            if (digit > 9) {
                digit = digit - 9;
            }
        }
        sum = sum + digit;
        double = !double;
    }
    return sum % 10 == 0;
}

function validatePaymentForm() {
    let valid = true;
    let method = "";
    let methodText = "";

    if (document.getElementById("methodCard").checked) {
        method = "card";
    } else {
        method = "upi";
    }

    if (method == "card") {
        if (!checkName("cardName")) valid = false;

        let card = getValue("cardNumber").replace(/ /g, "");
        if (card == "") {
            showError("cardNumber", "Card number is required.");
            valid = false;
        } else if (!cardPattern.test(card)) {
            showError("cardNumber", "Card number must have 16 digits.");
            valid = false;
        } else if (!luhnCheck(card)) {
            showError("cardNumber", "This card number is not valid. Please check it again.");
            valid = false;
        } else {
            clearError("cardNumber");
        }

        let expiry = getValue("cardExpiry");
        if (expiry == "") {
            showError("cardExpiry", "Expiry date is required.");
            valid = false;
        } else if (!expiryPattern.test(expiry)) {
            showError("cardExpiry", "Use MM/YY format, for example 08/28.");
            valid = false;
        } else {
            let month = parseInt(expiry.substring(0, 2));
            let year = 2000 + parseInt(expiry.substring(3, 5));
            let today = new Date();
            if (year < today.getFullYear() || (year == today.getFullYear() && month < today.getMonth() + 1)) {
                showError("cardExpiry", "This card has expired.");
                valid = false;
            } else {
                clearError("cardExpiry");
            }
        }

        let cvv = getValue("cardCvv");
        if (cvv == "") {
            showError("cardCvv", "CVV is required.");
            valid = false;
        } else if (!cvvPattern.test(cvv)) {
            showError("cardCvv", "CVV must be 3 digits.");
            valid = false;
        } else {
            clearError("cardCvv");
        }
        methodText = "Card ending " + card.substring(card.length - 4);
    }

    if (method == "upi") {
        let upi = getValue("upiId");
        if (upi == "") {
            showError("upiId", "UPI ID is required.");
            valid = false;
        } else if (!upiPattern.test(upi)) {
            showError("upiId", "Enter a valid UPI ID, for example name@okbank.");
            valid = false;
        } else {
            clearError("upiId");
        }
        methodText = "UPI (" + upi + ")";
    }

    if (!checkTerms("payTerms")) valid = false;

    if (valid) {
        let booking = {
            id: newBookingId("OCR"),
            type: "stay",
            title: rooms[getCookie("bkRoom")].name,
            name: getCookie("bkName"),
            email: getCookie("bkEmail"),
            phone: getCookie("bkPhone"),
            date1: getCookie("bkCheckIn"),
            date2: getCookie("bkCheckOut"),
            guests: getCookie("bkGuests"),
            total: Math.round(getCookie("bkTotal")),
            status: "Confirmed",
            payMethod: methodText,
            txn: "TXN" + Date.now(),
            notes:
                getCookie("bkNights") +
                " night(s), " +
                getCookie("bkRooms") +
                " room(s). Activities: " +
                (getCookie("bkActivities") == "" ? "none" : getCookie("bkActivities")) +
                ". " +
                getCookie("bkRequests"),
        };
        saveBooking(booking);

        // remember the last booking for this session and clear the booking in progress
        setCookie("lastBookingId", booking.id);
        let pending = [
            "bkName",
            "bkEmail",
            "bkPhone",
            "bkRoom",
            "bkCheckIn",
            "bkCheckOut",
            "bkNights",
            "bkRooms",
            "bkGuests",
            "bkActivities",
            "bkCoupon",
            "bkRoomCost",
            "bkActCost",
            "bkDiscount",
            "bkTax",
            "bkTotal",
            "bkRequests",
        ];
        for (let i = 0; i < pending.length; i++) {
            deleteCookie(pending[i]);
        }

        window.location.href = "payment-success.html";
    }
    return false;
}

// ---------- payment success page ----------

function loadSuccessPage() {
    let booking = findBooking(getCookie("lastBookingId"));

    if (booking == null) {
        document.getElementById("successArea").innerHTML =
            "<div class='success-box'><h2>No recent payment found</h2>" +
            "<p>We could not find a payment in this session.</p>" +
            "<a href='my-bookings.html' class='btn btn-gold'>Go to My Bookings</a></div>";
        return;
    }

    document.getElementById("psId").innerHTML = booking.id;
    document.getElementById("psTxn").innerHTML = booking.txn;
    document.getElementById("psMethod").innerHTML = booking.payMethod;
    document.getElementById("psAmt").innerHTML = formatRupees(booking.total);
    document.getElementById("psEmail").innerHTML = booking.email;
}

// ---------- booking confirmation page ----------

function loadConfirmation() {
    let booking = findBooking(getCookie("lastBookingId"));
    if (booking != null) {
        showTicket(booking);
    }
}

function showTicket(booking) {
    let details = "";

    if (booking.type == "stay") {
        details =
            summaryRow("Check-in", formatDate(booking.date1) + ", 1:00 PM") +
            summaryRow("Check-out", formatDate(booking.date2) + ", 11:00 AM") +
            summaryRow("Guests", booking.guests);
    } else {
        details =
            summaryRow("Date", formatDate(booking.date1)) + summaryRow("Time", formatTime(booking.date2)) + summaryRow("People", booking.guests);
    }

    let html =
        "<div class='ticket'>" +
        "<div class='ticket-head'><div><small>BOOKING " +
        booking.status.toUpperCase() +
        "</small><h3>" +
        booking.title +
        "</h3></div>" +
        "<div class='ticket-id'><small>Booking ID</small><strong>" +
        booking.id +
        "</strong></div></div>" +
        "<div class='ticket-body'><div class='ticket-grid'><div>" +
        summaryRow("Guest name", booking.name) +
        summaryRow("Email", booking.email) +
        summaryRow("Phone", booking.phone) +
        summaryRow("Status", booking.status) +
        "</div><div>" +
        details +
        "</div></div>" +
        summaryRow("Details", booking.notes);

    if (booking.payMethod != "") {
        html = html + summaryRow("Payment", booking.payMethod + " (" + booking.txn + ")");
    }

    html =
        html +
        "<div class='sum-row sum-total'><span>Total</span><span>" +
        (booking.total > 0 ? formatRupees(booking.total) : "To be confirmed") +
        "</span></div>" +
        "<div class='info-box mt-2'>The Golden Oasis Camp &amp; Resort, Sam Sand Dunes, Sam, Jaisalmer, Rajasthan 345001, India. Phone +91 94998 10502</div>" +
        "<div class='no-print'><button class='btn btn-gold' onclick='window.print()'>Print / Save as PDF</button> " +
        "<a class='btn btn-outline' href='my-bookings.html'>My Bookings</a></div>" +
        "</div></div>";

    document.getElementById("ticketOut").innerHTML = html;
}

function validateLookupForm() {
    let valid = true;
    let id = getValue("lookupId").toUpperCase();

    if (id == "") {
        showError("lookupId", "Booking ID is required.");
        valid = false;
    } else if (!bookingIdPattern.test(id)) {
        showError("lookupId", "Booking ID looks like OCR123456 (3 letters and 6 digits).");
        valid = false;
    } else {
        clearError("lookupId");
    }
    if (!checkEmail("lookupEmail")) valid = false;

    if (valid) {
        let booking = findBooking(id);
        if (booking == null || booking.email.toLowerCase() != getValue("lookupEmail").toLowerCase()) {
            alert("No booking was found with this Booking ID and email.");
        } else {
            showTicket(booking);
        }
    }
    return false;
}

// ---------- my bookings page ----------

function loadMyBookings() {
    let user = getLoggedUser();

    // cookie permission is asked only once
    if (getCookie("cookieConsent") == "yes") {
        document.getElementById("loginConsentBox").style.display = "none";
        document.getElementById("regConsentBox").style.display = "none";
    }

    if (user == null) {
        document.getElementById("userArea").style.display = "none";
        // remembered email (30 day cookie)
        if (getCookie("rememberEmail") != "") {
            document.getElementById("loginEmail").value = getCookie("rememberEmail");
            document.getElementById("rememberMe").checked = true;
        }
        return;
    }

    document.getElementById("authArea").style.display = "none";
    document.getElementById("userArea").style.display = "block";
    document.getElementById("userName").innerHTML = user.name;
    document.getElementById("userEmail").innerHTML = user.email;
    showBookingList(user.email);
}

function showBookingList(email) {
    let list = getBookings();
    let html = "";

    for (let i = list.length - 1; i >= 0; i--) {
        if (list[i].email.toLowerCase() == email.toLowerCase()) {
            html = html + bookingCard(list[i]);
        }
    }

    if (html == "") {
        html =
            "<div class='empty-state'><h3>No bookings yet</h3>" +
            "<p>Bookings made with " +
            email +
            " will appear here.</p>" +
            "<a class='btn btn-gold' href='booking.html'>Book your stay</a></div>";
    }
    document.getElementById("bookingList").innerHTML = html;
}

function bookingCard(booking) {
    let when = formatDate(booking.date1);
    if (booking.type == "stay") {
        when = formatDate(booking.date1) + " to " + formatDate(booking.date2);
    } else if (booking.date2 != "") {
        when = when + " at " + formatTime(booking.date2);
    }

    let html =
        "<div class='booking-item'>" +
        "<div><span class='pill'>" +
        booking.type.toUpperCase() +
        "</span><h4>" +
        booking.title +
        "</h4>" +
        "<p class='bi-meta'>ID: <strong>" +
        booking.id +
        "</strong> | " +
        when +
        "</p>" +
        "<p class='bi-meta'>" +
        (booking.total > 0 ? formatRupees(booking.total) : "Price to be confirmed") +
        "</p></div>" +
        "<div class='bi-actions'><span class='status " +
        booking.status.toLowerCase() +
        "'>" +
        booking.status +
        "</span>" +
        "<a class='btn btn-outline btn-sm' href='booking-confirmation.html' onclick=\"setCookie('lastBookingId', '" +
        booking.id +
        "')\">View</a>";

    // a booking can be cancelled only if it is not cancelled and the date is in the future
    if (booking.status != "Cancelled" && daysFromToday(booking.date1) >= 1) {
        html = html + "<button class='btn btn-danger btn-sm' onclick=\"cancelBooking('" + booking.id + "')\">Cancel</button>";
    }
    html = html + "</div></div>";
    return html;
}

function cancelBooking(id) {
    let answer = confirm("Are you sure you want to cancel booking " + id + "?\nRefunds follow our cancellation policy.");
    if (answer) {
        setBookingStatus(id, "Cancelled");
        alert("Booking " + id + " has been cancelled.");
        location.reload();
    }
}

// the cookie permission checkbox (only shown if the user has not agreed before)
function checkConsent(id) {
    if (getCookie("cookieConsent") == "yes") {
        return true;
    }
    if (!document.getElementById(id).checked) {
        document.getElementById(id + "Error").innerHTML = "Please allow cookies so we can keep you logged in.";
        return false;
    }
    document.getElementById(id + "Error").innerHTML = "";
    return true;
}

// after login go back to the page where the user wanted to book
function afterLogin(message) {
    setCookie("cookieConsent", "yes", 365);
    alert(message);

    let returnPage = getCookie("returnPage");
    if (returnPage != "") {
        deleteCookie("returnPage");
        window.location.href = returnPage;
    } else {
        location.reload();
    }
}

function validateLoginForm() {
    let valid = true;

    if (!checkEmail("loginEmail")) valid = false;
    if (!checkConsent("loginConsent")) valid = false;
    if (getValue("loginPassword") == "") {
        showError("loginPassword", "Password is required.");
        valid = false;
    } else {
        clearError("loginPassword");
    }

    if (valid) {
        let user = getUser(getValue("loginEmail"));
        if (user == null || user.password != getValue("loginPassword")) {
            showError("loginPassword", "Wrong email or password.");
            return false;
        }

        if (document.getElementById("rememberMe").checked) {
            setCookie("rememberEmail", user.email, 30);
        } else {
            deleteCookie("rememberEmail");
        }

        loginUser(user);
        afterLogin("Welcome back, " + user.name + "!");
    }
    return false;
}

function validateRegisterForm() {
    let valid = true;

    if (!checkName("regName")) valid = false;
    if (!checkEmail("regEmail")) valid = false;
    if (!checkPhone("regPhone")) valid = false;

    let password = document.getElementById("regPassword").value;
    if (password == "") {
        showError("regPassword", "Password is required.");
        valid = false;
    } else if (!passwordPattern.test(password)) {
        showError("regPassword", "Password needs 8+ characters with uppercase, lowercase, number and special character.");
        valid = false;
    } else {
        clearError("regPassword");
    }

    let confirmPassword = document.getElementById("regConfirm").value;
    if (confirmPassword == "") {
        showError("regConfirm", "Please confirm your password.");
        valid = false;
    } else if (confirmPassword != password) {
        showError("regConfirm", "Passwords do not match.");
        valid = false;
    } else {
        clearError("regConfirm");
    }

    if (!checkTerms("regTerms")) valid = false;
    if (!checkConsent("regConsent")) valid = false;

    if (valid && getUser(getValue("regEmail")) != null) {
        showError("regEmail", "An account with this email already exists. Please login.");
        valid = false;
    }

    if (valid) {
        saveUser(getValue("regName"), getValue("regEmail"), getValue("regPhone"), password);
        loginUser(getUser(getValue("regEmail")));
        afterLogin("Account created! You are now logged in.");
    }
    return false;
}

function validateFindForm() {
    let valid = true;
    let id = getValue("findId").toUpperCase();

    if (id == "") {
        showError("findId", "Booking ID is required.");
        valid = false;
    } else if (!bookingIdPattern.test(id)) {
        showError("findId", "Booking ID looks like OCR123456 (3 letters and 6 digits).");
        valid = false;
    } else {
        clearError("findId");
    }
    if (!checkEmail("findEmail")) valid = false;

    if (valid) {
        let booking = findBooking(id);
        if (booking == null || booking.email.toLowerCase() != getValue("findEmail").toLowerCase()) {
            document.getElementById("findResult").innerHTML = "<p class='error-msg'>No booking found for these details.</p>";
        } else {
            document.getElementById("findResult").innerHTML = bookingCard(booking);
        }
    }
    return false;
}

// Show or hide the typed password when the "Show password" box is ticked
function togglePassword(id, box) {
    if (box.checked) {
        document.getElementById(id).type = "text";
    } else {
        document.getElementById(id).type = "password";
    }
}
