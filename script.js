"use strict";
const time = document.querySelector(".timer");
const cardContainers = document.querySelectorAll(".card-container");
const btn = document.querySelector(".btn");
const clicks = document.querySelector(".clicks");
let startTime = 0;
let elapsedTime = 0;
let mins = "00";
let secs = "00";
let game = false;
let intervalId;
let flippedCards = [];
let cont = 0;
let clickCounter = 0;
function updateTime() {
  elapsedTime = Date.now() - startTime;
  secs = Math.floor((elapsedTime / 1000) % 60);
  mins = Math.floor((elapsedTime / (1000 * 60)) % 60);
  secs = pad(secs);
  mins = pad(mins);
  time.textContent = `${mins}:${secs}`;
  function pad(unit) {
    return String(unit).padStart(2, "0");
  }
  if (cont === 10) {
    clearInterval(intervalId);
    game = false;
    elapsedTime = Date.now() - startTime;
  }
  console.log(time.textContent);
}
function handleCardClick() {
  if (!game) {
    game = true;
    startTime = Date.now() - elapsedTime;
    intervalId = setInterval(updateTime, 1000);
    updateTime(); // update immediately so the display shows 00:00 (or current) right away
  }
  this.classList.toggle("flip");
  flippedCards.push(this);
  removeClickEventListeners();
  clickCounter++;
  // `.label` already contains the text "Clicks:" so we only put the number here
  clicks.textContent = clickCounter;
  if (flippedCards.length === 2) {
    cardContainers.forEach((card) =>
      card.removeEventListener("click", handleCardClick)
    );
    const img1 = flippedCards[0].querySelector(".card-front img").src;
    const img2 = flippedCards[1].querySelector(".card-front img").src;
    if (img1 === img2) {
      setTimeout(() => {
        flippedCards.forEach((card) => {
          card.classList.add("flip");
        });
        flippedCards = [];
        addClickEventListenersToCards();
        removeClickEventListeners();
        cont++;
      }, 500);
    } else {
      setTimeout(() => {
        flippedCards.forEach((card) => {
          card.classList.remove("flip");
        });
        addClickEventListenersToCards();
        flippedCards = [];
      }, 500);
    }
  }
}
function addClickEventListenersToCards() {
  cardContainers.forEach((card) =>
    card.addEventListener("click", handleCardClick)
  );
}
function removeClickEventListeners() {
  cardContainers.forEach((card) => {
    if (/*card.classList.contains("matched") || */card.classList.contains("flip")) {
      card.removeEventListener("click", handleCardClick);
    } else {
      card.addEventListener("click", handleCardClick);
    }
  });
}
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
const cardsContainer = document.querySelector(".cards-section");
const cards = Array.from(document.querySelectorAll(".card"));
const shuffledCards = shuffleArray(cards);
shuffledCards.forEach((card) => {
  cardsContainer.appendChild(card);
});
cardContainers.forEach((card) =>
  card.addEventListener("click", handleCardClick)
);
btn.addEventListener("click", function () {
  clearInterval(intervalId);
  shuffleArray(cards);
  startTime = 0;
  elapsedTime = 0;
  mins = "00";
  secs = "00";
  clickCounter = 0;
  game = false;
  flippedCards = [];
  cont = 0;
  time.textContent = "00:00";
  clicks.textContent = 0;
  cardContainers.forEach((card) => {
    card.classList.remove("flip", /*"matched"*/);
  });
  addClickEventListenersToCards();
  const shuffledCards = shuffleArray(cards);
  shuffledCards.forEach((card) => {
    cardsContainer.appendChild(card);
  });
});
