// Torridal bydelsråd – litt hjelp i nettleseren. Siden fungerer også uten.
(() => {
  const MAIL = ["post", "bydel.info"].join("@");

  // Toppen får bakgrunn når man har scrollet
  const header = document.querySelector(".site-header");
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Mobilmeny
  const toggle = document.querySelector(".nav-toggle");
  const setNav = (open) => {
    header.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  };
  toggle?.addEventListener("click", () => setNav(!header.classList.contains("nav-open")));
  document.addEventListener("keydown", (e) => e.key === "Escape" && setNav(false));
  document.querySelectorAll(".main-nav a").forEach((a) => a.addEventListener("click", () => setNav(false)));

  // E-postadressen skrives ut av skriptet, så den er vanskeligere for spam-roboter å finne
  document.querySelectorAll("[data-mail]").forEach((a) => {
    const subject = a.dataset.subject ? `?subject=${encodeURIComponent(a.dataset.subject)}` : "";
    a.href = `mailto:${MAIL}${subject}`;
    a.querySelectorAll(".addr").forEach((el) => (el.textContent = MAIL));
  });
  document.querySelectorAll("[data-copy-mail]").forEach((btn) => {
    btn.hidden = !navigator.clipboard;
    btn.addEventListener("click", async () => {
      await navigator.clipboard.writeText(MAIL);
      btn.setAttribute("data-copied", "");
      setTimeout(() => btn.removeAttribute("data-copied"), 2000);
    });
  });

  // «Om 8 dager» ved neste møte
  const day = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  document.querySelectorAll("[data-countdown]").forEach((el) => {
    const when = new Date(el.dataset.countdown);
    const now = new Date();
    const days = Math.round((day(when) - day(now)) / 864e5);
    if (when < now) {
      el.textContent = el.dataset.past;
      el.classList.add("past");
    } else {
      el.textContent = days === 0 ? "I dag!" : days === 1 ? "I morgen" : `Om ${days} dager`;
    }
    el.hidden = false;
  });

  // Legg møtet i kalenderen (.ics)
  const icsText = (s) => s.replace(/([,;\\])/g, "\\$1");
  document.querySelectorAll("[data-ics]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const { title, start, end, location, file } = btn.dataset;
      const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
      const ics = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Torridal bydelsrad//NO",
        "BEGIN:VEVENT",
        `UID:${start}-${file}@bydel.info`,
        `DTSTAMP:${stamp}`,
        `DTSTART:${start}`,
        `DTEND:${end}`,
        `SUMMARY:${icsText(title)}`,
        `LOCATION:${icsText(location)}`,
        "DESCRIPTION:Styremøtene er åpne for alle innbyggere. Mer info på bydel.info",
        "END:VEVENT",
        "END:VCALENDAR",
      ].join("\r\n");
      const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
      const a = Object.assign(document.createElement("a"), { href: url, download: file });
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
  });

  // Filter og søk virker bare med skript, så de vises først nå
  document.querySelectorAll(".filters[hidden], .search[hidden]").forEach((el) => (el.hidden = false));

  // Filter på Aktuelt
  const filters = document.querySelectorAll("[data-filter]");
  filters.forEach((btn) => {
    btn.addEventListener("click", () => {
      const type = btn.dataset.filter;
      filters.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      document.querySelectorAll(".post").forEach((p) => {
        p.hidden = type !== "alle" && p.dataset.type !== type;
      });
      document.querySelectorAll(".post-year").forEach((group) => {
        group.hidden = !group.querySelector(".post:not([hidden])");
      });
    });
  });

  // Søk i referater
  const search = document.querySelector("[data-doc-search]");
  search?.addEventListener("input", () => {
    const q = search.value.trim().toLowerCase();
    let hits = 0;
    document.querySelectorAll(".doc-group").forEach((group) => {
      let groupHits = 0;
      group.querySelectorAll(".doc").forEach((doc) => {
        const match = doc.textContent.toLowerCase().includes(q);
        doc.hidden = !match;
        groupHits += match;
      });
      group.hidden = groupHits === 0;
      hits += groupHits;
    });
    document.querySelector("[data-doc-empty]").hidden = hits > 0;
  });

  // Marker hvilken paragraf man leser i vedtektene
  const tocLinks = document.querySelectorAll(".toc a");
  if (tocLinks.length && "IntersectionObserver" in window) {
    const byId = new Map([...tocLinks].map((a) => [a.hash.slice(1), a]));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          tocLinks.forEach((a) => a.classList.remove("active"));
          byId.get(entry.target.id)?.classList.add("active");
        });
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    byId.forEach((_, id) => observer.observe(document.getElementById(id)));
  }
})();
