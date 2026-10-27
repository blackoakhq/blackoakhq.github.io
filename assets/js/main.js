/* Black Oak Creative Studio — site behaviour */
(function () {
  "use strict";

  var EMAIL = "adamsharmedia@gmail.com";

  /* Header: solid background once the page scrolls */
  var header = document.querySelector("[data-header]");
  function onScroll() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 24);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* Mobile menu */
  var toggle = document.querySelector(".nav__toggle");
  var menu = document.getElementById("menu");
  function setMenu(open) {
    if (!toggle || !menu) return;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
  }
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setMenu(false);
    });
    window.matchMedia("(min-width: 1101px)").addEventListener("change", function (e) {
      if (e.matches) setMenu(false);
    });
  }

  /* Services dropdown: opens on hover via CSS; the chevron button toggles it for keyboard and touch */
  var subs = document.querySelectorAll(".has-sub");
  function closeSubs(except) {
    subs.forEach(function (item) {
      if (item === except) return;
      item.classList.remove("is-open");
      item.querySelector(".sub-toggle").setAttribute("aria-expanded", "false");
    });
  }
  subs.forEach(function (item) {
    var btn = item.querySelector(".sub-toggle");
    btn.addEventListener("click", function () {
      var open = !item.classList.contains("is-open");
      closeSubs(item);
      item.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", String(open));
    });
  });
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".has-sub")) closeSubs();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    var open = document.querySelector(".has-sub.is-open");
    if (open) {
      closeSubs();
      open.querySelector(".sub-toggle").focus();
    }
  });

  /* Reveal on scroll */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* Footer year */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* Consultation form.
     Set data-endpoint on the form (e.g. a Formspree URL) to post submissions;
     without one, it opens the visitor's email app with the request filled in. */
  var form = document.querySelector("[data-contact-form]");
  if (form) {
    var status = form.querySelector("[data-form-status]");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      var data = new FormData(form);
      var endpoint = form.getAttribute("data-endpoint");

      if (endpoint) {
        status.textContent = "Sending…";
        fetch(endpoint, { method: "POST", body: data, headers: { Accept: "application/json" } })
          .then(function (res) {
            if (!res.ok) throw new Error(res.status);
            form.reset();
            status.textContent = "Thank you — we've received your request and will be in touch shortly.";
          })
          .catch(function () {
            status.textContent = "Something went wrong. Please email " + EMAIL + " or text 732-991-0284.";
          });
        return;
      }

      var services = data.getAll("services").join(", ") || "Not sure yet";
      var body = [
        "Name: " + data.get("name"),
        "Business: " + (data.get("business") || "—"),
        "Email: " + data.get("email"),
        "Phone: " + (data.get("phone") || "—"),
        "Interested in: " + services,
        "Best way to reach me: " + data.get("preferred"),
        "",
        data.get("message") || ""
      ].join("\n");
      var subject = "Free consultation — " + (data.get("business") || data.get("name"));
      window.location.href = "mailto:" + EMAIL +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);
      status.textContent = "Opening your email app… If nothing happens, email " + EMAIL + " directly.";
    });
  }
})();
