"use strict";
const menuToggle = document.querySelector(".menu-toggle"),
  menu = document.querySelector("#menu");
function closeMenu() {
  menu.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.textContent = "Menu +";
}
menuToggle.addEventListener("click", () => {
  const open = menu.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.textContent = open ? "Close −" : "Menu +";
});
menu
  .querySelectorAll("a")
  .forEach((a) => a.addEventListener("click", closeMenu));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMenu();
});
document.querySelectorAll("[data-filter]").forEach((button) =>
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-filter]").forEach((b) => {
      const active = b === button;
      b.classList.toggle("active", active);
      b.setAttribute("aria-pressed", String(active));
    });
    document
      .querySelectorAll("[data-category]")
      .forEach(
        (p) =>
          (p.hidden =
            button.dataset.filter !== "all" &&
            p.dataset.category !== button.dataset.filter),
      );
  }),
);
const galleryPhotos = [
  {
    src: "assets/creativity-workshop.jpg",
    alt: "School students taking part in a Creativity Corner hands-on activity",
    caption: "Hands-on learning activity",
  },
  {
    src: "assets/creativity-workshop-certificate.jpg",
    alt:
      "Certificate naming Nadyah Rizky Amelia as 3D printing workshop " +
      "instructor for SMP Bintang Mulia",
    caption: "3D printing instructor certificate · 22 September 2025",
  },
];
function formatCount(value) {
  return String(value).padStart(2, "0");
}

const images = galleryPhotos.map((photo) => photo.src);
let currentImage = 0;
function showSlide(index) {
  currentImage = (index + images.length) % images.length;
  const photo = galleryPhotos[currentImage];
  const image = document.querySelector("#activity-image");
  image.src = photo.src;
  image.alt = photo.alt;
  document.querySelector("#activity-caption").textContent = photo.caption;
  document.querySelector("#slide-count").textContent =
    `${formatCount(currentImage + 1)} / ${formatCount(images.length)}`;
  document.querySelectorAll("[data-slide]").forEach((button, index) => {
    const active = index === currentImage;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}
document
  .querySelector("#prev")
  .addEventListener("click", () => showSlide(currentImage - 1));
document
  .querySelector("#next")
  .addEventListener("click", () => showSlide(currentImage + 1));
document
  .querySelectorAll("[data-slide]")
  .forEach((b) =>
    b.addEventListener("click", () => showSlide(Number(b.dataset.slide))),
  );
let touchStart = null;
const gallery = document.querySelector(".gallery-open");
gallery.addEventListener(
  "touchstart",
  (e) => (touchStart = e.changedTouches[0].screenX),
  { passive: true },
);
gallery.addEventListener(
  "touchend",
  (e) => {
    if (touchStart !== null) {
      const dx = e.changedTouches[0].screenX - touchStart;
      if (Math.abs(dx) > 45) {
        showSlide(currentImage + (dx < 0 ? 1 : -1));
        touchStart = null;
      }
    }
  },
  { passive: true },
);
const lightbox = document.querySelector("#image-dialog");
gallery.addEventListener("click", () => {
  openImage(
    images[currentImage],
    document.querySelector("#activity-image").alt,
  );
});
function openImage(source, alternative, crop) {
  const image = document.querySelector("#lightbox-image");
  const container = document.querySelector("#lightbox-crop");
  container.replaceChildren();
  image.src = source;
  image.alt = alternative;
  image.hidden = !!crop;
  container.hidden = !crop;
  if (crop) {
    const [x, y, width, height, sourceWidth] = crop;
    const frame = document.createElement("div");
    frame.className = "photo-crop";
    frame.style.setProperty("--crop-ratio", String(width / height));
    frame.style.aspectRatio = `${width} / ${height}`;
    frame.style.setProperty("--crop-offset", `${(-y / height) * 100}%`);
    frame.style.setProperty("--crop-width", `${(sourceWidth / width) * 100}%`);
    frame.style.setProperty("--crop-left", `${(-x / width) * 100}%`);
    const croppedImage = document.createElement("img");
    croppedImage.src = source;
    croppedImage.alt = alternative;
    frame.append(croppedImage);
    container.append(frame);
  }
  lightbox.showModal();
}
function activateTab(tab, focus = false) {
  document.querySelectorAll("[data-tab]").forEach((b) => {
    const active = b === tab;
    b.setAttribute("aria-selected", String(active));
    b.tabIndex = active ? 0 : -1;
    document.querySelector("#panel-" + b.dataset.tab).hidden = !active;
  });
  if (focus) tab.focus();
}
const tabs = [...document.querySelectorAll("[data-tab]")];
tabs.forEach((b, i) => {
  b.addEventListener("click", () => activateTab(b));
  b.addEventListener("keydown", (e) => {
    let n;
    if (e.key === "ArrowRight") n = (i + 1) % tabs.length;
    if (e.key === "ArrowLeft") n = (i + tabs.length - 1) % tabs.length;
    if (e.key === "Home") n = 0;
    if (e.key === "End") n = tabs.length - 1;
    if (n !== undefined) {
      e.preventDefault();
      activateTab(tabs[n], true);
    }
  });
});
const track = document.querySelector(".credential-track");
const credentialToggle = document.querySelector("#cert-toggle");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
let autoCredentials = !reducedMotion.matches,
  credentialsVisible = false,
  credentialHover = false,
  credentialPointer = false,
  credentialResumeAt = 0;
function syncCredentialControl() {
  credentialToggle.textContent = autoCredentials ? "Pause" : "Play";
  credentialToggle.setAttribute("aria-pressed", String(autoCredentials));
  credentialToggle.setAttribute(
    "aria-label",
    autoCredentials
      ? "Pause automatic credential slideshow"
      : "Start automatic credential slideshow",
  );
}
function scrollCredentials(direction, manual = true) {
  const card = track.querySelector(".credential"),
    max = track.scrollWidth - track.clientWidth;
  if (max <= 1) return;
  const step =
    card.getBoundingClientRect().width +
    parseFloat(getComputedStyle(track).columnGap || 24);
  let next = track.scrollLeft + direction * step;
  if (direction > 0 && track.scrollLeft >= max - 3) next = 0;
  if (direction < 0 && track.scrollLeft <= 3) next = max;
  track.scrollTo({
    left: Math.max(0, Math.min(max, next)),
    behavior: reducedMotion.matches ? "instant" : "smooth",
  });
  if (manual) credentialResumeAt = Date.now() + 8000;
}
syncCredentialControl();
credentialToggle.addEventListener("click", () => {
  autoCredentials = !autoCredentials;
  syncCredentialControl();
  credentialResumeAt = Date.now() + 4000;
});
document
  .querySelector("#cert-prev")
  .addEventListener("click", () => scrollCredentials(-1));
document
  .querySelector("#cert-next")
  .addEventListener("click", () => scrollCredentials(1));
track.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
    e.preventDefault();
    scrollCredentials(e.key === "ArrowRight" ? 1 : -1);
  }
});
track.addEventListener("pointerenter", (e) => {
  if (e.pointerType === "mouse") credentialHover = true;
});
track.addEventListener("pointerleave", () => {
  credentialHover = false;
});
track.addEventListener("pointerdown", () => {
  credentialPointer = true;
  credentialResumeAt = Date.now() + 8000;
});
addEventListener("pointerup", () => {
  if (credentialPointer) credentialResumeAt = Date.now() + 8000;
  credentialPointer = false;
});
addEventListener("pointercancel", () => {
  credentialPointer = false;
});
track.addEventListener(
  "wheel",
  () => {
    credentialResumeAt = Date.now() + 8000;
  },
  { passive: true },
);
if ("IntersectionObserver" in window) {
  new IntersectionObserver(
    (entries) => {
      credentialsVisible = entries[0].isIntersecting;
    },
    { threshold: 0.25 },
  ).observe(track);
} else {
  credentialsVisible = true;
}
reducedMotion.addEventListener("change", () => {
  autoCredentials = !reducedMotion.matches;
  syncCredentialControl();
});
setInterval(() => {
  const focusInSection =
    document
      .querySelector("#certifications")
      .contains(document.activeElement) &&
    document.activeElement !== credentialToggle;
  if (
    autoCredentials &&
    credentialsVisible &&
    !credentialHover &&
    !credentialPointer &&
    !focusInSection &&
    !document.hidden &&
    !document.querySelector("dialog[open]") &&
    Date.now() >= credentialResumeAt
  )
    scrollCredentials(1, false);
}, 4000);
const projectData = {
  nips: {
    type: "FINAL-YEAR PROJECT · JAN – JUL 2026",
    title: "Inline Snort 3 Intrusion Prevention System",
    intro:
      "The lab used three virtual machines: an attacker, an inline NIPS " +
      "sensor, and a target. Traffic passed through the sensor before " +
      "reaching the target.",
    work: [
      "Set up the attacker and target on separate IP subnets, with the " +
        "sensor forwarding traffic between them.",
      "Connected AE-MLP detection to Snort 3, IP-based blocking, InfluxDB, and Grafana.",
      "Repeated five attack scenarios and checked blocking, throughput, " +
        "jitter, packet loss, CPU usage, and memory usage.",
    ],
    note:
      "Tests of the held-out Infiltration class showed limited " +
      "generalization. Results after live-traffic adaptation were " +
      "evaluated separately.",
    url: "https://drive.google.com/file/d/1bIea4sLnDBUyMxeH1oNc2-vrYyur27As/view?usp=drivesdk",
    link: "Read the final project report",
    image: "assets/nips-dashboard.png",
    imageAlt: "Grafana dashboard showing traffic, detections and blocked IPs",
  },
  irrigation: {
    type: "COMMUNITY SERVICE LEARNING · AUG 2024",
    title: "Smart Irrigation & Monitoring System",
    intro:
      "This project was developed during Community Service Learning in " +
      "Arjasari, Bandung. The prototype combined sensor readings, an LCD " +
      "display, and automated watering.",
    work: [
      "Worked on the Arduino-based watering and monitoring system.",
      "Connected the sensor readings to an LCD display.",
      "Programmed the watering control.",
    ],
    url: "https://drive.google.com/file/d/1WFMWQ4sZDW9gwKVkjBlMcHLRXYjlERMd/view?usp=drivesdk",
    link: "View the CSL participation certificate",
    image: "assets/irrigation-prototype.jpg",
    imageAlt: "CSL 2024 team with the irrigation prototype and project poster",
  },
  paper: {
    type: "ICITACEE 2026 · SEP 2026",
    title: "Conference Paper & Presentation",
    intro:
      "Experimental Evaluation of an Inline Snort 3 NIPS with AE-MLP-Based Detection.",
    workHeading: "Conference presentation",
    work: [
      "Presented at the 13th International Conference on Information " +
        "Technology, Computer, and Electrical Engineering.",
      "Explained the lab network, detection method, and experimental results.",
    ],
    url: "https://drive.google.com/file/d/17ZVcVDwt3K4qssotyzfk6g6BLQHkdkT1/view?usp=drivesdk",
    link: "View the presenter certificate",
    image: "assets/icitacee-certificate.jpg",
    imageAlt: "ICITACEE presenter certificate for Nadyah Rizky Amelia",
  },
  miot: {
    type: "COURSE PROJECT · 2025 · TEAM OF FOUR",
    title: "IoT Waste Sorting & Capacity Monitoring",
    intro:
      "Our team built this prototype for the Microprocessors and Internet " +
      "of Things course. Two ESP32 boards coordinated the sorting mechanism " +
      "and bin-capacity monitoring.",
    workHeading: "Team implementation",
    work: [
      "ESP32 A reads the IR and moisture sensors, sends a wet/dry " +
        "classification, and controls the gate servo.",
      "ESP32 B positions the sorting mechanism with a stepper motor and " +
        "asks the servo to open. After sorting, it returns to its starting " +
        "position.",
      "Ultrasonic sensors measure the fill level in each bin. The readings " +
        "are sent through HiveMQ and displayed in MyMQTT on a phone.",
    ],
    note:
      "The sorter uses a moisture threshold, so it distinguishes wet " +
      "and dry waste rather than recognizing materials. The report does " +
      "not give a measured sorting accuracy.",
    url: "https://www.youtube.com/watch?v=kEnDhUGFzis",
    link: "Watch the project demo",
    image: "assets/miot-interior.png",
    imageAlt: "ESP32 wiring and sorting mechanism inside the waste sorter",
  },
};
// Build project details as readable elements instead of one long HTML string.
const dialog = document.querySelector("#project-dialog");

function renderProjectDetails(projectKey) {
  const project = projectData[projectKey];
  const content = document.createElement("div");
  content.className = "dialog-content";

  function appendText(tag, text, className) {
    const element = document.createElement(tag);
    element.textContent = text;
    if (className) element.className = className;
    content.append(element);
    return element;
  }

  appendText("p", project.type, "eyebrow");
  const title = appendText("h2", project.title);
  title.id = "dialog-title";
  appendText("p", project.intro);
  appendText("h3", project.workHeading || "Implementation details");

  const list = document.createElement("ul");
  project.work.forEach((text) => {
    const item = document.createElement("li");
    item.textContent = text;
    list.append(item);
  });
  content.append(list);

  if (project.note) {
    appendText("h3", "Evaluation scope");
    appendText("p", project.note);
  }

  if (project.url) {
    const link = appendText("a", `${project.link} ↗`);
    link.href = project.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  }

  function appendImage(source, alternative, heading) {
    if (heading) appendText("h3", heading);
    const image = document.createElement("img");
    image.src = source;
    image.alt = alternative;
    content.append(image);
  }

  if (project.image) {
    appendImage(
      project.image,
      project.imageAlt || project.title,
      projectKey === "nips" ? "01 / Monitoring" : null,
    );
  }

  if (projectKey === "nips") {
    appendImage(
      "assets/nips-topology.png",
      "Three-VM attacker, inline NIPS sensor and target network topology",
      "02 / Network topology",
    );
  }

  if (projectKey === "irrigation") {
    appendImage(
      "assets/irrigation-field.jpg",
      "CSL 2024 team at the Arjasari farm",
      "02 / Field activity",
    );
  }

  document.querySelector("#dialog-content").replaceChildren(content);
}

document.querySelectorAll("[data-project]").forEach((button) => {
  button.addEventListener("click", () => {
    renderProjectDetails(button.dataset.project);
    dialog.showModal();
  });
});

document.querySelectorAll("dialog").forEach((d) => {
  d.querySelector(".dialog-close").addEventListener("click", () => d.close());
  d.addEventListener("click", (e) => {
    if (e.target === d) {
      const r = d.getBoundingClientRect();
      if (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      )
        d.close();
    }
  });
});
document.querySelector(".copy-email").addEventListener("click", async () => {
  const status = document.querySelector("#copy-status");
  try {
    await navigator.clipboard.writeText("nadyahrxa@gmail.com");
    status.textContent = "Email copied";
  } catch {
    status.textContent = "nadyahrxa@gmail.com";
  }
});
const progress = document.querySelector(".scroll-progress"),
  backTop = document.querySelector(".back-top");
function onScroll() {
  const total = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = (total > 0 ? (scrollY / total) * 100 : 0) + "%";
  backTop.classList.toggle("visible", scrollY > 600);
}
addEventListener("scroll", onScroll, { passive: true });
addEventListener("resize", onScroll);
onScroll();
backTop.addEventListener("click", () =>
  scrollTo({
    top: 0,
    behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "instant"
      : "smooth",
  }),
);
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("revealed");
          observer.unobserve(e.target);
        }
      }),
    { threshold: 0.05 },
  );
  document
    .querySelectorAll(
      ".about,.project,.skill-grid>div,.experience-row,.gallery-layout",
    )
    .forEach((el) => {
      el.classList.add("reveal");
      observer.observe(el);
    });
  document.documentElement.classList.add("motion-ready");
  const navObserver = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting)
          menu
            .querySelectorAll("a")
            .forEach((a) =>
              a.setAttribute(
                "aria-current",
                String(a.hash === "#" + e.target.id),
              ),
            );
      }),
    { rootMargin: "-10% 0px -65% 0px" },
  );
  document
    .querySelectorAll("section[id]")
    .forEach((el) => navObserver.observe(el));
}

const miotPhotos = [
  {
    src: "assets/miot-prototype.png",
    alt: "ESP32 waste sorting prototype from the team report",
    caption: "01 / Prototype · Completed waste sorter",
  },
  {
    src: "assets/miot-interior.png",
    alt: "Interior of the team waste sorter with ESP32 boards and the sorting mechanism",
    caption: "02 / Mechanism · ESP32 wiring and sorting mechanism",
  },
  {
    src: "assets/miot-monitoring.png",
    alt: "MyMQTT phone application showing received wet and dry bin fill-level messages",
    caption: "03 / Monitoring · Bin fill-level messages in MyMQTT",
  },
];
document.querySelectorAll("[data-miot-shot]").forEach((button) =>
  button.addEventListener("click", () => {
    const selected = miotPhotos[Number(button.dataset.miotShot)];
    const img = document.querySelector("#miot-photo");
    img.src = selected.src;
    img.alt = selected.alt;
    const opener = document.querySelector("#miot-photo-open");
    opener.dataset.photo = selected.src;
    opener.setAttribute("aria-label", "Enlarge image: " + selected.alt);
    document.querySelector("#miot-caption").textContent = selected.caption;
    document.querySelectorAll("[data-miot-shot]").forEach((b) => {
      const active = b === button;
      b.classList.toggle("active", active);
      b.setAttribute("aria-pressed", String(active));
    });
  }),
);

// Screenshot frames remove social-media UI without altering the original photos.
document.querySelectorAll("[data-photo]").forEach((button) => {
  button.addEventListener("click", () => {
    const alt =
      button.querySelector("img")?.alt ||
      button.getAttribute("aria-label") ||
      "Photo";
    const crop = button.dataset.crop ? JSON.parse(button.dataset.crop) : null;
    openImage(button.dataset.photo, alt, crop);
  });
});

// Final-year project: monitoring and topology are separate, labeled views.
const nipsPhotos = [
  {
    src: "assets/nips-dashboard.png",
    alt: "Grafana monitoring dashboard showing network traffic, detections and blocked IPs",
    caption: "01 / Monitoring · Grafana traffic, detections and blocked IPs",
  },
  {
    src: "assets/nips-topology.png",
    alt: "Three-VM attacker, inline NIPS sensor and target network topology",
    caption: "02 / Topology · Attacker, inline NIPS sensor and target",
  },
];
document.querySelectorAll("[data-nips-shot]").forEach((button) => {
  button.addEventListener("click", () => {
    const selected = nipsPhotos[Number(button.dataset.nipsShot)];
    const image = document.querySelector("#nips-photo");
    image.src = selected.src;
    image.alt = selected.alt;
    const opener = document.querySelector("#nips-photo-open");
    opener.dataset.photo = selected.src;
    opener.setAttribute("aria-label", "Enlarge image: " + selected.alt);
    document.querySelector("#nips-caption").textContent = selected.caption;
    document.querySelectorAll("[data-nips-shot]").forEach((tab) => {
      tab.setAttribute("aria-pressed", String(tab === button));
    });
  });
});

// Visible range and progress follow manual browsing and automatic scrolling.
function updateCredentialPosition() {
  const cards = [...track.querySelectorAll(".credential")];
  const bounds = track.getBoundingClientRect();
  const visible = cards
    .map((card, index) => ({ index, box: card.getBoundingClientRect() }))
    .filter(
      ({ box }) => box.left >= bounds.left - 2 && box.left < bounds.right - 20,
    );
  if (!visible.length) return;
  const first = visible[0].index + 1;
  const last = visible[visible.length - 1].index + 1;
  const visibleRange =
    first === last
      ? formatCount(first)
      : `${formatCount(first)}–${formatCount(last)}`;
  document.querySelector("#credential-position").textContent =
    `${visibleRange} / ${formatCount(cards.length)}`;
  const fraction = (track.scrollLeft + track.clientWidth) / track.scrollWidth;
  document.querySelector("#credential-progress-fill").style.transform =
    `scaleX(${Math.min(1, fraction)})`;
}
track.addEventListener("scroll", updateCredentialPosition, { passive: true });
addEventListener("resize", updateCredentialPosition);
updateCredentialPosition();

// Smart Irrigation: both the prototype and original farm photo are retained.
const irrigationPhotos = [
  {
    src: "assets/irrigation-prototype.jpg",
    alt: "CSL 2024 team with the irrigation prototype and project poster",
    caption: "01 / Prototype · Team and project display",
  },
  {
    src: "assets/irrigation-field.jpg",
    alt: "CSL 2024 team at the Arjasari farm",
    caption: "02 / Field activity · Arjasari farm visit",
  },
];
document.querySelectorAll("[data-irrigation-shot]").forEach((button) => {
  button.addEventListener("click", () => {
    const selected = irrigationPhotos[Number(button.dataset.irrigationShot)];
    const image = document.querySelector("#irrigation-photo");
    image.src = selected.src;
    image.alt = selected.alt;
    const opener = document.querySelector("#irrigation-photo-open");
    opener.dataset.photo = selected.src;
    opener.setAttribute("aria-label", "Enlarge image: " + selected.alt);
    document.querySelector("#irrigation-caption").textContent =
      selected.caption;
    document
      .querySelectorAll("[data-irrigation-shot]")
      .forEach((tab) =>
        tab.setAttribute("aria-pressed", String(tab === button)),
      );
  });
});

// All multi-image galleries share the same timing and reading controls.
function startPhotoSlideshow(root, advance) {
  let enabled = !reducedMotion.matches;
  let hovered = false;
  let resumeAt = Date.now() + 4000;
  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "photo-autoplay-toggle";
  function sync() {
    toggle.textContent = enabled ? "Pause" : "Play";
    toggle.setAttribute("aria-pressed", String(enabled));
    toggle.setAttribute(
      "aria-label",
      `${enabled ? "Pause" : "Start"} automatic photo slideshow`,
    );
  }
  sync();
  root.append(toggle);
  toggle.addEventListener("click", () => {
    enabled = !enabled;
    resumeAt = Date.now() + 4000;
    sync();
  });
  root.addEventListener("pointerenter", (event) => {
    if (event.pointerType === "mouse") hovered = true;
  });
  root.addEventListener("pointerleave", () => {
    hovered = false;
  });
  root.addEventListener("pointerdown", () => {
    resumeAt = Date.now() + 8000;
  });
  root.addEventListener("keydown", () => {
    resumeAt = Date.now() + 8000;
  });
  reducedMotion.addEventListener("change", () => {
    enabled = !reducedMotion.matches;
    sync();
  });
  setInterval(() => {
    const bounds = root.getBoundingClientRect();
    const focused =
      root.contains(document.activeElement) &&
      document.activeElement !== toggle;
    if (
      !enabled ||
      hovered ||
      focused ||
      document.hidden ||
      [...document.querySelectorAll("dialog[open]")].some(
        (openDialog) => openDialog !== root.closest("dialog"),
      ) ||
      root.closest("[hidden]") ||
      bounds.bottom <= 0 ||
      bounds.top >= innerHeight ||
      Date.now() < resumeAt
    )
      return;
    advance();
    resumeAt = Date.now() + 4000;
  }, 500);
}

["nips", "miot", "irrigation"].forEach((name) => {
  const buttons = [...document.querySelectorAll(`[data-${name}-shot]`)];
  const root = buttons[0].closest(".project-gallery");
  startPhotoSlideshow(root, () => {
    const current = buttons.findIndex(
      (button) => button.getAttribute("aria-pressed") === "true",
    );
    buttons[(current + 1) % buttons.length].click();
  });
});
startPhotoSlideshow(document.querySelector(".volunteer-gallery"), () =>
  showSlide(currentImage + 1),
);

// Keep each experience's photos together, including its original crop frames.
document.querySelectorAll(".experience-photos").forEach((root) => {
  const photos = [...root.querySelectorAll(":scope > .experience-photo")];
  if (photos.length < 2) return;
  root.classList.add("experience-slideshow");
  const controls = document.createElement("div");
  controls.className = "photo-slide-controls";
  const previous = document.createElement("button");
  previous.type = "button";
  previous.textContent = "←";
  previous.setAttribute("aria-label", "Previous photo");
  const count = document.createElement("span");
  const next = document.createElement("button");
  next.type = "button";
  next.textContent = "→";
  next.setAttribute("aria-label", "Next photo");
  controls.append(previous, count, next);
  root.append(controls);
  let current = 0;
  function show(index) {
    current = (index + photos.length) % photos.length;
    photos.forEach((photo, i) => {
      photo.hidden = i !== current;
    });
    count.textContent = `${formatCount(current + 1)} / ${formatCount(photos.length)}`;
  }
  previous.addEventListener("click", () => show(current - 1));
  next.addEventListener("click", () => show(current + 1));
  let startX = null;
  root.addEventListener(
    "touchstart",
    (event) => {
      startX = event.changedTouches[0].screenX;
    },
    { passive: true },
  );
  root.addEventListener(
    "touchend",
    (event) => {
      if (startX === null) return;
      const distance = event.changedTouches[0].screenX - startX;
      if (Math.abs(distance) > 45) show(current + (distance < 0 ? 1 : -1));
      startX = null;
    },
    { passive: true },
  );
  show(0);
  startPhotoSlideshow(root, () => show(current + 1));
});

// Award details follow the same compact entry / detail pattern as publications.
document.querySelector("#open-award").addEventListener("click", () => {
  document.querySelector("#award-dialog").showModal();
});
